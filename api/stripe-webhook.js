import crypto from 'node:crypto'

export const config = { api: { bodyParser: false } }

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

function signatureIsValid(rawBody, header, secret) {
  if (!header || !secret) return false
  const values = Object.fromEntries(header.split(',').map((piece) => piece.split('=')))
  if (!values.t || !values.v1) return false
  const expected = crypto.createHmac('sha256', secret).update(`${values.t}.${rawBody.toString('utf8')}`).digest('hex')
  const received = Buffer.from(values.v1, 'hex')
  const calculated = Buffer.from(expected, 'hex')
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).send('Method not allowed')
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return response.status(500).send('Webhook is not configured')
  }

  try {
    const rawBody = await readRawBody(request)
    if (!signatureIsValid(rawBody, request.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
      return response.status(400).send('Invalid Stripe signature')
    }
    const event = JSON.parse(rawBody.toString('utf8'))
    if (event.type !== 'checkout.session.completed') return response.status(200).json({ received: true })

    const session = event.data?.object
    const userId = session?.client_reference_id
    if (!userId || session.payment_status !== 'paid') return response.status(200).json({ received: true })
    const isFounding = session.metadata?.plan === 'founding'
    const payload = {
      user_id: userId,
      stripe_customer_id: session.customer || null,
      stripe_checkout_session_id: session.id,
      stripe_subscription_id: session.subscription || null,
      plan: isFounding ? 'founding' : 'premium',
      status: 'active',
      purchased_at: new Date().toISOString(),
    }
    const supabaseResponse = await fetch(`${process.env.SUPABASE_URL || 'https://xqscricumpoiyijottnq.supabase.co'}/rest/v1/premium_memberships?on_conflict=stripe_checkout_session_id`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    })
    if (!supabaseResponse.ok) throw new Error(await supabaseResponse.text())
    return response.status(200).json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return response.status(500).send('Webhook processing failed')
  }
}
