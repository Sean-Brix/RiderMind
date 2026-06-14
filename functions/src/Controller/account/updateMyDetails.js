import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function updateMyDetails(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, middleName, lastName, phoneNumber, address, licenseNumber, birthDate } = req.body;
    const db = getDb();

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!docToObject(userDoc)) return res.status(404).json({ success: false, error: 'User not found' });

    const data = { updatedAt: new Date().toISOString() };
    if (firstName !== undefined) data.firstName = firstName;
    if (middleName !== undefined) data.middleName = middleName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (address !== undefined) data.address = address;
    if (licenseNumber !== undefined) data.licenseNumber = licenseNumber;
    if (birthDate !== undefined) data.birthDate = birthDate;

    await db.collection(COLLECTIONS.USERS).doc(userId).update(data);
    const updated = docToObject(await db.collection(COLLECTIONS.USERS).doc(userId).get());
    const { password: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = updated;

    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, error: 'Failed to update user details', message: error.message });
  }
}
