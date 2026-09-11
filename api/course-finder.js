const MAX_FIELD_LENGTH = 800
let cachedModels = null

function clean(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : ''
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return JSON.parse(fenced ? fenced[1] : text)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({ error: 'Course Finder is not configured yet.' })
  }

  const profile = {
    subjects: clean(request.body?.subjects),
    grades: clean(request.body?.grades),
    interests: clean(request.body?.interests),
    careers: clean(request.body?.careers),
    location: clean(request.body?.location),
    universityPreferences: clean(request.body?.universityPreferences),
    priorities: clean(request.body?.priorities),
  }

  if (!profile.subjects || !profile.interests) {
    return response.status(400).json({ error: 'Please add your subjects and interests.' })
  }

  const prompt = `You are GrowthGrind's UK university course exploration assistant. Help a school student explore possible degree subjects and a small shortlist of UK universities to investigate. Do not claim entry guarantees, invent entry requirements, rank universities, or give admissions advice as fact. Be encouraging, precise, and transparent about uncertainty. The university list must be a shortlist to research, not a definitive list or ranking. Return valid JSON only with this exact shape:
{
  "summary": "two or three sentences",
  "courseAreas": [{"title":"", "whyItFits":"", "explore":"", "universitiesToExplore":[{"name":"", "reason":""}]}],
  "nextSteps": [""],
  "questionsToConsider": [""]
}
Include 3 courseAreas, 3 nextSteps, and 3 to 5 universitiesToExplore for every course area. Only include a university when it genuinely relates to that specific course and the student's stated preferences. The 'explore' field should suggest what the student should check in official university course pages, such as module content, entry requirements, placement options, or admissions tests.

Student profile:
${JSON.stringify(profile)}`

  try {
    if (!cachedModels) {
      const modelListResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
      )

      if (!modelListResponse.ok) {
        throw new Error(`Gemini model discovery returned ${modelListResponse.status}`)
      }

      const modelList = await modelListResponse.json()
      const availableModels = (modelList.models || [])
        .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model) => model.name?.replace(/^models\//, ''))
        .filter(Boolean)

      cachedModels = [
        ...availableModels.filter((model) => /gemini-3.*flash/i.test(model)),
        ...availableModels.filter((model) => /gemini-2\.5.*flash/i.test(model)),
        ...availableModels.filter((model) => /flash/i.test(model) && !/gemini-[23]/i.test(model)),
        ...availableModels.filter((model) => !/flash/i.test(model)),
      ]
    }

    const models = cachedModels

    if (models.length === 0) {
      throw new Error('No Gemini text-generation model is available for this API key.')
    }

    let payload
    let lastStatus

    for (const model of models) {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.35,
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (geminiResponse.ok) {
        payload = await geminiResponse.json()
        break
      }

      lastStatus = geminiResponse.status
    }

    if (!payload) throw new Error(`Gemini returned ${lastStatus}`)

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no recommendation.')

    return response.status(200).json(extractJson(text))
  } catch (error) {
    console.error('Course Finder error:', error)
    return response.status(502).json({
      error: 'We could not generate recommendations right now. Please try again shortly.',
    })
  }
}
