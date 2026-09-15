const MAX_FIELD_LENGTH = 1200
let cachedModels = null

const tools = {
  admissions: {
    title: 'Admissions strategy',
    instruction: 'Create a practical UK admissions audit. Separate genuine current strengths from evidence that needs developing and urgent official checks. Consider course fit, predicted grades, relevant subjects, supercurricular evidence and planned choices. Never promise admission, rank a student, or invent requirements.',
  },
  statement: {
    title: 'Personal statement reflection',
    instruction: 'Help the student reflect on their own experiences for a UK university application. Do not write a personal statement, rewrite their voice, or provide submit-ready prose. Identify themes, evidence, and reflective questions.',
  },
  tests: {
    title: 'Admissions test explorer',
    instruction: 'Help the student identify admissions tests they may need to investigate based on their intended course and universities. State that tests and policies change and must be verified on official course pages. Give a balanced preparation plan, not test answers.',
  },
  career: {
    title: 'Career pathways explorer',
    instruction: 'Suggest broad career pathways and related degree routes to explore. Do not claim a degree guarantees a career. Focus on what the student enjoys, strengths, and low-risk ways to explore each option.',
  },
  research: {
    title: 'Research project builder',
    instruction: 'Help the student design an ethical, manageable independent research project. Offer a focused research question, scope, simple method, source types to search for, and milestones. Do not fabricate sources or produce a finished project.',
  },
}

function clean(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : ''
}

function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return JSON.parse(fenced ? fenced[1] : text)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.GEMINI_API_KEY) return response.status(500).json({ error: 'AI is not configured yet.' })

  const tool = tools[request.body?.tool]
  const details = Object.fromEntries(
    Object.entries(request.body?.details || {}).map(([key, value]) => [key, clean(value)])
  )
  if (!tool || !Object.values(details).some(Boolean)) {
    return response.status(400).json({ error: 'Please add a little information before continuing.' })
  }

  const admissionsAudit = request.body?.tool === 'admissions'
  const statementPlan = request.body?.tool === 'statement'
  const prompt = `You are GrowthGrind's ${tool.title} assistant for UK school students. ${tool.instruction}
Return valid JSON only:
${admissionsAudit
  ? '{"summary":"","strengths":[""],"develop":[""],"urgentChecks":[""],"nextAction":"","questionsToConsider":[""]}'
  : statementPlan
    ? '{"summary":"","themes":[""],"evidenceToDevelop":[""],"reflectionPrompts":[""],"nextAction":""}'
  : '{"summary":"","sections":[{"title":"","points":[""]}],"nextSteps":[""],"questionsToConsider":[""]}'}
${admissionsAudit
  ? 'Include 2 or 3 concise points in each list. Strengths must be grounded in the student information, not generic praise. Urgent checks must be official things to verify. Make nextAction one specific task the student can complete this week.'
  : statementPlan
    ? 'Include 2 or 3 concise themes, evidence gaps and reflection prompts. Do not write or rewrite application prose. Make nextAction one concrete planning task the student can do in their own words.'
  : 'Include 3 sections, each with 2 or 3 concise points, and 3 nextSteps.'} Be clear, supportive and honest about uncertainty.
Student information: ${JSON.stringify(details)}`

  try {
    if (!cachedModels) {
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
      if (!listResponse.ok) throw new Error(`Gemini model discovery returned ${listResponse.status}`)
      const list = await listResponse.json()
      const available = (list.models || [])
        .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model) => model.name?.replace(/^models\//, ''))
        .filter(Boolean)
      cachedModels = [...available.filter((model) => /flash/i.test(model)), ...available.filter((model) => !/flash/i.test(model))]
    }

    let payload
    let lastStatus
    for (const model of cachedModels) {
      const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, responseMimeType: 'application/json' },
        }),
      })
      if (result.ok) {
        payload = await result.json()
        break
      }
      lastStatus = result.status
    }
    if (!payload) throw new Error(`Gemini returned ${lastStatus}`)
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no response.')
    return response.status(200).json(parseJson(text))
  } catch (error) {
    console.error('Premium AI error:', error)
    return response.status(502).json({ error: 'We could not generate guidance right now. Please try again shortly.' })
  }
}
