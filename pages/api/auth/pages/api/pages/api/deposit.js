// Create a Stripe PaymentIntent (TEST MODE) or simulate a deposit when STRIPE_SECRET_KEY isn't set.
import Stripe from 'stripe';
import prisma from '../../lib/prisma';
import { withSessionRoute } from '../../lib/session';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { amountCents } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Not authed' });
  if (!amountCents || amountCents <= 0) return res.status(400).json({ error: 'Invalid amount' });

  if (!stripeSecret) {
    // Simulate deposit: create transaction and credit user immediately
    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'deposit',
        amount: amountCents,
        meta: 'simulated'
      }
    });
    await prisma.user.update({ where: { id: user.id }, data: { balance: { increment: amountCents } }});
    return res.json({ ok: true, simulated: true, txId: tx.id });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2023-08-16' });
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { userId: String(user.id) }
    });
    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
