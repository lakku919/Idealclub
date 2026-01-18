import { exec } from 'child_process'; import prisma from '../../lib/prisma';

export default async function handler(req, res) { // restricted to local/dev; do NOT expose on production if (process.env.NODE_ENV === 'production') { return res.status(403).json({ error: 'Forbidden' }); } try { // call seed script: node prisma/seed.js const { spawn } = require('child_process'); const child = spawn('node', ['prisma/seed.js'], { stdio: 'inherit' }); child.on('exit', (code) => { res.json({ ok: true, code }); }); } catch (err) { res.status(500).json({ error: err.message }); } }
