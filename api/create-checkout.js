const plans = {
  founding: { name: 'GrowthGrind Premium — Founding Member', amount: 299, mode: 'subscription', interval: 'month' },
  monthly: { name: 'GrowthGrind Premium — Monthly', amount: 899, mode: 'subscription', interval: 'month' },
  annual: { name: 'GrowthGrind Premium — One Year', amount: 8999, mode: 'payment' },
  twoYear: { name: 'GrowthGrind Premium — Two Years', amount: 16999, mode: 'payment' },
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.STRIPE_SECRET_KEY) return response.status(500).json({ error: 'Payments are not configured yet.' })

  const plan = plans[request.body?.plan]
  if (!plan) return response.status(400).json({ error: 'Please choose a valid plan.' })
  const origin = request.headers.origin || 'https://growthgrind.vercel.app'
  const params = new URLSearchParams({
    mode: plan.mode,
    success_url: `${origin}/?premium=success`,
    cancel_url: `${origin}/?premium=cancelled`,
    'line_items[0][price_data][currency]': 'gbp',
    'line_items[0][price_data][product_data][name]': plan.name,
    'line_items[0][price_data][unit_amount]': String(plan.amount),
    'line_items[0][quantity]': '1',
  })
  if (plan.mode === 'subscription') params.set('line_items[0][price_data][recurring][interval]', plan.interval)
  if (request.body?.userId) params.set('client_reference_id', String(request.body.userId).slice(0, 128))

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
