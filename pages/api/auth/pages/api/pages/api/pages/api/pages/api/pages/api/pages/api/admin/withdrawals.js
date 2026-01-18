import prisma from '../../../lib/prisma';
import { withSessionRoute } from '../../../lib/session';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' }) : null;

export default withSessionRoute(async function handler(req, res) {
  const s = req.session.user;
  if (!s || s.role !== 'admin') return res.status(401).json({ error: 'Admin only' });

  if (req.method === 'GET') {
    const list = await prisma.withdrawalRequest.findMany({ orderBy: { createdAt: 'desc' }});
    return res.json({ list });
  }

  if (req.method === 'POST') {
    const { id, action } = req.body; // action: approve | reject | pay
    const wr = await prisma.withdrawalRequest.findUnique({ where: { id: Number(id) }});
    if (!wr) return res.status(404).json({ error: 'Not found' });
    if (action === 'reject') {
      await prisma.withdrawalRequest.update({ where: { id: wr.id }, data: { status: 'rejected' }});
      return res.json({ ok: true });
    }
    if (action === 'approve') {
      await prisma.withdrawalRequest.update({ where: { id: wr.id }, data: { status: 'approved' }});
      return res.json({ ok: true });
    }
    if (action === 'pay') {
      // For demo: we simulate payout OR use Stripe payouts/transfers if configured.
      if (!stripe) {
        await prisma.withdrawalRequest.update({ where: { id: wr.id }, data: { status: 'paid' }});
        await prisma.transaction.create({ data: { userId: wr.userId, type: 'withdrawal', amount: -wr.amount, meta: 'simulated payout' }});
        await prisma.user.update({ where: { id: wr.userId }, data: { balance: { decrement: wr.amount } }});
        return res.json({ ok: true, simulated: true });
      } else {
        // In a real setup you'd transfer to a connected account or create a payout.
        // For safety, we simulate here and mark paid. Integrate actual Stripe Payout/Connect after verification.
        await prisma.withdrawalRequest.update({ where: { id: wr.id }, data: { status: 'paid' }});
        await prisma.transaction.create({ data: { userId: wr.userId, type: 'withdrawal', amount: -wr.amount, meta: 'stripe_simulated' }});
        await prisma.user.update({ where: { id: wr.userId }, data: { balance: { decrement: wr.amount } }});
        return res.json({ ok: true, simulated: true });
      }
    }
    return res.status(400).json({ error: 'Unknown action' });
  }

  res.status(405).end();
});
