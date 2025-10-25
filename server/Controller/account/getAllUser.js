import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getAllUser(req, res) {
	try {
			const users = await prisma.user.findMany({
				orderBy: { createdAt: 'desc' },
				select: { id: true, email: true, role: true, first_name: true, last_name: true, name_extension: true, createdAt: true, updatedAt: true },
			});
			const shaped = users.map(u => ({
				...u,
				displayName: [u.first_name, u.last_name, u.name_extension].filter(Boolean).join(' ') || u.email,
			}));
			return res.json({ users: shaped });
	} catch (err) {
		console.error('Get all users error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
