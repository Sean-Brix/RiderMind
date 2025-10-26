import { PrismaClient } from '@prisma/client';
import colors from 'colors';

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 600) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

// Complete quiz data for all 11 modules
const quizzesData = [
  {
    title: 'Introduction to Road Safety Quiz',
    moduleIndex: 1,
    description: 'Test your knowledge on basic road safety principles and defensive driving',
    instructions: 'Answer all questions to the best of your ability. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What does a red traffic light mean?',
        points: 2,
        position: 1,
        shuffleOptions: true,
        options: [
          { text: 'Stop completely', isCorrect: true, position: 1 },
          { text: 'Slow down', isCorrect: false, position: 2 },
          { text: 'Proceed with caution', isCorrect: false, position: 3 },
          { text: 'Speed up', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Defensive driving means anticipating dangerous situations and making safe decisions.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the minimum safe following distance in good weather conditions?',
        points: 2,
        position: 3,
        shuffleOptions: true,
        options: [
          { text: 'One car length', isCorrect: false, position: 1 },
          { text: 'Two seconds', isCorrect: true, position: 2 },
          { text: 'Five seconds', isCorrect: false, position: 3 },
          { text: 'Ten meters', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'Which are common road hazards? (Select all that apply)',
        points: 3,
        position: 4,
        shuffleOptions: false,
        options: [
          { text: 'Wet or slippery roads', isCorrect: true, position: 1 },
          { text: 'Pedestrians crossing', isCorrect: true, position: 2 },
          { text: 'Clear visibility', isCorrect: false, position: 3 },
          { text: 'Potholes and road debris', isCorrect: true, position: 4 },
          { text: 'Well-maintained roads', isCorrect: false, position: 5 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What shape is a STOP sign?',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'octagon', isCorrect: true, position: 1 },
          { text: 'Octagon', isCorrect: true, position: 2 },
          { text: 'OCTAGON', isCorrect: true, position: 3 }
        ]
      }
    ]
  },
  {
    title: 'Traffic Rules and Regulations Quiz',
    moduleIndex: 2,
    description: 'Test your understanding of Philippine traffic laws and regulations',
    instructions: 'Complete all questions. Passing score: 70%',
    passingScore: 70,
    timeLimit: 20,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the speed limit in school zones in the Philippines?',
        points: 2,
        position: 1,
        options: [
          { text: '20 km/h', isCorrect: false, position: 1 },
          { text: '30 km/h', isCorrect: true, position: 2 },
          { text: '40 km/h', isCorrect: false, position: 3 },
          { text: '50 km/h', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'At an intersection without signals, vehicles on the right generally have priority.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the maximum speed limit on Philippine expressways?',
        points: 2,
        position: 3,
        options: [
          { text: '80 km/h', isCorrect: false, position: 1 },
          { text: '100 km/h', isCorrect: true, position: 2 },
          { text: '120 km/h', isCorrect: false, position: 3 },
          { text: '60 km/h', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'When must you yield the right-of-way? (Select all that apply)',
        points: 3,
        position: 4,
        options: [
          { text: 'To emergency vehicles', isCorrect: true, position: 1 },
          { text: 'To pedestrians at crosswalks', isCorrect: true, position: 2 },
          { text: 'When you have a green light', isCorrect: false, position: 3 },
          { text: 'To vehicles already in an intersection', isCorrect: true, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What document governs all road users in the Philippines?',
        description: 'Full name of the traffic code',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'Land Transportation and Traffic Code', isCorrect: true, position: 1 },
          { text: 'land transportation and traffic code', isCorrect: true, position: 2 },
          { text: 'LTTC', isCorrect: true, position: 3 }
        ]
      }
    ]
  },
  {
    title: 'Vehicle Safety and Maintenance Quiz',
    moduleIndex: 3,
    description: 'Test your knowledge on vehicle inspection and maintenance',
    instructions: 'Answer all questions. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What should you check during a pre-ride safety inspection? (Select all that apply)',
        points: 3,
        position: 1,
        options: [
          { text: 'Tire pressure and tread', isCorrect: true, position: 1 },
          { text: 'Brake function and fluid', isCorrect: true, position: 2 },
          { text: 'Radio station', isCorrect: false, position: 3 },
          { text: 'All lights working', isCorrect: true, position: 4 },
          { text: 'Oil levels', isCorrect: true, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the minimum tire tread depth before replacement?',
        points: 2,
        position: 2,
        options: [
          { text: '0.5mm', isCorrect: false, position: 1 },
          { text: '1.6mm', isCorrect: true, position: 2 },
          { text: '3.0mm', isCorrect: false, position: 3 },
          { text: '5.0mm', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'You should have your brakes inspected every 6 months.',
        points: 1,
        position: 3,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'How often should you rotate your tires for even wear?',
        points: 2,
        position: 4,
        options: [
          { text: 'Every 5,000 km', isCorrect: false, position: 1 },
          { text: 'Every 10,000 km', isCorrect: true, position: 2 },
          { text: 'Every 20,000 km', isCorrect: false, position: 3 },
          { text: 'Never needed', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What warning sign indicates brake problems? (Name one)',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'squealing', isCorrect: true, position: 1 },
          { text: 'grinding', isCorrect: true, position: 2 },
          { text: 'soft brake pedal', isCorrect: true, position: 3 },
          { text: 'noise', isCorrect: true, position: 4 }
        ]
      }
    ]
  },
  {
    title: 'Weather and Road Conditions Quiz',
    moduleIndex: 4,
    description: 'Learn how to drive safely in various weather and road conditions',
    instructions: 'Complete all questions. Passing score: 70%',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'How should you adjust your following distance in rain?',
        points: 2,
        position: 1,
        options: [
          { text: 'Keep it the same', isCorrect: false, position: 1 },
          { text: 'Double it (4 seconds)', isCorrect: true, position: 2 },
          { text: 'Reduce it for better visibility', isCorrect: false, position: 3 },
          { text: 'No change needed', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Hydroplaning occurs when your tires lose contact with the road due to water.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What should you do when driving in heavy rain? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Reduce speed', isCorrect: true, position: 1 },
          { text: 'Turn on headlights', isCorrect: true, position: 2 },
          { text: 'Use high beams', isCorrect: false, position: 3 },
          { text: 'Increase following distance', isCorrect: true, position: 4 },
          { text: 'Drive faster to get out of rain', isCorrect: false, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What causes reduced visibility during fog?',
        points: 2,
        position: 4,
        options: [
          { text: 'Suspended water droplets in air', isCorrect: true, position: 1 },
          { text: 'Dust particles', isCorrect: false, position: 2 },
          { text: 'Smoke from vehicles', isCorrect: false, position: 3 },
          { text: 'Low sunlight', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What type of lights should you use in fog?',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'low beams', isCorrect: true, position: 1 },
          { text: 'low beam', isCorrect: true, position: 2 },
          { text: 'fog lights', isCorrect: true, position: 3 }
        ]
      }
    ]
  },
  {
    title: 'Night Driving Safety Quiz',
    moduleIndex: 5,
    description: 'Master safe driving techniques for nighttime conditions',
    instructions: 'Answer all questions. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'When should you use high beam headlights?',
        points: 2,
        position: 1,
        options: [
          { text: 'Always at night', isCorrect: false, position: 1 },
          { text: 'On open roads with no oncoming traffic', isCorrect: true, position: 2 },
          { text: 'In the city', isCorrect: false, position: 3 },
          { text: 'During fog', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Your depth perception and peripheral vision are reduced at night.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What are challenges of night driving? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Reduced visibility', isCorrect: true, position: 1 },
          { text: 'Glare from oncoming headlights', isCorrect: true, position: 2 },
          { text: 'Better road conditions', isCorrect: false, position: 3 },
          { text: 'Fatigue', isCorrect: true, position: 4 },
          { text: 'Impaired drivers', isCorrect: true, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'If blinded by oncoming headlights, where should you look?',
        points: 2,
        position: 4,
        options: [
          { text: 'Directly at the lights', isCorrect: false, position: 1 },
          { text: 'At the right edge of the road', isCorrect: true, position: 2 },
          { text: 'Close your eyes briefly', isCorrect: false, position: 3 },
          { text: 'At the center line', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'At what distance should you dim your high beams for oncoming traffic?',
        description: 'Answer in meters',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: '150', isCorrect: true, position: 1 },
          { text: '150m', isCorrect: true, position: 2 },
          { text: '150 meters', isCorrect: true, position: 3 }
        ]
      }
    ]
  },
  {
    title: 'Motorcycle Riding Techniques Quiz',
    moduleIndex: 6,
    description: 'Test your knowledge on safe motorcycle riding practices',
    instructions: 'Complete all questions. Passing score: 70%',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the proper riding position on a motorcycle?',
        points: 2,
        position: 1,
        options: [
          { text: 'Slouched back', isCorrect: false, position: 1 },
          { text: 'Upright with knees gripping tank', isCorrect: true, position: 2 },
          { text: 'Leaning forward constantly', isCorrect: false, position: 3 },
          { text: 'Standing up', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'You should always wear a DOT-approved helmet when riding.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What are essential motorcycle safety gear? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Helmet', isCorrect: true, position: 1 },
          { text: 'Gloves', isCorrect: true, position: 2 },
          { text: 'Flip-flops', isCorrect: false, position: 3 },
          { text: 'Protective jacket', isCorrect: true, position: 4 },
          { text: 'Sturdy boots', isCorrect: true, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'How should you take a curve on a motorcycle?',
        points: 2,
        position: 4,
        options: [
          { text: 'Brake hard in the curve', isCorrect: false, position: 1 },
          { text: 'Slow down before, lean into the curve', isCorrect: true, position: 2 },
          { text: 'Speed up through the curve', isCorrect: false, position: 3 },
          { text: 'Stay completely upright', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What technique helps you see through a curve before entering?',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'look ahead', isCorrect: true, position: 1 },
          { text: 'looking ahead', isCorrect: true, position: 2 },
          { text: 'visual lead', isCorrect: true, position: 3 },
          { text: 'scanning', isCorrect: true, position: 4 }
        ]
      }
    ]
  },
  {
    title: 'Emergency Situations Quiz',
    moduleIndex: 7,
    description: 'Learn how to handle emergency situations on the road',
    instructions: 'Answer all questions. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What should you do if your brakes fail?',
        points: 2,
        position: 1,
        options: [
          { text: 'Pump the brakes and downshift', isCorrect: true, position: 1 },
          { text: 'Turn off the engine', isCorrect: false, position: 2 },
          { text: 'Speed up to get off the road', isCorrect: false, position: 3 },
          { text: 'Use the horn', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'If your tire blows out, you should brake hard immediately.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: false, position: 1 },
          { text: 'False', isCorrect: true, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What items should be in your emergency kit? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'First aid kit', isCorrect: true, position: 1 },
          { text: 'Warning triangle', isCorrect: true, position: 2 },
          { text: 'Fast food menu', isCorrect: false, position: 3 },
          { text: 'Flashlight', isCorrect: true, position: 4 },
          { text: 'Jumper cables', isCorrect: true, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'If you experience a tire blowout, you should:',
        points: 2,
        position: 4,
        options: [
          { text: 'Grip steering wheel firmly and slow gradually', isCorrect: true, position: 1 },
          { text: 'Brake hard immediately', isCorrect: false, position: 2 },
          { text: 'Accelerate to maintain control', isCorrect: false, position: 3 },
          { text: 'Turn sharply to the side', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What number should you call for emergency assistance in the Philippines?',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: '911', isCorrect: true, position: 1 },
          { text: '117', isCorrect: true, position: 2 }
        ]
      }
    ]
  },
  {
    title: 'Pedestrian and Cyclist Safety Quiz',
    moduleIndex: 8,
    description: 'Understanding how to share the road safely with pedestrians and cyclists',
    instructions: 'Complete all questions. Passing score: 70%',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'When must you yield to pedestrians?',
        points: 2,
        position: 1,
        options: [
          { text: 'Only at marked crosswalks', isCorrect: false, position: 1 },
          { text: 'At all crosswalks and intersections', isCorrect: true, position: 2 },
          { text: 'Never, they should wait', isCorrect: false, position: 3 },
          { text: 'Only during daytime', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Cyclists have the same rights and responsibilities as motor vehicle drivers.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'How can you safely share the road with cyclists? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Give them at least 1 meter clearance when passing', isCorrect: true, position: 1 },
          { text: 'Check blind spots before turning', isCorrect: true, position: 2 },
          { text: 'Honk to make them move', isCorrect: false, position: 3 },
          { text: 'Be patient, they may be slower', isCorrect: true, position: 4 },
          { text: 'Drive in bike lanes', isCorrect: false, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What should you do when approaching a school zone?',
        points: 2,
        position: 4,
        options: [
          { text: 'Maintain normal speed', isCorrect: false, position: 1 },
          { text: 'Slow down and watch for children', isCorrect: true, position: 2 },
          { text: 'Speed up to pass quickly', isCorrect: false, position: 3 },
          { text: 'Use your horn frequently', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'How much clearance (in meters) should you give cyclists when passing?',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: '1', isCorrect: true, position: 1 },
          { text: '1m', isCorrect: true, position: 2 },
          { text: '1 meter', isCorrect: true, position: 3 },
          { text: 'one meter', isCorrect: true, position: 4 }
        ]
      }
    ]
  },
  {
    title: 'Impaired and Distracted Driving Quiz',
    moduleIndex: 9,
    description: 'Understanding the dangers of impaired and distracted driving',
    instructions: 'Answer all questions. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the legal blood alcohol limit for drivers in the Philippines?',
        points: 2,
        position: 1,
        options: [
          { text: '0.05%', isCorrect: true, position: 1 },
          { text: '0.08%', isCorrect: false, position: 2 },
          { text: '0.10%', isCorrect: false, position: 3 },
          { text: '0.00%', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Using a mobile phone while driving is illegal in the Philippines.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What are forms of distracted driving? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Texting while driving', isCorrect: true, position: 1 },
          { text: 'Eating or drinking', isCorrect: true, position: 2 },
          { text: 'Using turn signals', isCorrect: false, position: 3 },
          { text: 'Adjusting radio/GPS', isCorrect: true, position: 4 },
          { text: 'Checking mirrors', isCorrect: false, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'How does alcohol affect your driving ability?',
        points: 2,
        position: 4,
        options: [
          { text: 'Improves reaction time', isCorrect: false, position: 1 },
          { text: 'Impairs judgment and coordination', isCorrect: true, position: 2 },
          { text: 'Makes you more alert', isCorrect: false, position: 3 },
          { text: 'Has no effect', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What law in the Philippines prohibits using mobile phones while driving?',
        description: 'Common abbreviation accepted',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'Anti-Distracted Driving Act', isCorrect: true, position: 1 },
          { text: 'ADDA', isCorrect: true, position: 2 },
          { text: 'RA 10913', isCorrect: true, position: 3 }
        ]
      }
    ]
  },
  {
    title: 'Environmental Awareness Quiz',
    moduleIndex: 10,
    description: 'Learn about eco-friendly driving practices',
    instructions: 'Complete all questions. Passing score: 70%',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the most eco-friendly driving technique?',
        points: 2,
        position: 1,
        options: [
          { text: 'Aggressive acceleration', isCorrect: false, position: 1 },
          { text: 'Smooth, steady driving', isCorrect: true, position: 2 },
          { text: 'High-speed cruising', isCorrect: false, position: 3 },
          { text: 'Frequent braking', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Idling your engine for long periods wastes fuel and pollutes the air.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'How can you reduce your vehicle emissions? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Regular vehicle maintenance', isCorrect: true, position: 1 },
          { text: 'Proper tire inflation', isCorrect: true, position: 2 },
          { text: 'Carrying unnecessary weight', isCorrect: false, position: 3 },
          { text: 'Using air conditioning sparingly', isCorrect: true, position: 4 },
          { text: 'Aggressive driving', isCorrect: false, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'When should you turn off your engine instead of idling?',
        points: 2,
        position: 4,
        options: [
          { text: 'Never', isCorrect: false, position: 1 },
          { text: 'When stopped for more than 60 seconds', isCorrect: true, position: 2 },
          { text: 'Only at night', isCorrect: false, position: 3 },
          { text: 'Every time you stop', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What driving technique involves anticipating traffic to avoid unnecessary stops?',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'eco-driving', isCorrect: true, position: 1 },
          { text: 'eco driving', isCorrect: true, position: 2 },
          { text: 'ecodriving', isCorrect: true, position: 3 },
          { text: 'green driving', isCorrect: true, position: 4 }
        ]
      }
    ]
  },
  {
    title: 'Legal Responsibilities and Ethics Quiz',
    moduleIndex: 11,
    description: 'Test your knowledge on driver legal responsibilities and ethical behavior',
    instructions: 'Answer all questions. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 20,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What should you do if involved in an accident?',
        points: 2,
        position: 1,
        options: [
          { text: 'Leave immediately', isCorrect: false, position: 1 },
          { text: 'Stop, render aid, and report to authorities', isCorrect: true, position: 2 },
          { text: 'Only stop if someone is injured', isCorrect: false, position: 3 },
          { text: 'Exchange information and leave', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'You are required by law to have valid vehicle registration and insurance.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'What documents must you carry while driving? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: "Valid driver's license", isCorrect: true, position: 1 },
          { text: 'Vehicle registration (OR/CR)', isCorrect: true, position: 2 },
          { text: 'Birth certificate', isCorrect: false, position: 3 },
          { text: 'Proof of insurance', isCorrect: true, position: 4 },
          { text: 'Passport', isCorrect: false, position: 5 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the penalty for driving without a valid license in the Philippines?',
        points: 2,
        position: 4,
        options: [
          { text: 'Warning only', isCorrect: false, position: 1 },
          { text: 'Fine and possible vehicle impounding', isCorrect: true, position: 2 },
          { text: 'Community service', isCorrect: false, position: 3 },
          { text: 'No penalty', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What government agency issues driver licenses in the Philippines?',
        description: 'Full name or abbreviation',
        points: 2,
        position: 5,
        caseSensitive: false,
        options: [
          { text: 'LTO', isCorrect: true, position: 1 },
          { text: 'Land Transportation Office', isCorrect: true, position: 2 },
          { text: 'land transportation office', isCorrect: true, position: 3 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Ethical driving means considering the safety and comfort of other road users.',
        points: 1,
        position: 6,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      }
    ]
  }
];

export async function seedQuizzesComplete() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  📝 SEEDING COMPLETE QUIZ SET (11 Modules)'.bold.green);
  console.log('='.repeat(60).rainbow + '\n');

  let successCount = 0;
  let skipCount = 0;
  let totalQuestions = 0;
  let totalOptions = 0;

  // Get all modules
  const modules = await prisma.module.findMany({
    orderBy: { position: 'asc' }
  });

  if (modules.length === 0) {
    console.log('⚠️  No modules found. Please seed modules first.'.yellow);
    return { success: 0, skipped: 0 };
  }

  console.log(`📚 Found ${modules.length} modules in database\n`.cyan);

  for (const quizData of quizzesData) {
    const { questions, moduleIndex, ...quizInfo } = quizData;

    try {
      // Find the module by position (moduleIndex)
      const module = modules[moduleIndex - 1];
      
      if (!module) {
        console.log(`⚠️  Module ${moduleIndex} not found. Skipping quiz.`.yellow);
        skipCount++;
        continue;
      }

      // Check if quiz already exists for this module
      const existing = await prisma.quiz.findFirst({
        where: { 
          moduleId: module.id,
          title: quizInfo.title
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${quizInfo.title}`.yellow);
        skipCount++;
        continue;
      }

      // Animate quiz creation
      const createMessage = `[${moduleIndex}/11] ${quizInfo.title}`;
      await animateProgress(createMessage, 600);

      // Create quiz with questions and options
      await prisma.quiz.create({
        data: {
          ...quizInfo,
          moduleId: module.id,
          position: moduleIndex,
          questions: {
            create: questions.map((q) => {
              const { options, ...questionData } = q;
              
              return {
                ...questionData,
                options: {
                  create: options.map((opt) => ({
                    optionText: opt.text,
                    isCorrect: opt.isCorrect,
                    position: opt.position
                  }))
                }
              };
            })
          }
        }
      });

      const questionCount = questions.length;
      const optionCount = questions.reduce((sum, q) => sum + q.options.length, 0);
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      
      console.log(`   ❓ ${questionCount} questions (${totalPoints} points total)`.dim);
      console.log(`   ✓ ${optionCount} options`.dim);
      console.log(`   ⏱️  Time limit: ${quizInfo.timeLimit} min | 🎯 Pass: ${quizInfo.passingScore}%\n`.dim);
      
      totalQuestions += questionCount;
      totalOptions += optionCount;
      successCount++;

    } catch (error) {
      console.log(`✗ Error creating ${quizInfo.title}: ${error.message}`.red);
      console.log(`   ${error.stack}`.dim);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Quiz Seeding Results:`.bold);
  console.log(`   ✓ Created: ${successCount} quizzes`.green);
  console.log(`   ❓ Total questions: ${totalQuestions}`.cyan);
  console.log(`   ✓ Total options: ${totalOptions}`.magenta);
  console.log(`   ⏭️  Skipped: ${skipCount} quizzes`.yellow);
  console.log('─'.repeat(60).gray + '\n');

  return { success: successCount, skipped: skipCount };
}

export default seedQuizzesComplete;
