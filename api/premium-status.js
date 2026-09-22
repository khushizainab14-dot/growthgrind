const supabaseUrl = process.env.SUPABASE_URL || 'https://xqscricumpoiyijottnq.supabase.co'

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return response.status(500).json({ error: 'Premium status is not configured yet.' })

  try {
    const foundingResponse = await fetch(`${supabaseUrl}/rest/v1/premium_memberships?plan=eq.founding&status=eq.active&select=id`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, Prefer: 'count=exact' },
    })
    const count = Number(foundingResponse.headers.get('content-range')?.split('/')[1] || 0)
    let active = false
    const authorization = request.headers.authorization
    if (authorization) {
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: authorization } })
      const user = userResponse.ok ? await userResponse.json() : null
      if (user?.id) {
        const now = encodeURIComponent(new Date().toISOString())
        const membershipResponse = await fetch(`${supabaseUrl}/rest/v1/premium_memberships?user_id=eq.${user.id}&status=eq.active&or=(expires_at.is.null,expires_at.gt.${now})&select=id&limit=1`, {
          headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
        })
        active = membershipResponse.ok && (await membershipResponse.json()).length > 0
      }
    }
    return response.status(200).json({ foundingMembersClaimed: count, active })
  } catch (error) {
    console.error('Premium status error:', error)
    return response.status(502).json({ error: 'Premium status could not be loaded.' })
  }
}
