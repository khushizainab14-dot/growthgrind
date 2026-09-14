let cachedModels = null

const clean = (value) => typeof value === 'string' ? value.trim().slice(0, 300) : ''

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.GEMINI_API_KEY) return response.status(500).json({ error: 'GrowthGrind AI is not configured yet.' })

  const activity = request.body?.activity || {}
  const next = request.body?.nextOpportunity || {}
  const activityTitle = clean(activity.title)
  const nextTitle = clean(next.title)
  if (!activityTitle || !nextTitle) return response.status(400).json({ error: 'Choose a tracked activity and a next opportunity.' })

  const prompt = `You are GrowthGrind AI. Explain, in two short plain-text sentences, why a student could reasonably connect one tracked activity to a possible next opportunity in a personal-development story. Do not make up achievements, claim that the opportunity guarantees any outcome, or use Markdown symbols. Focus on a shared interest, subject, skill, or a sensible progression. End with one practical action the student could take.

Tracked activity: ${activityTitle}; category: ${clean(activity.category)}; type: ${clean(activity.type)}; subjects: ${(activity.subjects || []).join(', ')}.
Possible next opportunity: ${nextTitle}; category: ${clean(next.category)}; type: ${clean(next.type)}; subjects: ${(next.subjects || []).join(', ')}.

GrowthGrind explanation:`

  try {
    if (!cachedModels) {
      const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
      if (!list.ok) throw new Error(`Gemini model discovery returned ${list.status}`)
      const data = await list.json()
      cachedModels = (data.models || []).filter((model) => model.supportedGenerationMethods?.includes('generateContent')).map((model) => model.name?.replace(/^models\//, '')).filter(Boolean).sort((a, b) => (/flash-lite/i.test(a) ? 0 : /flash/i.test(a) ? 1 : 2) - (/flash-lite/i.test(b) ? 0 : /flash/i.test(b) ? 1 : 2))
    }
    let reply
    let lastStatus
    for (const model of cachedModels) {
      const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 130 } }),
      })
      if (result.ok) {
        const payload = await result.json()
        reply = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()
        break
      }
      lastStatus = result.status
    }
    if (!reply) throw new Error(`Gemini returned ${lastStatus || 'no reply'}`)
    return response.status(200).json({ explanation: reply.replace(/\*\*/g, '').replace(/^\s*#+\s*/gm, '') })
  } catch (error) {
    console.error('Journey connection error:', error)
    return response.status(502).json({ error: 'GrowthGrind AI could not explain this connection right now.' })
  }
}
