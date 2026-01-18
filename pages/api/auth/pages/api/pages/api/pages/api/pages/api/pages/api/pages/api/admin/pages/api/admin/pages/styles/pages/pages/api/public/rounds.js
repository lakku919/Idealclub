import prisma from '../../lib/prisma';

export default async function handler(req, res){
  const rounds = await prisma.lotteryRound.findMany({ include: { tickets: true }});
  // add counts
  const enriched = rounds.map(r => ({ ...r, _count: { tickets: r.tickets.length }}));
  res.json({ rounds: enriched });
}
