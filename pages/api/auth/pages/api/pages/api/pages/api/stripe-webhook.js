import Stripe from 'stripe';
import prisma from '../../lib/prisma';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-08-16' });

async function buffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const buf = await buffer(req);
  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      event = JSON.parse(buf.toString());
    }
  } catch (err) {
    console.error('Webhook error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const userId = parseInt(pi.metadata?.userId || '0', 10);
    const amount = pi.amount;
    if (userId) {
      await prisma.transaction.create({
        data: { userId, type: 'deposit', amount, meta: JSON.stringify({ stripe: pi.id }) }
      });
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount } }});
    }
  }

  res.json({ received: true });
}
