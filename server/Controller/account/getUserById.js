import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getUserById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const vehicle_categories = user.vehicle_categories ? user.vehicle_categories.split(',').filter(Boolean) : [];
    return res.json({ user: { ...user, vehicle_categories } });
  } catch (err) {
    console.error('Get user by id error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}