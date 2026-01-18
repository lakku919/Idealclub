import prisma from '../../lib/prisma';
import { withSessionRoute } from '../../lib/session';

export default withSessionRoute(async function handler(req, res) {
  const s = req.session.user;
  if (!s) return res.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: s.id }});
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, balance: user.balance }});
});
