import { PrismaClient } from '@prisma/client';
import colors from 'colors';

const prisma = new PrismaClient();

const faqsData = [
  // General Category (4 FAQs)
  {
    question: 'What is RiderMind?',
    answer: 'RiderMind is a comprehensive motorcycle and vehicle learning platform designed to help students prepare for their license exams. It provides interactive modules, quizzes, and learning materials covering all aspects of riding, driving, and road safety.',
    category: 'General'
  },
  {
    question: 'How do I get started with RiderMind?',
    answer: 'To get started, simply register for an account by providing your basic information and selecting your student type (license category). Once registered, you can browse available modules, take quizzes, and track your progress through the dashboard.',
    category: 'General'
  },
  {
    question: 'What are the different student types?',
    answer: 'Student types correspond to different vehicle license categories:\n- A: Standard motorcycle\n- A1: Motorcycle with sidecar\n- B: Basic motorcycle (up to 400cc)\n- B1: Motorcycle up to 400cc\n- B2: Motorcycle up to 400cc (restricted)\n- C: Heavy motorcycle\n- D: Large displacement motorcycle\n- BE: Motorcycle with trailer\n- CE: Heavy motorcycle with trailer',
    category: 'General'
  },
  {
    question: 'Is RiderMind available on mobile devices?',
    answer: 'Yes! RiderMind is designed to be fully responsive and works seamlessly on desktops, tablets, and mobile devices. You can access your learning materials and take quizzes from anywhere at any time.',
    category: 'General'
  },

  // System Category (5 FAQs)
  {
    question: 'How do I reset my password?',
    answer: 'If you forgot your password, click on the "Forgot Password" link on the login page. Enter your registered email address, and we\'ll send you instructions to reset your password. Make sure to check your spam folder if you don\'t see the email in your inbox.',
    category: 'System'
  },
  {
    question: 'Can I change my student type after registration?',
    answer: 'Yes, you can update your student type from your profile settings. However, please note that changing your student type may affect which modules and quizzes are recommended for you. Contact an administrator if you need assistance with this change.',
    category: 'System'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We follow industry best practices for data protection and never share your information with third parties without your explicit consent.',
    category: 'System'
  },
  {
    question: 'How do I update my profile information?',
    answer: 'You can update your profile information by navigating to your account settings. Click on your profile icon in the navigation bar and select "Profile Settings". From there, you can edit your personal details, contact information, and preferences.',
    category: 'System'
  },
  {
    question: 'Why can\'t I access certain modules?',
    answer: 'Module access depends on your student type and skill level. Some advanced modules may require completion of prerequisite modules or specific quiz scores. Check your dashboard for module requirements and unlock conditions.',
    category: 'System'
  },

  // Module Category (6 FAQs)
  {
    question: 'What are learning modules?',
    answer: 'Learning modules are structured educational content that cover specific topics related to vehicle operation, traffic rules, road safety, and vehicle maintenance. Each module contains text, images, videos, and interactive elements to enhance your learning experience.',
    category: 'Module'
  },
  {
    question: 'Do I need to complete modules in order?',
    answer: 'While modules are organized in a recommended sequence, you can access them in any order based on your skill level. However, we suggest following the recommended path as later modules may build upon concepts introduced in earlier ones.',
    category: 'Module'
  },
  {
    question: 'How do I track my progress in modules?',
    answer: 'Your progress is automatically tracked as you complete modules. You can view your overall progress and completion percentage in your dashboard. Each module shows your completion status and quiz scores if applicable.',
    category: 'Module'
  },
  {
    question: 'What are skill levels in modules?',
    answer: 'Modules are divided into three skill levels: Beginner, Intermediate, and Expert. Your skill level determines which content is shown to you. As you progress and demonstrate mastery, you can access more advanced content.',
    category: 'Module'
  },
  {
    question: 'Can I provide feedback on modules?',
    answer: 'Yes! We encourage you to provide feedback on modules. You can rate modules, leave comments, and indicate whether the content was helpful. Your feedback helps us improve the learning experience for everyone.',
    category: 'Module'
  },
  {
    question: 'How long does it take to complete a module?',
    answer: 'Module completion time varies depending on the content and your learning pace. Most modules take 15-30 minutes to complete, but you can pause and resume at any time. Your progress is automatically saved.',
    category: 'Module'
  },

  // Quiz Category (6 FAQs)
  {
    question: 'How do quizzes work?',
    answer: 'Quizzes test your knowledge of the material covered in modules. Each quiz contains multiple questions of various types (multiple choice, true/false, identification, etc.). You need to achieve the passing score to successfully complete a quiz.',
    category: 'Quiz'
  },
  {
    question: 'What is the passing score for quizzes?',
    answer: 'The default passing score is 70%, but this may vary depending on the specific quiz. The required passing score is displayed before you start each quiz. Some advanced quizzes may require higher scores.',
    category: 'Quiz'
  },
  {
    question: 'Can I retake a quiz if I fail?',
    answer: 'Yes, you can retake quizzes as many times as needed to achieve the passing score. We encourage you to review the module material before retaking a quiz to improve your chances of success.',
    category: 'Quiz'
  },
  {
    question: 'Are quiz questions randomized?',
    answer: 'This depends on the quiz settings. Some quizzes have question randomization enabled to ensure fair testing and prevent memorization. The shuffle setting is configured by administrators for each quiz.',
    category: 'Quiz'
  },
  {
    question: 'Can I see the correct answers after completing a quiz?',
    answer: 'If the quiz administrator has enabled the "Show Results" option, you\'ll be able to see your score and correct answers after submitting. This feature helps you learn from your mistakes and understand the correct information.',
    category: 'Quiz'
  },
  {
    question: 'Is there a time limit for quizzes?',
    answer: 'Some quizzes have time limits while others allow unlimited time. The time limit (if any) is displayed before you start the quiz. Make sure you\'re ready before beginning a timed quiz as the timer starts immediately.',
    category: 'Quiz'
  }
];

export async function seedFAQs() {
  console.log('\n📚 Seeding FAQs...'.cyan);

  try {
    // Clear existing FAQs
    const deleteCount = await prisma.fAQ.deleteMany({});
    console.log(`   Cleared ${deleteCount.count} existing FAQs`.yellow);

    // Create new FAQs
    let created = 0;
    for (const faqData of faqsData) {
      await prisma.fAQ.create({ data: faqData });
      created++;
      process.stdout.write(`\r   Created ${created}/${faqsData.length} FAQs...`.green);
    }

    console.log(`\n✓ Successfully seeded ${created} FAQs\n`.green);

    // Show summary by category
    const categoryCounts = await prisma.fAQ.groupBy({
      by: ['category'],
      _count: true
    });

    console.log('   FAQs by category:'.cyan);
    categoryCounts.forEach(({ category, _count }) => {
      console.log(`   - ${category}: ${_count} FAQs`.white);
    });

    return { success: created, skipped: 0 };

  } catch (error) {
    console.error('\n✗ Error seeding FAQs:'.red, error);
    throw error;
  }
}

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFAQs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
