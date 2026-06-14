import bcrypt from 'bcryptjs';
import { findOne, createDoc, COLLECTIONS } from '../../db/firestore.js';

export default async function createAcc(req, res) {
  try {
    const body = req.body || {};
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const normalizedRole = body.role?.toUpperCase();
    if (!normalizedRole || !['ADMIN', 'USER'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be either ADMIN or USER.' });
    }
    if (normalizedRole === 'USER' && !body.student_type) {
      return res.status(400).json({ error: 'student_type is required for USER accounts.' });
    }

    const existing = await findOne(COLLECTIONS.USERS, 'email', email);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const toNull = v => (!v || v === '' || v === 'null' || v === 'undefined') ? null : v;

    const data = {
      email, passwordHash, role: normalizedRole,
      last_name: body.last_name ?? null, first_name: body.first_name ?? null,
      middle_name: body.middle_name ?? null, name_extension: body.name_extension ?? null,
      birthdate: body.birthdate || null, sex: body.sex ?? null,
      nationality: toNull(body.nationality), civil_status: toNull(body.civil_status),
      weight: body.weight != null ? Number(body.weight) : null,
      height: body.height != null ? Number(body.height) : null,
      blood_type: body.blood_type ?? null, eye_color: body.eye_color ?? null,
      address_house_no: body.address_house_no ?? null, address_street: body.address_street ?? null,
      address_barangay: body.address_barangay ?? null, address_city_municipality: body.address_city_municipality ?? null,
      address_province: body.address_province ?? null, telephone_number: body.telephone_number ?? null,
      cellphone_number: body.cellphone_number ?? null, email_address: body.email_address ?? null,
      emergency_contact_name: body.emergency_contact_name ?? null,
      emergency_contact_relationship: body.emergency_contact_relationship ?? null,
      emergency_contact_number: body.emergency_contact_number ?? null,
      student_type: normalizedRole === 'USER' ? toNull(body.student_type) : null,
    };

    const created = await createDoc(COLLECTIONS.USERS, data);
    const displayName = [created.first_name, created.last_name, created.name_extension].filter(Boolean).join(' ') || created.email;
    return res.status(201).json({ user: { id: created.id, email: created.email, role: created.role, first_name: created.first_name, last_name: created.last_name, displayName } });
  } catch (err) {
    console.error('Create account error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
