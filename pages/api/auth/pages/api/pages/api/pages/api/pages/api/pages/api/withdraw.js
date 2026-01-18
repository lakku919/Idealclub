import prisma from '../../lib/prisma';
import { withSessionRoute } from '../../lib/session';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { amountCents, reason } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Not authed' });
  const u = await prisma.user.findUnique({ where: { id: user.id }});
  if (!u || u.balance < amountCents) return res.status(400).json({ error: 'Insufficient' });
  const wr = await prisma.withdrawalRequest.create({
    data: { userId: user.id, amount: amountCents, reason: reason || '' }
  });
  res.json({ ok: true, requestId: wr.id });
});
