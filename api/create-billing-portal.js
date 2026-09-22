const supabaseUrl = process.env.SUPABASE_URL || 'https://xqscricumpoiyijottnq.supabase.co'
const productionOrigin = process.env.APP_URL || 'https://growthgrind.vercel.app'

function portalOrigin(request) {
  const origin = request.headers.origin || ''
  return /^http:\/\/localhost:\d+$/.test(origin) ? origin : productionOrigin
}

async function authenticatedUser(request) {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return null
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: authorization },
  })
  return userResponse.ok ? userResponse.json() : null
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return response.status(500).json({ error: 'Billing management is not configured yet.' })

  try {
    const user = await authenticatedUser(request)
    if (!user?.id) return response.status(401).json({ error: 'Please sign in before managing billing.' })

    const now = encodeURIComponent(new Date().toISOString())
    const membershipResponse = await fetch(`${supabaseUrl}/rest/v1/premium_memberships?user_id=eq.${user.id}&status=eq.active&stripe_subscription_id=not.is.null&stripe_customer_id=not.is.null&or=(expires_at.is.null,expires_at.gt.${now})&select=stripe_customer_id&limit=1`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    })
    if (!membershipResponse.ok) throw new Error(await membershipResponse.text())
    const [membership] = await membershipResponse.json()
    if (!membership?.stripe_customer_id) return response.status(404).json({ error: 'There is no recurring Premium plan to manage on this account.' })

    const params = new URLSearchParams({
      customer: membership.stripe_customer_id,
      return_url: `${portalOrigin(request)}/?account=billing`,
    })
    const stripeResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const session = await stripeResponse.json()
    if (!stripeResponse.ok || !session.url) throw new Error(session.error?.message || 'Stripe billing portal could not be created.')
    return response.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe billing portal error:', error)
    return response.status(502).json({ error: 'We could not open secure billing management right now. Please try again shortly.' })
  }
}
