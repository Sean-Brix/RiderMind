import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin creates a new account
export default async function createAcc(req, res) {
	try {
		const { email, password, name, role } = req.body || {};
		if (!email || !password || !name) {
			return res.status(400).json({ error: 'email, password, and name are required' });
		}
		const normalizedRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(409).json({ error: 'Email already in use' });
		}
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, passwordHash, name, role: normalizedRole },
			select: { id: true, email: true, name: true, role: true, createdAt: true },
		});
		return res.status(201).json({ user });
	} catch (err) {
		console.error('Create account error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
