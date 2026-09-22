const plans = {
  founding: { priceEnv: 'STRIPE_PRICE_FOUNDING', mode: 'subscription' },
  monthly: { priceEnv: 'STRIPE_PRICE_MONTHLY', mode: 'subscription' },
  annual: { priceEnv: 'STRIPE_PRICE_ANNUAL', mode: 'payment' },
  twoYear: { priceEnv: 'STRIPE_PRICE_BIANNUAL', mode: 'payment' },
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://xqscricumpoiyijottnq.supabase.co'
const productionOrigin = process.env.APP_URL || 'https://growthgrind.vercel.app'

function checkoutOrigin(request) {
  const origin = request.headers.origin || ''
  // Do not reflect an arbitrary Origin header into Stripe's return URLs.
  // Localhost remains convenient for intentional local test purchases.
  if (/^http:\/\/localhost:\d+$/.test(origin)) return origin
  return productionOrigin
}

async function authenticatedUser(request) {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return null
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: authorization,
    },
  })
  return userResponse.ok ? userResponse.json() : null
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return response.status(500).json({ error: 'Payments are not configured yet.' })

  const plan = plans[request.body?.plan]
  if (!plan) return response.status(400).json({ error: 'Please choose a valid plan.' })
  const priceId = process.env[plan.priceEnv]
  if (!priceId) return response.status(500).json({ error: 'This payment plan is not configured yet.' })
  const user = await authenticatedUser(request)
  if (!user?.id) return response.status(401).json({ error: 'Please sign in before opening checkout.' })
  const origin = checkoutOrigin(request)
  const params = new URLSearchParams({
    mode: plan.mode,
    success_url: `${origin}/?premium=success`,
    cancel_url: `${origin}/?premium=cancelled`,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[plan]': request.body?.plan,
  })
  params.set('client_reference_id', String(user.id).slice(0, 128))

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
    const session = await stripeResponse.json()
    if (!stripeResponse.ok || !session.url) throw new Error(session.error?.message || 'Stripe Checkout could not be created.')
    return response.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return response.status(502).json({ error: 'We could not open secure checkout right now. Please try again shortly.' })
  }
}
