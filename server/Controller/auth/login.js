import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../../utils/jwt.js';

dotenv.config();
const prisma = new PrismaClient();

export default async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const displayName = [user.first_name, user.middle_name, user.last_name, user.name_extension]
      .filter(Boolean)
      .join(' ') || user.email;

    const token = signToken({ id: user.id, role: user.role, email: user.email, displayName });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        name_extension: user.name_extension,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
