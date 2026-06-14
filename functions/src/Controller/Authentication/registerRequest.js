import bcrypt from 'bcryptjs';
import { getDb, COLLECTIONS, findOne, createDoc, updateDoc, deleteDoc, snapshotToArray, docToObject } from '../../db/firestore.js';
import { sendEmail } from '../../utils/emailService.js';

export async function submitRegistration(req, res) {
  try {
    const {
      email, password, last_name, first_name, middle_name, name_extension,
      birthdate, sex, nationality, civil_status, weight, height, blood_type, eye_color,
      address_house_no, address_street, address_barangay, address_city_municipality, address_province,
      telephone_number, cellphone_number, email_address,
      emergency_contact_name, emergency_contact_relationship, emergency_contact_number,
      student_type
    } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    if (!last_name || !first_name) return res.status(400).json({ success: false, message: 'First name and last name are required' });

    const existingUser = await findOne(COLLECTIONS.USERS, 'email', email);
    if (existingUser) return res.status(400).json({ success: false, message: 'Email is already registered' });

    const existingRequest = await findOne(COLLECTIONS.REGISTRATION_REQUESTS, 'email', email);
    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return res.status(400).json({ success: false, message: 'A registration request with this email is already pending approval', requestId: existingRequest.id });
      }
      await deleteDoc(COLLECTIONS.REGISTRATION_REQUESTS, existingRequest.id);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const registrationRequest = await createDoc(COLLECTIONS.REGISTRATION_REQUESTS, {
      email, passwordHash,
      last_name, first_name, middle_name: middle_name || null, name_extension: name_extension || null,
      birthdate: birthdate || null, sex: sex || null, nationality: nationality || null,
      civil_status: civil_status || null, weight: weight ? Number(weight) : null,
      height: height ? Number(height) : null, blood_type: blood_type || null, eye_color: eye_color || null,
      address_house_no: address_house_no || null, address_street: address_street || null,
      address_barangay: address_barangay || null, address_city_municipality: address_city_municipality || null,
      address_province: address_province || null, telephone_number: telephone_number || null,
      cellphone_number: cellphone_number || null, email_address: email_address || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_relationship: emergency_contact_relationship || null,
      emergency_contact_number: emergency_contact_number || null,
      student_type: student_type || null,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully',
      requestId: registrationRequest.id,
      data: { id: registrationRequest.id, email: registrationRequest.email, status: registrationRequest.status, requestedAt: registrationRequest.requestedAt }
    });
  } catch (error) {
    console.error('Submit registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit registration request', error: error.message });
  }
}

export async function getRegistrationRequests(req, res) {
  try {
    const { status } = req.query;
    const db = getDb();
    let query = db.collection(COLLECTIONS.REGISTRATION_REQUESTS).orderBy('requestedAt', 'desc');
    if (status) query = query.where('status', '==', status);
    const snapshot = await query.get();
    const requests = snapshotToArray(snapshot);

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Get registration requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration requests', error: error.message });
  }
}

export async function getRegistrationRequest(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.REGISTRATION_REQUESTS).doc(id).get();
    const request = docToObject(doc);
    if (!request) return res.status(404).json({ success: false, message: 'Registration request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Get registration request error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration request', error: error.message });
  }
}

export async function approveRegistration(req, res) {
  try {
    const { id } = req.params;
    const { receiptUrl, orNumber } = req.body;
    const adminId = req.user.id;

    if (!receiptUrl || !orNumber) {
      return res.status(400).json({ success: false, message: 'Payment receipt and OR number are required' });
    }

    const db = getDb();
    const reqDoc = await db.collection(COLLECTIONS.REGISTRATION_REQUESTS).doc(id).get();
    const request = docToObject(reqDoc);
    if (!request) return res.status(404).json({ success: false, message: 'Registration request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: `Registration request has already been ${request.status.toLowerCase()}` });

    const existingUser = await findOne(COLLECTIONS.USERS, 'email', request.email);
    if (existingUser) return res.status(400).json({ success: false, message: 'Email is already registered' });

    const batch = db.batch();
    const newUserRef = db.collection(COLLECTIONS.USERS).doc();
    const ts = new Date().toISOString();
    batch.set(newUserRef, {
      email: request.email, passwordHash: request.passwordHash, role: 'USER',
      last_name: request.last_name, first_name: request.first_name, middle_name: request.middle_name,
      name_extension: request.name_extension, birthdate: request.birthdate, sex: request.sex,
      nationality: request.nationality, civil_status: request.civil_status, weight: request.weight,
      height: request.height, blood_type: request.blood_type, eye_color: request.eye_color,
      address_house_no: request.address_house_no, address_street: request.address_street,
      address_barangay: request.address_barangay, address_city_municipality: request.address_city_municipality,
      address_province: request.address_province, telephone_number: request.telephone_number,
      cellphone_number: request.cellphone_number, email_address: request.email_address,
      emergency_contact_name: request.emergency_contact_name,
      emergency_contact_relationship: request.emergency_contact_relationship,
      emergency_contact_number: request.emergency_contact_number, student_type: request.student_type,
      paymentReceiptUrl: receiptUrl, orNumber,
      createdAt: ts, updatedAt: ts,
    });
    batch.update(db.collection(COLLECTIONS.REGISTRATION_REQUESTS).doc(id), {
      status: 'APPROVED', reviewedAt: ts, reviewedBy: adminId,
      paymentReceiptUrl: receiptUrl, orNumber, updatedAt: ts,
    });
    await batch.commit();

    res.status(200).json({
      success: true, message: 'Registration approved successfully',
      data: { userId: newUserRef.id, email: request.email, requestId: id }
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve registration', error: error.message });
  }
}

export async function rejectRegistration(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const db = getDb();
    const reqDoc = await db.collection(COLLECTIONS.REGISTRATION_REQUESTS).doc(id).get();
    const request = docToObject(reqDoc);
    if (!request) return res.status(404).json({ success: false, message: 'Registration request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: `Registration request has already been ${request.status.toLowerCase()}` });

    const ts = new Date().toISOString();
    await updateDoc(COLLECTIONS.REGISTRATION_REQUESTS, id, {
      status: 'REJECTED', reviewedAt: ts, reviewedBy: adminId,
      rejectionReason: reason || null,
    });

    const fullName = [request.first_name, request.last_name].filter(Boolean).join(' ');
    const emailResult = await sendEmail(request.email, 'registrationRejected', {
      name: fullName, reason: reason || undefined, allowReapply: true,
      registrationUrl: `${process.env.APP_URL}/register`,
    });

    res.status(200).json({
      success: true, message: 'Registration rejected and notification email sent',
      data: { requestId: id, status: 'REJECTED', rejectionReason: reason || null, emailSent: emailResult.success }
    });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject registration', error: error.message });
  }
}

export async function deleteRegistrationRequest(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const reqDoc = await db.collection(COLLECTIONS.REGISTRATION_REQUESTS).doc(id).get();
    if (!reqDoc.exists) return res.status(404).json({ success: false, message: 'Registration request not found' });
    await deleteDoc(COLLECTIONS.REGISTRATION_REQUESTS, id);
    res.status(200).json({ success: true, message: 'Registration request deleted successfully' });
  } catch (error) {
    console.error('Delete registration request error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete registration request', error: error.message });
  }
}
