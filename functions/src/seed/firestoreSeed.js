import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { COLLECTIONS, getDb } from '../db/firestore.js';

export const SAMPLE_PASSWORD = '123456';

export const SAMPLE_ACCOUNTS = [
  { email: 'admin@ridermind.com', password: SAMPLE_PASSWORD, role: 'ADMIN' },
  { email: 'user@ridermind.com', password: SAMPLE_PASSWORD, role: 'USER' },
];

const DELETE_BATCH_SIZE = 400;

const CLEAR_ORDER = [
  COLLECTIONS.QUIZ_REACTIONS,
  COLLECTIONS.MODULE_FEEDBACK,
  COLLECTIONS.QUIZ_ATTEMPTS,
  COLLECTIONS.STUDENT_MODULES,
  COLLECTIONS.QUIZ_QUESTIONS,
  COLLECTIONS.QUIZZES,
  COLLECTIONS.MODULE_CATEGORY_MODULES,
  COLLECTIONS.MODULE_SLIDES,
  COLLECTIONS.MODULE_OBJECTIVES,
  COLLECTIONS.MODULES,
  COLLECTIONS.MODULE_CATEGORIES,
  COLLECTIONS.FAQS,
  COLLECTIONS.REGISTRATION_REQUESTS,
  COLLECTIONS.USERS,
];

function readFirebaseRcProjectId() {
  try {
    const firebaseRcPath = resolve(process.cwd(), '..', '.firebaserc');
    const firebaseRc = JSON.parse(readFileSync(firebaseRcPath, 'utf8'));
    return firebaseRc.projects?.default || null;
  } catch {
    return null;
  }
}

function readFirebaseConfigProjectId() {
  try {
    if (!process.env.FIREBASE_CONFIG) return null;
    return JSON.parse(process.env.FIREBASE_CONFIG).projectId || null;
  } catch {
    return null;
  }
}

