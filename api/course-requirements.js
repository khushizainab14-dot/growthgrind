const gradeValue = { 'A*': 6, A: 5, B: 4, C: 3, D: 2, E: 1 }

function trustedUniversityUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    // The public course catalogue is allowed to request only UK academic domains.
    // Redirects are deliberately disabled, so a course URL can never lead this endpoint elsewhere.
    if (url.protocol !== 'https:' || !(host === 'ac.uk' || host.endsWith('.ac.uk'))) return null
    return url
  } catch { return null }
}

function readableText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&pound;/gi, '£').replace(/\s+/g, ' ').trim()
}

function extractRequirement(text) {
  const start = text.search(/entry requirements|entry requirement|academic requirements|typical offer/i)
  const excerpt = start >= 0 ? text.slice(start, start + 1300) : ''
  const end = excerpt.search(/fees and funding|how to apply|course details|modules|student life|international students/i)
  return (end > 80 ? excerpt.slice(0, end) : excerpt).slice(0, 850).trim()
}

function classify(profileGrades, requirement) {
  if (!Array.isArray(profileGrades) || profileGrades.length !== 3) return null
  const match = requirement.match(/(?:A\*|[A-E])\s*(?:A\*|[A-E])\s*(?:A\*|[A-E])/)
  const required = match?.[0]?.match(/A\*|[A-E]/g)
  if (!required || required.length !== 3) return { suggestion: 'Check manually', reason: 'The official page did not expose a standard three A-level offer in a comparable format. Check relevant subjects as well.' }
  const studentScore = profileGrades.reduce((sum, grade) => sum + (gradeValue[grade] || 0), 0)
  const requiredScore = required.reduce((sum, grade) => sum + (gradeValue[grade] || 0), 0)
  const suggestion = studentScore >= requiredScore + 2 ? 'Safety' : studentScore >= requiredScore ? 'Target' : 'Dream'
  return { suggestion, reason: `Compared with the extracted typical offer ${required.join('')}. This is a planning suggestion only; subject requirements, contextual offers and selection factors still matter.` }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  const url = trustedUniversityUrl(request.body?.url)
  if (!url) return response.status(400).json({ error: 'This course page cannot be read in GrowthGrind yet. Use the official link.' })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const result = await fetch(url, { signal: controller.signal, redirect: 'manual', headers: { 'User-Agent': 'GrowthGrind course catalogue reader' } })
    if (!result.ok) throw new Error('The university page could not be read right now.')
    const requirement = extractRequirement(readableText(await result.text()))
    if (requirement.length < 35) throw new Error('No readable entry requirements were found. Use the official course page.')
    return response.status(200).json({ text: requirement, ...classify(request.body?.grades, requirement) })
  } catch (error) {
    return response.status(502).json({ error: error.name === 'AbortError' ? 'The official course page took too long to respond.' : (error.message || 'Could not read the official course page.') })
  } finally { clearTimeout(timeout) }
}
