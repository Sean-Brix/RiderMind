import admin from 'firebase-admin';

export function getDb() {
  return admin.firestore();
}

// Convert a Firestore document snapshot to a plain object with id
export function docToObject(doc) {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// Convert a query snapshot to an array of plain objects
export function snapshotToArray(snapshot) {
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Current ISO timestamp string
export function now() {
  return new Date().toISOString();
}

// Add createdAt + updatedAt timestamps to new document data
export function withCreatedAt(data) {
  const ts = now();
  return { ...data, createdAt: ts, updatedAt: ts };
}

// Add updatedAt timestamp to update data
export function withUpdatedAt(data) {
  return { ...data, updatedAt: now() };
}

// Query a collection by a single field value, returns first match or null
export async function findOne(collectionName, field, value) {
  const db = getDb();
  const snapshot = await db.collection(collectionName).where(field, '==', value).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Get a document by ID, returns null if not found
export async function findById(collectionName, id) {
  const db = getDb();
  const doc = await db.collection(collectionName).doc(id).get();
  return docToObject(doc);
}

// Get all documents in a collection
export async function findAll(collectionName) {
  const db = getDb();
  const snapshot = await db.collection(collectionName).get();
  return snapshotToArray(snapshot);
}

// Create a new document with auto-generated ID
export async function createDoc(collectionName, data) {
  const db = getDb();
  const docData = withCreatedAt(data);
  const ref = await db.collection(collectionName).add(docData);
  return { id: ref.id, ...docData };
}

// Create a document with a specific ID
export async function setDoc(collectionName, id, data) {
  const db = getDb();
  const docData = withCreatedAt(data);
  await db.collection(collectionName).doc(id).set(docData);
  return { id, ...docData };
}

// Update a document by ID (partial update)
export async function updateDoc(collectionName, id, data) {
  const db = getDb();
  const updateData = withUpdatedAt(data);
  await db.collection(collectionName).doc(id).update(updateData);
  return updateData;
}

// Delete a document by ID
export async function deleteDoc(collectionName, id) {
  const db = getDb();
  await db.collection(collectionName).doc(id).delete();
}

// Delete all documents in a query snapshot using batch
export async function batchDelete(snapshot) {
  const db = getDb();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

// Collection names used across the app
// Note: quiz question options are embedded as arrays in quizQuestions documents
export const COLLECTIONS = {
  USERS: 'users',
  REGISTRATION_REQUESTS: 'registrationRequests',
  MODULE_CATEGORIES: 'moduleCategories',
  MODULE_CATEGORY_MODULES: 'moduleCategoryModules',
  MODULES: 'modules',
  MODULE_OBJECTIVES: 'moduleObjectives',
  MODULE_SLIDES: 'moduleSlides',
  STUDENT_MODULES: 'studentModules',
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quizQuestions',
  QUIZ_ATTEMPTS: 'quizAttempts',
  MODULE_FEEDBACK: 'moduleFeedback',
  QUIZ_REACTIONS: 'quizReactions',
  FAQS: 'faqs',
};
