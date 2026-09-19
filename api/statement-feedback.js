let cachedModels = null

function clean(value) {
  return typeof value === 'string' ? value.slice(0, 4000) : ''
}

function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return JSON.parse(fenced ? fenced[1] : text)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.GEMINI_API_KEY) return response.status(500).json({ error: 'GrowthGrind AI is not configured yet.' })

  const answers = Array.isArray(request.body?.answers) ? request.body.answers.map(clean).slice(0, 3) : []
  const course = clean(request.body?.course)
  const multiCourse = request.body?.multiCourse === true
  const experiences = Array.isArray(request.body?.experiences) ? request.body.experiences.slice(0, 12).map((item) => ({ title: clean(item.title).slice(0, 160), subjects: Array.isArray(item.subjects) ? item.subjects.slice(0, 6).map(clean) : [], evidence: clean(item.evidence).slice(0, 600), reflection: clean(item.reflection).slice(0, 600), outcome: clean(item.outcome).slice(0, 400) })).filter((item) => item.title) : []
  const draft = answers.join('\n\n').trim()
  if (draft.length < 40) return response.status(400).json({ error: 'Please write a little more before asking for feedback.' })

  const prompt = `You are a careful UK university-application writing coach. Review a student's own UCAS personal-statement answers. Do not rewrite passages, generate submit-ready prose, claim to detect AI, score admission chances, or make admissions promises. Keep their authentic voice central.${multiCourse ? ' This student is applying across more than one related course. Use live web search only for current official UCAS guidance or official course pages where genuinely helpful. Focus feedback on whether the statement creates a coherent academic thread across all courses without becoming unfocused, and name official sources checked.' : ''}
Return valid JSON only:
{"summary":"","strengths":[""],"flags":[{"question":1,"type":"Grammar & expression|Clarity|Cliche or generic writing|Evidence|Reflection|Specificity|Show, don’t tell|Repetition|Relevance|Academic depth|Supercurricular focus|Connection|Weak sentence|Conciseness|Opening or ending|Course alignment|Formulaic voice warning","excerpt":"short exact excerpt only","advice":"specific question or improvement direction without rewriting it","priority":"high|medium|low"}],"connections":[""],"nextSteps":[""]}
Give 2-3 genuine strengths, at most 9 flags, up to 3 connections, and 3 next steps. Set question to 1, 2 or 3 for the answer containing the issue. Grammar flags must be real. Flag cliches only if genuinely generic. For evidence/reflection, ask what the student did, thought, learned or changed. For academic depth, ask them to engage with an idea rather than name-drop a source. Formulaic voice is a warning about generic or over-polished phrasing, never an AI verdict. The intended course${multiCourse ? 's' : ''} ${multiCourse ? 'are' : 'is'}: ${course || 'not provided'}.
Student answers:\n${answers.map((answer, index) => `Question ${index + 1}: ${answer}`).join('\n\n')}`
${experiences.length ? `\nApproved Tracker evidence (use only to identify possible authentic connections; never invent an achievement):\n${experiences.map((item) => `${item.title}: ${item.evidence} ${item.reflection} ${item.outcome}`).join('\n')}` : ''}`

  try {
    if (!cachedModels) {
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
      if (!listResponse.ok) throw new Error(`Gemini model discovery returned ${listResponse.status}`)
      const list = await listResponse.json()
      cachedModels = (list.models || [])
        .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model) => model.name?.replace(/^models\//, ''))
        .filter(Boolean)
        .sort((first, second) => (/flash-lite/i.test(first) ? 0 : /flash/i.test(first) ? 1 : 2) - (/flash-lite/i.test(second) ? 0 : /flash/i.test(second) ? 1 : 2))
    }

    let payload
    let lastStatus
    for (const model of cachedModels) {
      const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], ...(multiCourse ? { tools: [{ google_search: {} }] } : {}), generationConfig: { temperature: 0.2, maxOutputTokens: 900, responseMimeType: 'application/json' } }),
      })
      if (result.ok) {
        payload = await result.json()
        break
      }
      lastStatus = result.status
    }
    if (!payload) throw new Error(`Gemini returned ${lastStatus}`)
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no feedback.')
    return response.status(200).json(parseJson(text))
  } catch (error) {
    console.error('Statement feedback error:', error)
    return response.status(502).json({ error: 'We could not review this right now. Please try again shortly.' })
  }
}
