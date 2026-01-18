import prisma from '../../../lib/prisma'; import bcrypt from 'bcryptjs'; import { withSessionRoute } from '../../../lib/session';

async function handler(req, res) { if (req.method !== 'POST') return res.status(405).end(); const { email, password } = req.body; if (!email || !password) return res.status(400).json({ error: 'Missing' }); const user = await prisma.user.findUnique({ where: { email }}); if (!user) return res.status(400).json({ error: 'Invalid credentials' }); const ok = await bcrypt.compare(password, user.password); if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

req.session.user = { id: user.id, email: user.email, role: user.role }; await req.session.save(); res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }}); }
