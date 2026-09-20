const supabaseUrl = process.env.SUPABASE_URL || 'https://xqscricumpoiyijottnq.supabase.co'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return response.status(500).json({ error: 'Weekly sign-up is not configured yet.' })

  const email = String(request.body?.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response.status(400).json({ error: 'Enter a valid email address.' })
  }

  try {
    const now = new Date().toISOString()
    const subscriberResponse = await fetch(`${supabaseUrl}/rest/v1/weekly_subscribers?on_conflict=email`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ email, status: 'active', source: 'website', subscribed_at: now, unsubscribed_at: null, updated_at: now }),
    })
    if (!subscriberResponse.ok) throw new Error('Subscriber database request failed.')
    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error('Weekly sign-up error:', error)
    return response.status(502).json({ error: 'We could not save your Weekly sign-up right now. Please try again shortly.' })
  }
}
