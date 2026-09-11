let cachedModels = null

const specialists = {
  general: 'General GrowthGrind assistant. Help with any student opportunity, university exploration, application planning, or academic-development question. If a specialist chat would help, say which one and why.',
  courses: 'University & Course Finder. Help students explore course areas and UK universities to investigate. Never promise admission or invent entry requirements; suggest official sources to verify.',
  admissions: 'Admissions Advisor. Help students plan a realistic UK admissions strategy, including experiences to develop and official details to verify.',
  statement: 'Personal Statement Guidance. Help students reflect on their own experiences and develop ideas. Do not write submit-ready personal statements or impersonate their voice.',
  tests: 'Admissions Test Support. Help identify tests to investigate and sensible preparation steps. Policies vary and must be checked on official course pages.',
  career: 'Career Explorer. Help students explore career paths and degree routes without presenting any outcome as guaranteed.',
  research: 'Research Project Builder. Help students frame an ethical, manageable independent project. Do not fabricate citations or write a finished project.',
}

function clean(message) {
  return typeof message === 'string' ? message.trim().slice(0, 2000) : ''
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.GEMINI_API_KEY) return response.status(500).json({ error: 'GrowthGrind AI is not configured yet.' })

  const specialist = specialists[request.body?.specialist]
  const history = Array.isArray(request.body?.messages) ? request.body.messages.slice(-14) : []
  const message = clean(request.body?.message)
  if (!specialist || !message) return response.status(400).json({ error: 'Please write a message first.' })

  const transcript = history
    .filter((item) => ['user', 'assistant'].includes(item?.role) && clean(item?.content))
    .map((item) => `${item.role === 'user' ? 'Student' : 'GrowthGrind AI'}: ${clean(item.content)}`)
    .join('\n\n')

  const prompt = `You are GrowthGrind AI, a supportive, concise assistant for UK school students. You are in the ${specialist} workspace. ${specialist}
Keep responses practical and readable. Ask one useful follow-up question when needed. Do not state unverified requirements as facts, guarantee outcomes, or replace qualified professional advice.

Conversation so far:
${transcript}

Student: ${message}

GrowthGrind AI:`

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
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 450 } }),
      })
      if (result.ok) {
        payload = await result.json()
        break
      }
      lastStatus = result.status
    }
    if (!payload) throw new Error(`Gemini returned ${lastStatus}`)
    const reply = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!reply) throw new Error('Gemini returned no response.')
    return response.status(200).json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return response.status(502).json({ error: 'GrowthGrind AI could not reply right now. Please try again shortly.' })
  }
}
