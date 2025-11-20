import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getUserById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    
    // Allow users to access their own profile, or admins to access any profile
    const authenticatedUserId = req.user.id;
    if (authenticatedUserId !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to access this profile' });
    }
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Get user by id error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}