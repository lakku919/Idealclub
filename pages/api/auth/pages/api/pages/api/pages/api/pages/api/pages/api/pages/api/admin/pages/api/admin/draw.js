import prisma from '../../../lib/prisma';
import { withSessionRoute } from '../../../lib/session';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const s = req.session.user;
  if (!s || s.role !== 'admin') return res.status(401).json({ error: 'Admin only' });
  const { roundId } = req.body;
  const round = await prisma.lotteryRound.findUnique({ where: { id: Number(roundId) }, include: { tickets: true }});
  if (!round) return res.status(404).json({ error: 'Round not found' });
  if (round.tickets.length === 0) return res.status(400).json({ error: 'No tickets' });
  // pick winner randomly
  const idx = Math.floor(Math.random() * round.tickets.length);
  const ticket = round.tickets[idx];
  // mark winner
  await prisma.lotteryRound.update({ where: { id: round.id }, data: { winnerTicketId: ticket.id, drawnAt: new Date() }});
  // calculate prize pool: sum of bets for this round
  const ticketsCount = round.tickets.length;
  const prize = ticketsCount * round.ticketPrice;
  // credit winner
  await prisma.transaction.create({ data: { userId: ticket.userId, type: 'win', amount: prize, meta: `round:${round.id}` }});
  await prisma.user.update({ where: { id: ticket.userId }, data: { balance: { increment: prize } }});
  res.json({ ok: true, winnerTicketId: ticket.id, winnerUserId: ticket.userId, prize });
});
