import prisma from '../../lib/prisma';
import { withSessionRoute } from '../../lib/session';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { roundId, qty } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Not authed' });
  const round = await prisma.lotteryRound.findUnique({ where: { id: Number(roundId) }});
  if (!round) return res.status(404).json({ error: 'Round not found' });
  const priceTotal = round.ticketPrice * (qty || 1);
  const u = await prisma.user.findUnique({ where: { id: user.id }});
  if (u.balance < priceTotal) return res.status(400).json({ error: 'Insufficient balance' });
  // debit
  await prisma.transaction.create({ data: { userId: user.id, type: 'bet', amount: -priceTotal, meta: `round:${round.id}` }});
  await prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: priceTotal } }});
  // create tickets
  for (let i=0;i<(qty||1);i++){
    await prisma.ticket.create({ data: { roundId: round.id, userId: user.id }});
  }
  res.json({ ok: true });
});