export function initializeFirebaseAdminForSeed() {
  if (admin.apps.length) return admin.app();

  const projectId =
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    readFirebaseConfigProjectId() ||
    readFirebaseRcProjectId();

  const options = {};
  if (projectId) {
    options.projectId = projectId;
    options.storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
  }

  return admin.initializeApp(options);
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function imageUrl(label, color = '0f766e') {
  return `https://placehold.co/1200x675/${color}/ffffff/png?text=${encodeURIComponent(label)}`;
}

function videoUrl(label) {
  return `https://samplelib.com/lib/preview/mp4/sample-5s.mp4?ridermind=${encodeURIComponent(label)}`;
}

function option(id, optionText, isCorrect, position) {
  return {
    id,
    optionText,
    isCorrect,
    position,
    imageUrl: null,
    imagePath: null,
    imageMime: null,
  };
}

function publicUserAliases(user) {
  return {
    firstName: user.first_name,
    middleName: user.middle_name,
    lastName: user.last_name,
    profilePicture: user.profilePictureUrl || null,
  };
}

async function buildUsers(now) {
  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  const baseUser = {
    passwordHash,
    profilePictureUrl: null,
    profilePicturePath: null,
    profilePicture: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: now,
    updatedAt: now,
  };

  const users = [
    {
      id: 'admin',
      email: 'admin@ridermind.com',
      role: 'ADMIN',
      first_name: 'Admin',
      middle_name: null,
      last_name: 'RiderMind',
      name_extension: null,
      birthdate: '1990-01-15',
      sex: 'Female',
      nationality: 'Filipino',
      civil_status: 'Single',
      weight: 58,
      height: 165,
      blood_type: 'O+',
      eye_color: 'Brown',
      address_house_no: '101',
      address_street: 'Control Center Avenue',
      address_barangay: 'Poblacion',
      address_city_municipality: 'Manila',
      address_province: 'Metro Manila',
      telephone_number: null,
      cellphone_number: '09170000001',
      email_address: 'admin@ridermind.com',
      emergency_contact_name: 'Operations Desk',
      emergency_contact_relationship: 'Office',
      emergency_contact_number: '09170000002',
      student_type: null,
      paymentReceiptUrl: null,
      orNumber: null,
    },
    {
      id: 'user',
      email: 'user@ridermind.com',
      role: 'USER',
      first_name: 'Sample',
      middle_name: 'Learner',
      last_name: 'User',
      name_extension: null,
      birthdate: '1999-08-20',
      sex: 'Male',
      nationality: 'Filipino',
      civil_status: 'Single',
      weight: 70,
      height: 172,
      blood_type: 'A+',
      eye_color: 'Brown',
      address_house_no: '22',
      address_street: 'Learning Street',
      address_barangay: 'San Isidro',
      address_city_municipality: 'Quezon City',
      address_province: 'Metro Manila',
      telephone_number: null,
      cellphone_number: '09170000003',
      email_address: 'user@ridermind.com',
      emergency_contact_name: 'Maria User',
      emergency_contact_relationship: 'Mother',
      emergency_contact_number: '09170000004',
      student_type: 'A1',
      paymentReceiptUrl: imageUrl('Sample Receipt', '334155'),
      orNumber: 'OR-2026-0001',
    },
    {
      id: 'juan-santos',
      email: 'juan.santos@ridermind.test',
      role: 'USER',
      first_name: 'Juan',
      middle_name: 'Dela',
      last_name: 'Santos',
      name_extension: null,
      birthdate: '1998-03-11',
      sex: 'Male',
      nationality: 'Filipino',
      civil_status: 'Single',
      weight: 68,
      height: 170,
      blood_type: 'B+',
      eye_color: 'Brown',
      address_house_no: '14',
      address_street: 'Maharlika Road',
      address_barangay: 'Malinis',
      address_city_municipality: 'Pasig',
      address_province: 'Metro Manila',
      telephone_number: null,
      cellphone_number: '09170000005',
      email_address: 'juan.santos@ridermind.test',
      emergency_contact_name: 'Pedro Santos',
      emergency_contact_relationship: 'Father',
      emergency_contact_number: '09170000006',
      student_type: 'B',
      paymentReceiptUrl: imageUrl('Juan Receipt', '1d4ed8'),
      orNumber: 'OR-2026-0002',
      createdAt: isoDaysAgo(35),
    },
    {
      id: 'ana-reyes',
      email: 'ana.reyes@ridermind.test',
      role: 'USER',
      first_name: 'Ana',
      middle_name: 'Lopez',
      last_name: 'Reyes',
      name_extension: null,
      birthdate: '2001-11-02',
      sex: 'Female',
      nationality: 'Filipino',
      civil_status: 'Single',
      weight: 54,
      height: 160,
      blood_type: 'AB+',
      eye_color: 'Brown',
      address_house_no: '8',
      address_street: 'Signal Lane',
      address_barangay: 'Mabuhay',
      address_city_municipality: 'Taguig',
      address_province: 'Metro Manila',
      telephone_number: null,
      cellphone_number: '09170000007',
      email_address: 'ana.reyes@ridermind.test',
      emergency_contact_name: 'Lorna Reyes',
      emergency_contact_relationship: 'Mother',
      emergency_contact_number: '09170000008',
      student_type: 'B1',
      paymentReceiptUrl: imageUrl('Ana Receipt', 'be123c'),
      orNumber: 'OR-2026-0003',
      createdAt: isoDaysAgo(9),
    },
  ];

  return users.map(user => {
    const data = {
      ...baseUser,
      ...user,
      updatedAt: user.updatedAt || now,
      createdAt: user.createdAt || now,
    };
    return { ...data, ...publicUserAliases(data) };
  });
}

function buildCategories(now) {
  return [
    {
      id: 'motorcycle-training',
      name: 'Motorcycle Training',
      description: 'Beginner-friendly motorcycle safety, balance, hazard awareness, and road sharing.',
      vehicleType: 'MOTORCYCLE',
      isActive: true,
      isDefault: true,
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'car-training',
      name: 'Car Training',
      description: 'Core car control, parking, defensive driving, and city/highway readiness.',
      vehicleType: 'CAR',
      isActive: true,
      isDefault: false,
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'professional-road-readiness',
      name: 'Professional Road Readiness',
      description: 'Advanced practice for learners preparing for mixed traffic and longer drives.',
      vehicleType: 'CAR',
      isActive: true,
      isDefault: false,
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildModules(now) {
  return [
    {
      id: 'traffic-rules',
      title: 'Traffic Rules and Regulations',
      description: 'Learn the right-of-way rules, traffic signals, penalties, and safe road conduct expected from every driver.',
      isActive: true,
      position: 1,
      createdBy: 'admin',
      updatedBy: 'admin',
      categoryIds: ['motorcycle-training', 'car-training', 'professional-road-readiness'],
      objectives: [
        'Explain the purpose of common traffic rules and signs.',
        'Apply right-of-way rules in intersections and crossings.',
        'Identify violations that commonly cause crashes or penalties.',
      ],
      slides: [
        { type: 'text', title: 'Why Rules Matter', content: 'Traffic rules make movement predictable. Predictability gives every road user more time to react safely.', description: 'A quick foundation for rules-based driving.', skillLevel: 'Beginner' },
        { type: 'image', title: 'Signal Recognition', content: 'Study how signal lights and road markings guide each decision before entering an intersection.', description: 'Recognizing visual cues on the road.', skillLevel: 'Beginner', color: '0f766e' },
        { type: 'video', title: 'Right-of-Way Walkthrough', content: 'Watch how a driver slows, scans, yields, and proceeds through a busy crossing.', description: 'A short video walkthrough of yielding behavior.', skillLevel: 'Intermediate' },
      ],
    },
    {
      id: 'defensive-driving',
      title: 'Defensive Driving Techniques',
      description: 'Practice scanning, space management, hazard prediction, and calm decisions under pressure.',
      isActive: true,
      position: 2,
      createdBy: 'admin',
      updatedBy: 'admin',
      categoryIds: ['motorcycle-training', 'car-training', 'professional-road-readiness'],
      objectives: [
        'Use a complete scan pattern while driving.',
        'Maintain safe following distance in different conditions.',
        'Predict and avoid common road hazards.',
      ],
      slides: [
        { type: 'text', title: 'The Defensive Mindset', content: 'A defensive driver assumes hazards can appear and keeps options open: space, visibility, and time.', description: 'The core habit behind safe driving.', skillLevel: 'Beginner' },
        { type: 'image', title: 'Space Cushion', content: 'Keep a buffer around your vehicle so sudden stops or swerves do not become emergencies.', description: 'Visualizing space around the vehicle.', skillLevel: 'Beginner', color: '1d4ed8' },
        { type: 'video', title: 'Hazard Scan', content: 'Watch how a driver checks mirrors, blind spots, road edges, and intersections before acting.', description: 'Scanning sequence demo.', skillLevel: 'Expert' },
      ],
    },
    {
      id: 'road-signs',
      title: 'Road Signs and Markings',
      description: 'Recognize regulatory, warning, guide, and pavement markings before they become last-second decisions.',
      isActive: true,
      position: 3,
      createdBy: 'admin',
      updatedBy: 'admin',
      categoryIds: ['motorcycle-training', 'car-training'],
      objectives: [
        'Differentiate regulatory, warning, and guide signs.',
        'Interpret lane arrows and pavement markings.',
        'Respond correctly to temporary work-zone signage.',
      ],
      slides: [
        { type: 'text', title: 'Sign Families', content: 'Regulatory signs tell you what must be done. Warning signs prepare you for risk. Guide signs help you navigate.', description: 'A simple way to classify signs.', skillLevel: 'Beginner' },
        { type: 'image', title: 'Pavement Markings', content: 'Solid lines, broken lines, arrows, and pedestrian crossings all tell drivers what is safe and legal.', description: 'Reading road surface instructions.', skillLevel: 'Beginner', color: '7c3aed' },
        { type: 'video', title: 'Work Zone Awareness', content: 'Temporary signs and cones override normal flow. Slow down and follow the temporary lane path.', description: 'Short work-zone example.', skillLevel: 'Intermediate' },
      ],
    },
    {
      id: 'vehicle-maintenance',
      title: 'Vehicle Maintenance Basics',
      description: 'Build a pre-ride or pre-drive checklist for tires, lights, brakes, fluids, and emergency readiness.',
      isActive: true,
      position: 4,
      createdBy: 'admin',
      updatedBy: 'admin',
      categoryIds: ['motorcycle-training', 'car-training'],
      objectives: [
        'Inspect tires, lights, and brakes before travel.',
        'Know when a vehicle should not be driven.',
        'Prepare basic safety items for emergencies.',
      ],
      slides: [
        { type: 'text', title: 'Before You Move', content: 'A two-minute inspection can prevent a roadside emergency. Check tires, lights, mirrors, controls, and leaks.', description: 'Daily readiness checklist.', skillLevel: 'Beginner' },
        { type: 'image', title: 'Tire Check', content: 'Look for underinflation, cracks, bulges, nails, and uneven wear before every longer trip.', description: 'Reading tire condition.', skillLevel: 'Beginner', color: 'be123c' },
        { type: 'video', title: 'Brake Feel', content: 'Brake response should feel firm and predictable. Stop and inspect if braking feels soft or uneven.', description: 'Basic brake feel demo.', skillLevel: 'Intermediate' },
      ],
    },
    {
      id: 'night-driving',
      title: 'Night Driving Safety',
      description: 'Adjust speed, visibility, glare handling, and following distance when the road gets dark.',
      isActive: true,
      position: 5,
      createdBy: 'admin',
      updatedBy: 'admin',
      categoryIds: ['car-training', 'professional-road-readiness'],
      objectives: [
        'Choose safer speeds at night.',
        'Handle glare without drifting.',
        'Use lighting correctly and courteously.',
      ],
      slides: [
        { type: 'text', title: 'Drive Within Your Headlights', content: 'At night, you must be able to stop within the distance your headlights reveal.', description: 'The key night-driving rule.', skillLevel: 'Beginner' },
        { type: 'image', title: 'Glare Control', content: 'Avoid staring at incoming headlights. Use lane markings and road edges to keep orientation.', description: 'Managing visibility limitations.', skillLevel: 'Intermediate', color: '4338ca' },
        { type: 'video', title: 'Low Visibility Decisions', content: 'This short example shows speed reduction and following distance in low visibility.', description: 'Night-time scanning example.', skillLevel: 'Expert' },
      ],
    },
    {
      id: 'emergency-handling',
      title: 'Emergency Situations Handling',
      description: 'Respond safely to brake failure, tire blowouts, overheating, roadside stops, and minor collisions.',
      isActive: true,
      position: 6,
      createdBy: 'admin',
      updatedBy: 'admin',
      categoryIds: ['motorcycle-training', 'professional-road-readiness'],
      objectives: [
        'Stay calm and prioritize control during emergencies.',
        'Use safe stopping procedures after a failure.',
        'Protect people and evidence after a collision.',
      ],
      slides: [
        { type: 'text', title: 'First Priority: Control', content: 'In any emergency, keep the vehicle stable first. Signal, slow gradually when possible, and move to a safer area.', description: 'A calm order of operations.', skillLevel: 'Beginner' },
        { type: 'image', title: 'Roadside Stop', content: 'Choose a visible stopping point, use hazard lights, and keep passengers away from traffic.', description: 'Safe roadside positioning.', skillLevel: 'Intermediate', color: 'b45309' },
        { type: 'video', title: 'Tire Blowout Response', content: 'Hold steady, avoid hard braking, ease off the accelerator, and guide the vehicle to safety.', description: 'Blowout response demo.', skillLevel: 'Expert' },
      ],
    },
  ].map(module => ({
    ...module,
    thumbnailUrl: imageUrl(module.title, '334155'),
    thumbnailPath: `seed/modules/${module.id}/thumbnail.png`,
    createdAt: now,
    updatedAt: now,
  }));
}

function buildModuleRecords(modules, now) {
  const moduleDocs = modules.map(({ categoryIds, objectives, slides, ...module }) => module);
  const objectiveDocs = [];
  const slideDocs = [];
  const categoryModuleDocs = [];

  modules.forEach(module => {
    module.objectives.forEach((objective, index) => {
      objectiveDocs.push({
        id: `${module.id}-objective-${index + 1}`,
        moduleId: module.id,
        objective,
        position: index + 1,
        createdAt: now,
        updatedAt: now,
      });
    });

    module.slides.forEach((slide, index) => {
      const slideId = `${module.id}-slide-${index + 1}`;
      const isImage = slide.type === 'image';
      const isVideo = slide.type === 'video';
      slideDocs.push({
        id: slideId,
        moduleId: module.id,
        type: slide.type,
        title: slide.title,
        content: slide.content,
        description: slide.description,
        position: index + 1,
        skillLevel: slide.skillLevel,
        imageUrl: isImage ? imageUrl(`${module.title} - ${slide.title}`, slide.color) : null,
        imagePath: isImage ? `seed/modules/${module.id}/slides/${slideId}.png` : null,
        imageMime: isImage ? 'image/png' : null,
        videoUrl: isVideo ? videoUrl(slideId) : null,
        videoPath: isVideo ? `seed/modules/${module.id}/slides/${slideId}.mp4` : null,
        createdAt: now,
        updatedAt: now,
      });
    });

    module.categoryIds.forEach((categoryId, index) => {
      categoryModuleDocs.push({
        id: `${categoryId}_${module.id}`,
        categoryId,
        moduleId: module.id,
        position: module.position + index,
        createdAt: now,
      });
    });
  });

  return { moduleDocs, objectiveDocs, slideDocs, categoryModuleDocs };
}

function buildQuizzes(modules, now) {
  const quizzes = [];
  const questions = [];

  const fullQuestionSet = [
    {
      id: 'traffic-q1',
      type: 'MULTIPLE_CHOICE',
      question: 'What should you do before entering an intersection with a stop sign?',
      description: 'Full stop first, then scan before moving.',
      options: [
        option('traffic-q1-a', 'Stop completely and check all directions', true, 1),
        option('traffic-q1-b', 'Speed up to clear the intersection quickly', false, 2),
        option('traffic-q1-c', 'Follow the vehicle ahead without stopping', false, 3),
        option('traffic-q1-d', 'Stop only if another vehicle is visible', false, 4),
      ],
    },
    {
      id: 'traffic-q2',
      type: 'TRUE_FALSE',
      question: 'A yellow traffic light means you should prepare to stop when safe.',
      description: 'Yellow warns that the signal is about to turn red.',
      options: [
        option('traffic-q2-true', 'True', true, 1),
        option('traffic-q2-false', 'False', false, 2),
      ],
    },
    {
      id: 'traffic-q3',
      type: 'IDENTIFICATION',
      question: 'What is the road rule that decides who goes first called?',
      description: 'This checks the learner vocabulary for priority movement.',
      options: [option('traffic-q3-answer', 'right of way', true, 1)],
    },
    {
      id: 'traffic-q4',
      type: 'ESSAY',
      question: 'Explain how you would approach a busy pedestrian crossing.',
      description: 'Essay answers are stored for manual review.',
      options: [],
    },
    {
      id: 'traffic-q5',
      type: 'MULTIPLE_ANSWER',
      question: 'Which actions improve defensive driving?',
      description: 'Multiple answers can be correct.',
      options: [
        option('traffic-q5-a', 'Keep a safe following distance', true, 1),
        option('traffic-q5-b', 'Scan mirrors regularly', true, 2),
        option('traffic-q5-c', 'Tailgate slow vehicles', false, 3),
        option('traffic-q5-d', 'Anticipate hidden hazards', true, 4),
      ],
    },
    {
      id: 'traffic-q6',
      type: 'MATCHING',
      question: 'Match each sign family to its purpose.',
      description: 'Matching questions are seeded as admin-editable samples.',
      options: [
        option('traffic-q6-a', 'Regulatory -> must obey', true, 1),
        option('traffic-q6-b', 'Warning -> upcoming hazard', true, 2),
        option('traffic-q6-c', 'Guide -> route information', true, 3),
      ],
    },
    {
      id: 'traffic-q7',
      type: 'FILL_BLANK',
      question: 'Keep at least a ___-second following distance in normal conditions.',
      description: 'The usual minimum recommendation is three seconds.',
      options: [option('traffic-q7-answer', 'three', true, 1)],
    },
  ];

  modules.forEach((module, moduleIndex) => {
    const quizId = `${module.id}-quiz`;
    quizzes.push({
      id: quizId,
      moduleId: module.id,
      title: `${module.title} Quiz`,
      description: `Check your understanding of ${module.title}.`,
      instructions: 'Choose the best answer. Some questions may have more than one correct answer.',
      passingScore: 70,
      timeLimit: 30,
      shuffleQuestions: false,
      shuffle: false,
      showResults: true,
      isActive: true,
      position: moduleIndex + 1,
      maxAttempts: 3,
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: now,
      updatedAt: now,
    });

    const quizQuestions = module.id === 'traffic-rules'
      ? fullQuestionSet
      : [
          {
            id: `${module.id}-q1`,
            type: 'MULTIPLE_CHOICE',
            question: `What is a key habit for ${module.title.toLowerCase()}?`,
            description: 'A safe habit should reduce risk and improve control.',
            options: [
              option(`${module.id}-q1-a`, 'Slow down, scan, and act early', true, 1),
              option(`${module.id}-q1-b`, 'React only when danger is close', false, 2),
              option(`${module.id}-q1-c`, 'Ignore road conditions', false, 3),
              option(`${module.id}-q1-d`, 'Rely only on other drivers', false, 4),
            ],
          },
          {
            id: `${module.id}-q2`,
            type: 'TRUE_FALSE',
            question: `${module.title} requires attention before the vehicle moves.`,
            description: 'Safe driving starts before acceleration.',
            options: [
              option(`${module.id}-q2-true`, 'True', true, 1),
              option(`${module.id}-q2-false`, 'False', false, 2),
            ],
          },
          {
            id: `${module.id}-q3`,
            type: 'IDENTIFICATION',
            question: 'What word describes a possible source of danger on the road?',
            description: 'This checks core defensive driving language.',
            options: [option(`${module.id}-q3-answer`, 'hazard', true, 1)],
          },
        ];

    quizQuestions.forEach((question, index) => {
      const hasMedia = module.id === 'traffic-rules' && index === 0;
      questions.push({
        id: question.id,
        quizId,
        type: question.type,
        question: question.question,
        questionText: question.question,
        description: question.description,
        points: question.type === 'ESSAY' ? 5 : 1,
        position: index + 1,
        isRequired: true,
        imageUrl: hasMedia ? imageUrl('Intersection Question', '0f766e') : null,
        imagePath: hasMedia ? `seed/quizzes/${quizId}/${question.id}.png` : null,
        imageMime: hasMedia ? 'image/png' : null,
        videoUrl: null,
        videoPath: null,
        caseSensitive: false,
        shuffleOptions: false,
        options: question.options,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  quizzes.push({
    id: 'final-readiness-quiz',
    moduleId: null,
    title: 'Final Road Readiness Quiz',
    description: 'A standalone quiz that samples the whole program.',
    instructions: 'Use this as a practice assessment after several modules.',
    passingScore: 75,
    timeLimit: 45,
    shuffleQuestions: true,
    shuffle: true,
    showResults: true,
    isActive: true,
    position: modules.length + 1,
    maxAttempts: 5,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: now,
    updatedAt: now,
  });

  questions.push({
    id: 'final-q1',
    quizId: 'final-readiness-quiz',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the safest first response when road conditions suddenly worsen?',
    questionText: 'What is the safest first response when road conditions suddenly worsen?',
    description: 'Speed should match conditions.',
    points: 1,
    position: 1,
    isRequired: true,
    imageUrl: null,
    imagePath: null,
    imageMime: null,
    videoUrl: null,
    videoPath: null,
    caseSensitive: false,
    shuffleOptions: false,
    options: [
      option('final-q1-a', 'Reduce speed and increase following distance', true, 1),
      option('final-q1-b', 'Maintain speed to avoid delays', false, 2),
      option('final-q1-c', 'Use high beams in all conditions', false, 3),
      option('final-q1-d', 'Drive closer to the vehicle ahead', false, 4),
    ],
    createdAt: now,
    updatedAt: now,
  });

  return { quizzes, questions };
}

function buildStudentModules(modules, now) {
  const enrollmentUsers = [
    { userId: 'user', categoryId: 'motorcycle-training', skillLevel: 'Beginner', completedCount: 2 },
    { userId: 'juan-santos', categoryId: 'car-training', skillLevel: 'Intermediate', completedCount: 3 },
    { userId: 'ana-reyes', categoryId: 'professional-road-readiness', skillLevel: 'Expert', completedCount: 1 },
  ];

  const docs = [];
  enrollmentUsers.forEach(enrollment => {
    const categoryModules = modules
      .filter(module => module.categoryIds.includes(enrollment.categoryId))
      .sort((a, b) => a.position - b.position);

    categoryModules.forEach((module, index) => {
      const isCompleted = index < enrollment.completedCount;
      const progress = isCompleted ? 100 : index === enrollment.completedCount ? 45 : 0;
      docs.push({
        id: `${enrollment.userId}_${enrollment.categoryId}_${module.id}`,
        userId: enrollment.userId,
        categoryId: enrollment.categoryId,
        moduleId: module.id,
        position: index + 1,
        status: isCompleted ? 'COMPLETED' : 'ONGOING',
        skillLevel: enrollment.skillLevel,
        progress,
        currentSlideId: `${module.id}-slide-1`,
        isCompleted,
        quizScore: isCompleted ? 88 - index * 4 : null,
        quizAttempts: isCompleted ? 1 : 0,
        quizPassed: isCompleted,
        lastQuizAttemptId: isCompleted ? `${enrollment.userId}_${module.id}_attempt_1` : null,
        startedAt: isoDaysAgo(14 + index),
        completedAt: isCompleted ? isoDaysAgo(10 - index) : null,
        createdAt: isoDaysAgo(14 + index),
        updatedAt: now,
      });
    });
  });

  return docs;
}

function buildQuizAttempts(now) {
  return [
    {
      id: 'user_traffic-rules_attempt_1',
      userId: 'user',
      quizId: 'traffic-rules-quiz',
      score: 86,
      passed: true,
      timeSpent: 420,
      startedAt: isoDaysAgo(5),
      submittedAt: isoDaysAgo(5),
      answers: [
        { questionId: 'traffic-q1', selectedOptionId: 'traffic-q1-a', answerText: null, isCorrect: true, pointsEarned: 1 },
        { questionId: 'traffic-q2', selectedOptionId: 'traffic-q2-true', answerText: null, isCorrect: true, pointsEarned: 1 },
        { questionId: 'traffic-q3', selectedOptionId: null, answerText: 'right of way', isCorrect: true, pointsEarned: 1 },
        { questionId: 'traffic-q5', selectedOptionId: ['traffic-q5-a', 'traffic-q5-b', 'traffic-q5-d'], answerText: null, isCorrect: true, pointsEarned: 1 },
      ],
      createdAt: isoDaysAgo(5),
      updatedAt: now,
    },
    {
      id: 'juan_defensive-driving_attempt_1',
      userId: 'juan-santos',
      quizId: 'defensive-driving-quiz',
      score: 92,
      passed: true,
      timeSpent: 360,
      startedAt: isoDaysAgo(12),
      submittedAt: isoDaysAgo(12),
      answers: [
        { questionId: 'defensive-driving-q1', selectedOptionId: 'defensive-driving-q1-a', answerText: null, isCorrect: true, pointsEarned: 1 },
        { questionId: 'defensive-driving-q2', selectedOptionId: 'defensive-driving-q2-true', answerText: null, isCorrect: true, pointsEarned: 1 },
        { questionId: 'defensive-driving-q3', selectedOptionId: null, answerText: 'hazard', isCorrect: true, pointsEarned: 1 },
      ],
      createdAt: isoDaysAgo(12),
      updatedAt: now,
    },
    {
      id: 'ana_night-driving_attempt_1',
      userId: 'ana-reyes',
      quizId: 'night-driving-quiz',
      score: 67,
      passed: false,
      timeSpent: 510,
      startedAt: isoDaysAgo(2),
      submittedAt: isoDaysAgo(2),
      answers: [
        { questionId: 'night-driving-q1', selectedOptionId: 'night-driving-q1-b', answerText: null, isCorrect: false, pointsEarned: 0 },
        { questionId: 'night-driving-q2', selectedOptionId: 'night-driving-q2-true', answerText: null, isCorrect: true, pointsEarned: 1 },
      ],
      createdAt: isoDaysAgo(2),
      updatedAt: now,
    },
  ];
}

async function buildRegistrationRequests(now) {
  const pendingHash = await bcrypt.hash('pending123', 10);
  const approvedHash = await bcrypt.hash('approved123', 10);
  const rejectedHash = await bcrypt.hash('rejected123', 10);

  const base = {
    middle_name: null,
    name_extension: null,
    birthdate: '2000-01-01',
    sex: 'Male',
    nationality: 'Filipino',
    civil_status: 'Single',
    weight: 65,
    height: 168,
    blood_type: 'O+',
    eye_color: 'Brown',
    address_house_no: '1',
    address_street: 'Applicant Street',
    address_barangay: 'Centro',
    address_city_municipality: 'Makati',
    address_province: 'Metro Manila',
    telephone_number: null,
    cellphone_number: '09179990000',
    emergency_contact_name: 'Emergency Contact',
    emergency_contact_relationship: 'Sibling',
    emergency_contact_number: '09179990001',
    student_type: 'B',
    createdAt: now,
    updatedAt: now,
  };

  return [
    {
      ...base,
      id: 'request-pending',
      email: 'pending.student@ridermind.test',
      email_address: 'pending.student@ridermind.test',
      passwordHash: pendingHash,
      first_name: 'Pending',
      last_name: 'Applicant',
      status: 'PENDING',
      userId: null,
      requestedAt: isoDaysAgo(1),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      paymentReceiptUrl: null,
      orNumber: null,
    },
    {
      ...base,
      id: 'request-approved',
      email: 'approved.student@ridermind.test',
      email_address: 'approved.student@ridermind.test',
      passwordHash: approvedHash,
      first_name: 'Approved',
      last_name: 'Applicant',
      status: 'APPROVED',
      userId: 'user',
      requestedAt: isoDaysAgo(8),
      reviewedAt: isoDaysAgo(7),
      reviewedBy: 'admin',
      rejectionReason: null,
      paymentReceiptUrl: imageUrl('Approved Receipt', '166534'),
      orNumber: 'OR-2026-0100',
    },
    {
      ...base,
      id: 'request-rejected',
      email: 'rejected.student@ridermind.test',
      email_address: 'rejected.student@ridermind.test',
      passwordHash: rejectedHash,
      first_name: 'Rejected',
      last_name: 'Applicant',
      status: 'REJECTED',
      userId: null,
      requestedAt: isoDaysAgo(12),
      reviewedAt: isoDaysAgo(11),
      reviewedBy: 'admin',
      rejectionReason: 'Sample rejection: uploaded receipt was unreadable.',
      paymentReceiptUrl: null,
      orNumber: null,
    },
  ];
}

function buildFaqs(now) {
  return [
    { id: 'faq-general-account', category: 'General', question: 'How do I start learning?', answer: 'Create an account, choose a training category, and open your assigned modules from the Modules page.', isActive: true, createdAt: now, updatedAt: now },
    { id: 'faq-general-progress', category: 'General', question: 'Can I continue where I left off?', answer: 'Yes. RiderMind saves your current slide and progress as you move through a module.', isActive: true, createdAt: now, updatedAt: now },
    { id: 'faq-system-password', category: 'System', question: 'What should I do if I forget my password?', answer: 'Use the forgot password page and follow the reset link sent to your registered email address.', isActive: true, createdAt: now, updatedAt: now },
    { id: 'faq-module-skill', category: 'Module', question: 'Why do some students see different slides?', answer: 'Slides can be filtered by skill level so learners see material appropriate to Beginner, Intermediate, or Expert levels.', isActive: true, createdAt: now, updatedAt: now },
    { id: 'faq-quiz-retake', category: 'Quiz', question: 'Can I retake quizzes?', answer: 'Most quizzes allow multiple attempts. The exact limit is controlled by the quiz settings.', isActive: true, createdAt: now, updatedAt: now },
  ];
}

function buildFeedback(now) {
  return [
    { id: 'feedback-user-traffic', userId: 'user', moduleId: 'traffic-rules', rating: 5, comment: 'Clear examples made right-of-way rules easier to remember.', isLike: true, isActive: true, createdAt: isoDaysAgo(4), updatedAt: now },
    { id: 'feedback-juan-defensive', userId: 'juan-santos', moduleId: 'defensive-driving', rating: 4, comment: 'The scanning checklist is useful during practice drives.', isLike: true, isActive: true, createdAt: isoDaysAgo(10), updatedAt: now },
    { id: 'feedback-ana-night', userId: 'ana-reyes', moduleId: 'night-driving', rating: 3, comment: 'More local night-driving examples would help.', isLike: false, isActive: true, createdAt: isoDaysAgo(2), updatedAt: now },
  ];
}

function buildQuizReactions(now) {
  return [
    { id: 'reaction-user-traffic-q1', userId: 'user', questionId: 'traffic-q1', isLike: true, createdAt: isoDaysAgo(4), updatedAt: now },
    { id: 'reaction-juan-traffic-q5', userId: 'juan-santos', questionId: 'traffic-q5', isLike: true, createdAt: isoDaysAgo(9), updatedAt: now },
    { id: 'reaction-ana-night-q1', userId: 'ana-reyes', questionId: 'night-driving-q1', isLike: false, createdAt: isoDaysAgo(2), updatedAt: now },
  ];
}

async function buildSeedData() {
  const now = new Date().toISOString();
  const users = await buildUsers(now);
  const categories = buildCategories(now);
  const modules = buildModules(now);
  const { moduleDocs, objectiveDocs, slideDocs, categoryModuleDocs } = buildModuleRecords(modules, now);
  const { quizzes, questions } = buildQuizzes(modules, now);
  const studentModules = buildStudentModules(modules, now);
  const quizAttempts = buildQuizAttempts(now);
  const registrationRequests = await buildRegistrationRequests(now);
  const faqs = buildFaqs(now);
  const moduleFeedback = buildFeedback(now);
  const quizReactions = buildQuizReactions(now);

  return {
    [COLLECTIONS.USERS]: users,
    [COLLECTIONS.REGISTRATION_REQUESTS]: registrationRequests,
    [COLLECTIONS.MODULE_CATEGORIES]: categories,
    [COLLECTIONS.MODULES]: moduleDocs,
    [COLLECTIONS.MODULE_OBJECTIVES]: objectiveDocs,
    [COLLECTIONS.MODULE_SLIDES]: slideDocs,
    [COLLECTIONS.MODULE_CATEGORY_MODULES]: categoryModuleDocs,
    [COLLECTIONS.STUDENT_MODULES]: studentModules,
    [COLLECTIONS.QUIZZES]: quizzes,
    [COLLECTIONS.QUIZ_QUESTIONS]: questions,
    [COLLECTIONS.QUIZ_ATTEMPTS]: quizAttempts,
    [COLLECTIONS.FAQS]: faqs,
    [COLLECTIONS.MODULE_FEEDBACK]: moduleFeedback,
    [COLLECTIONS.QUIZ_REACTIONS]: quizReactions,
  };
}

async function deleteCollection(db, collectionName) {
  let deleted = 0;

  while (true) {
    const snapshot = await db.collection(collectionName).limit(DELETE_BATCH_SIZE).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    deleted += snapshot.size;
  }

  return deleted;
}

export async function clearFirestoreSeedData(options = {}) {
  initializeFirebaseAdminForSeed();
  const db = getDb();
  const log = options.log === false ? null : options.log || console.log;
  const deleted = {};

  for (const collectionName of CLEAR_ORDER) {
    deleted[collectionName] = await deleteCollection(db, collectionName);
    if (log) log(`Cleared ${deleted[collectionName]} from ${collectionName}`);
  }

  return deleted;
}

async function writeCollection(db, collectionName, docs) {
  let written = 0;

  for (let i = 0; i < docs.length; i += DELETE_BATCH_SIZE) {
    const chunk = docs.slice(i, i + DELETE_BATCH_SIZE);
    const batch = db.batch();
    chunk.forEach(({ id, ...data }) => {
      batch.set(db.collection(collectionName).doc(id), data);
    });
    await batch.commit();
    written += chunk.length;
  }

  return written;
}

export async function seedFirestore(options = {}) {
  initializeFirebaseAdminForSeed();
  const db = getDb();
  const log = options.log === false ? null : options.log || console.log;
  const clearFirst = options.clear !== false;

  if (clearFirst) {
    await clearFirestoreSeedData({ log });
  }

  const seedData = await buildSeedData();
  const counts = {};

  const writeOrder = [
    COLLECTIONS.USERS,
    COLLECTIONS.REGISTRATION_REQUESTS,
    COLLECTIONS.MODULE_CATEGORIES,
    COLLECTIONS.MODULES,
    COLLECTIONS.MODULE_OBJECTIVES,
    COLLECTIONS.MODULE_SLIDES,
    COLLECTIONS.MODULE_CATEGORY_MODULES,
    COLLECTIONS.STUDENT_MODULES,
    COLLECTIONS.QUIZZES,
    COLLECTIONS.QUIZ_QUESTIONS,
    COLLECTIONS.QUIZ_ATTEMPTS,
    COLLECTIONS.FAQS,
    COLLECTIONS.MODULE_FEEDBACK,
    COLLECTIONS.QUIZ_REACTIONS,
  ];

  for (const collectionName of writeOrder) {
    counts[collectionName] = await writeCollection(db, collectionName, seedData[collectionName] || []);
    if (log) log(`Seeded ${counts[collectionName]} into ${collectionName}`);
  }

  return {
    counts,
    accounts: SAMPLE_ACCOUNTS,
  };
}
