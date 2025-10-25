import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin updates a user's details
export default async function updateAcc(req, res) {
	try {
		const id = Number(req.params.id);
		if (!id) return res.status(400).json({ error: 'Invalid id' });

		const body = req.body || {};
		const data = { ...body };

		// Prevent changing email uniqueness conflicts blindly
		if (body.email) {
			const existing = await prisma.user.findUnique({ where: { email: body.email } });
			if (existing && existing.id !== id) {
				return res.status(409).json({ error: 'Email already in use' });
			}
		}

		// Password update
		if (body.password) {
			data.passwordHash = await bcrypt.hash(body.password, 10);
			delete data.password;
		}

		// Normalize types
		if (body.birthdate) data.birthdate = new Date(body.birthdate);
		if (body.weight != null) data.weight = Number(body.weight);
		if (body.height != null) data.height = Number(body.height);

		// Handle enum fields (convert empty strings to undefined to remove the value)
		if (body.nationality !== undefined) {
			data.nationality = (!body.nationality || body.nationality === '' || body.nationality === 'null') ? undefined : body.nationality;
		}
		if (body.civil_status !== undefined) {
			data.civil_status = (!body.civil_status || body.civil_status === '' || body.civil_status === 'null') ? undefined : body.civil_status;
		}

		if (Array.isArray(body.vehicle_categories)) {
			data.vehicle_categories = body.vehicle_categories.join(',');
		}

		// Role guard - only ADMIN or USER allowed values
		if (body.role && !['ADMIN', 'USER'].includes(body.role)) {
			return res.status(400).json({ error: 'Invalid role' });
		}

		const updated = await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				email: true,
				role: true,
				first_name: true,
				middle_name: true,
				last_name: true,
				name_extension: true,
				updatedAt: true,
				vehicle_categories: true,
			},
		});
		const displayName = [updated.first_name, updated.last_name, updated.name_extension].filter(Boolean).join(' ') || updated.email;
		return res.json({ user: { ...updated, displayName, vehicle_categories: (updated.vehicle_categories || '').split(',').filter(Boolean) } });
	} catch (err) {
		console.error('Update account error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
