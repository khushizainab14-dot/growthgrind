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

function cleanAttachment(attachment) {
  if (!attachment || typeof attachment !== 'object') return null
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  const mimeType = attachment.mimeType
  const data = typeof attachment.data === 'string' ? attachment.data : ''
  if (!allowedTypes.includes(mimeType) || !data || data.length > 4.2 * 1024 * 1024) return null
  return { mimeType, data }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.GEMINI_API_KEY) return response.status(500).json({ error: 'GrowthGrind AI is not configured yet.' })

  const specialist = specialists[request.body?.specialist]
  const history = Array.isArray(request.body?.messages) ? request.body.messages.slice(-14) : []
  const message = clean(request.body?.message)
  const attachment = cleanAttachment(request.body?.attachment)
  const shouldStream = request.body?.stream === true
  if (!specialist || !message) return response.status(400).json({ error: 'Please write a message first.' })
  if (request.body?.attachment && !attachment) return response.status(400).json({ error: 'That attachment is not supported or is too large.' })

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
    const parts = [{ text: attachment ? `${prompt}\n\nThe student attached a file. Analyse it only in relation to their question, point out uncertainty, and do not repeat unnecessary personal details.` : prompt }]
    if (attachment) parts.push({ inlineData: attachment })

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
      const endpoint = shouldStream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.35, maxOutputTokens: 450 } }),
      })
      if (result.ok) {
        if (shouldStream) {
          response.status(200)
          response.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
          response.setHeader('Cache-Control', 'no-cache, no-transform')
          response.setHeader('Connection', 'keep-alive')
          response.flushHeaders?.()
          const reader = result.body?.getReader()
          if (!reader) throw new Error('Gemini streaming is unavailable.')
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            response.write(new TextDecoder().decode(value))
          }
          response.write('data: [DONE]\n\n')
          return response.end()
        }
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
