const { PrismaClient } = require('@prisma/client'); const bcrypt = require('bcryptjs'); const prisma = new PrismaClient();

async function main() { const pw = await bcrypt.hash('TempPass123!', 10); const existing = await prisma.user.findUnique({ where: { email: 'admin@idealclub.test' }}); if (!existing) { await prisma.user.create({ data: { email: 'admin@idealclub.test', password: pw, name: 'Admin', role: 'admin', balance: 0 } }); console.log('Created admin@idealclub.test (password TempPass123!)'); } else { console.log('Admin already exists'); }

// create a demo round const round = await prisma.lotteryRound.create({ data: { name: 'Demo Round #1', ticketPrice: 1000, // $10.00 maxTickets: 100 } }); console.log('Created demo round', round.id); }

main() .catch(e => { console.error(e); process.exit(1); }) .finally(async () => { await prisma.$disconnect(); });
