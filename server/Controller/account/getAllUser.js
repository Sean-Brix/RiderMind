import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getAllUser(req, res) {
	try {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
		});
		return res.json({ users });
	} catch (err) {
		console.error('Get all users error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
