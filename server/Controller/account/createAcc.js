import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin creates a new account
export default async function createAcc(req, res) {
	try {
		const body = req.body || {};
		const { email, password } = body;
		if (!email || !password) {
			return res.status(400).json({ error: 'email and password are required' });
		}
		const normalizedRole = body.role === 'ADMIN' ? 'ADMIN' : 'USER';
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(409).json({ error: 'Email already in use' });
		}
		const passwordHash = await bcrypt.hash(password, 10);

		// Normalize vehicle categories (accept array or comma string)
		let vehicle_categories = body.vehicle_categories;
		if (Array.isArray(vehicle_categories)) vehicle_categories = vehicle_categories.join(',');

		// Helper function to handle enum fields (convert empty strings to null)
		const handleEnumField = (value) => {
			if (!value || value === '' || value === 'null' || value === 'undefined') return undefined;
			return value;
		};

		const data = {
			email,
			passwordHash,
			role: normalizedRole,
			// Personal
			last_name: body.last_name ?? null,
			first_name: body.first_name ?? null,
			middle_name: body.middle_name ?? null,
			name_extension: body.name_extension ?? null,
			birthdate: body.birthdate ? new Date(body.birthdate) : null,
			sex: body.sex ?? null,
			nationality: handleEnumField(body.nationality),
			civil_status: handleEnumField(body.civil_status),
			weight: body.weight != null ? Number(body.weight) : null,
			height: body.height != null ? Number(body.height) : null,
			blood_type: body.blood_type ?? null,
			eye_color: body.eye_color ?? null,
			// Address
			address_house_no: body.address_house_no ?? null,
			address_street: body.address_street ?? null,
			address_barangay: body.address_barangay ?? null,
			address_city_municipality: body.address_city_municipality ?? null,
			address_province: body.address_province ?? null,
			// Contact
			telephone_number: body.telephone_number ?? null,
			cellphone_number: body.cellphone_number ?? null,
			email_address: body.email_address ?? null,
			// Emergency
			emergency_contact_name: body.emergency_contact_name ?? null,
			emergency_contact_relationship: body.emergency_contact_relationship ?? null,
			emergency_contact_number: body.emergency_contact_number ?? null,
			// Vehicle
			vehicle_categories: vehicle_categories ?? null,
		};

		const created = await prisma.user.create({
			data,
			select: {
				id: true,
				email: true,
				role: true,
				first_name: true,
				last_name: true,
				name_extension: true,
				createdAt: true,
			},
		});
		const displayName = [created.first_name, created.last_name, created.name_extension].filter(Boolean).join(' ') || created.email;
		return res.status(201).json({ user: { ...created, displayName } });
	} catch (err) {
		console.error('Create account error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
