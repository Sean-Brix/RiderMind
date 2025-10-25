// LessonModal - Example Lesson Templates for Admins
// Copy and modify these templates to create your own lessons

// ============================================
// TEMPLATE 1: Quick 3-Slide Lesson
// ============================================
const quickLesson = {
  moduleId: 1,
  title: 'Your Lesson Title',
  description: 'Brief description of what students will learn',
  objectives: [
    'First learning objective',
    'Second learning objective',
    'Third learning objective',
  ],
  slides: [
    // Slide 1: Welcome (Animation)
    {
      type: 'animation',
      title: 'Welcome!',
      content: 'This is your introduction slide. Add engaging text here.',
      icon: '👋', // Any emoji works!
      description: 'Introduction',
    },
    // Slide 2: Main Content (Text)
    {
      type: 'text',
      title: 'Main Topic',
      content: 'Your main teaching content goes here. Explain the key concepts clearly and concisely.',
      description: 'Core lesson content',
    },
    // Slide 3: Summary (Animation)
    {
      type: 'animation',
      title: 'Great Job!',
      content: 'You completed this lesson! Remember the key points we covered.',
      icon: '🎉',
      description: 'Lesson complete',
    },
  ],
  resources: [],
};

// ============================================
// TEMPLATE 2: Rich Media Lesson (Video + Images)
// ============================================
const mediaRichLesson = {
  moduleId: 2,
  title: 'Traffic Signs Recognition',
  description: 'Learn to identify and understand all major traffic signs',
  objectives: [
    'Identify regulatory signs',
    'Recognize warning signs',
    'Understand informational signs',
  ],
  slides: [
    // Opening
    {
      type: 'animation',
      title: 'Traffic Signs 101',
      content: 'Learn the visual language of the road',
      icon: '🚦',
      description: 'Course introduction',
    },
    // Video demonstration
    {
      type: 'video',
      title: 'Sign Recognition in Action',
      content: '/videos/traffic-signs-demo.mp4', // Replace with your video URL
      description: 'Video demonstration',
    },
    // Image gallery
    {
      type: 'image',
      title: 'Regulatory Signs',
      content: '/images/regulatory-signs.jpg', // Replace with your image URL
      description: 'Stop, Yield, No Entry signs',
    },
    {
      type: 'image',
      title: 'Warning Signs',
      content: '/images/warning-signs.jpg',
      description: 'Curve, Intersection, School Zone signs',
    },
    // Text summary
    {
      type: 'text',
      title: 'Key Takeaways',
      content: 'Remember: Red means stop or prohibition. Yellow means caution. Blue means information or services. White means regulation.',
      description: 'Color coding summary',
    },
  ],
  resources: [
    {
      title: 'Traffic Signs PDF Guide',
      type: 'PDF Document',
      url: '/downloads/traffic-signs.pdf',
    },
    {
      title: 'Practice Quiz',
      type: 'Interactive Quiz',
      url: '/quiz/traffic-signs',
    },
  ],
};

// ============================================
// TEMPLATE 3: Text-Heavy Educational Lesson
// ============================================
const textLesson = {
  moduleId: 3,
  title: 'Philippine Traffic Laws',
  description: 'Comprehensive overview of traffic laws and regulations',
  objectives: [
    'Understand speed limit laws',
    'Know right-of-way rules',
    'Learn about traffic violations and penalties',
  ],
  slides: [
    {
      type: 'animation',
      title: 'Know the Law',
      content: 'Understanding traffic laws keeps you safe and legal on the road',
      icon: '⚖️',
      description: 'Introduction',
    },
    {
      type: 'text',
      title: 'Speed Limits in the Philippines',
      content: 'The general speed limit on national roads is 60 km/h. In residential areas, it\'s 30 km/h. On expressways, it can go up to 100 km/h depending on the specific highway. Always watch for posted signs as they take precedence over general limits.',
      description: 'Speed regulations',
    },
    {
      type: 'text',
      title: 'Right of Way Rules',
      content: 'At intersections without signals, vehicles on the right have priority. When turning left, you must yield to oncoming traffic. Pedestrians always have right of way at marked crosswalks. Emergency vehicles with sirens/lights have absolute priority.',
      description: 'Intersection rules',
    },
    {
      type: 'text',
      title: 'Common Violations',
      content: 'Top violations include: Speeding, running red lights, improper lane usage, not wearing helmets, driving without license or registration, and reckless driving. Penalties range from fines to license suspension.',
      description: 'Violations and penalties',
    },
    {
      type: 'animation',
      title: 'Stay Legal, Stay Safe',
      content: 'Following traffic laws protects you and others on the road',
      icon: '✅',
      description: 'Conclusion',
    },
  ],
  resources: [
    {
      title: 'Land Transportation Code',
      type: 'Legal Document',
      url: '/documents/ltc.pdf',
    },
  ],
};

// ============================================
// TEMPLATE 4: Mixed Format (Everything!)
// ============================================
const comprehensiveLesson = {
  moduleId: 4,
  title: 'Defensive Riding Masterclass',
  description: 'Advanced techniques for safe motorcycle operation',
  objectives: [
    'Master the SEE system (Search, Evaluate, Execute)',
    'Develop hazard perception skills',
    'Learn emergency maneuvers',
    'Understand space cushion management',
  ],
  slides: [
    // 1. Opening
    {
      type: 'animation',
      title: 'Defensive Riding',
      content: 'Anticipate, Prepare, React - The keys to staying safe',
      icon: '🛡️',
      description: 'Course intro',
    },
    // 2. Concept explanation
    {
      type: 'text',
      title: 'The SEE System',
      content: 'SEARCH your surroundings constantly. EVALUATE potential hazards and what might happen. EXECUTE the appropriate defensive action. This systematic approach should become second nature.',
      description: 'SEE methodology',
    },
    // 3. Visual demonstration
    {
      type: 'video',
      title: 'SEE in Action',
      content: '/videos/see-system-demo.mp4',
      description: 'Real-world examples',
    },
    // 4. Detailed technique
    {
      type: 'image',
      title: 'Space Cushion Diagram',
      content: '/images/space-cushion.jpg',
      description: 'Visual guide to safe spacing',
    },
    // 5. Important warning
    {
      type: 'animation',
      title: 'Common Hazards',
      content: 'Watch for: Cars changing lanes suddenly, pedestrians stepping out, potholes, wet surfaces, and blind spots',
      icon: '⚠️',
      description: 'Hazard awareness',
    },
    // 6. Practical advice
    {
      type: 'text',
      title: 'Emergency Braking',
      content: 'In an emergency, apply BOTH brakes simultaneously. Front brake provides 70% of stopping power. Don\'t grab - squeeze progressively. In wet conditions, apply more gently to prevent skidding.',
      description: 'Braking technique',
    },
    // 7. Video tutorial
    {
      type: 'video',
      title: 'Emergency Maneuvers',
      content: '/videos/emergency-techniques.mp4',
      description: 'Swerving and braking demos',
    },
    // 8. Summary
    {
      type: 'text',
      title: 'Putting It All Together',
      content: 'Defensive riding is about being proactive, not reactive. Scan ahead 12 seconds. Check mirrors every 5-8 seconds. Always have an escape route. Assume others don\'t see you.',
      description: 'Summary tips',
    },
    // 9. Completion
    {
      type: 'animation',
      title: 'You\'re Ready!',
      content: 'Practice these techniques every time you ride. Safe riding is a continuous process of learning and improvement.',
      icon: '🏆',
      description: 'Course complete',
    },
  ],
  resources: [
    {
      title: 'Defensive Riding Checklist',
      type: 'PDF Checklist',
      url: '/downloads/defensive-riding-checklist.pdf',
    },
    {
      title: 'Advanced Techniques Video Series',
      type: 'Video Playlist',
      url: '/videos/advanced-series',
    },
    {
      title: 'Practice Scenarios',
      type: 'Interactive Simulator',
      url: '/simulator/defensive-riding',
    },
  ],
};

// ============================================
// CUSTOMIZATION TIPS FOR ADMINS
// ============================================

/*
1. SLIDE TYPES - Choose the right type for your content:
   - 'animation': Great for introductions, summaries, key points
   - 'text': Detailed explanations, step-by-step instructions
   - 'image': Diagrams, photos, infographics
   - 'video': Demonstrations, real-world examples, tutorials

2. SLIDE COUNT:
   - Minimum: 1 slide (but 3+ recommended)
   - Optimal: 5-8 slides for engagement
   - Maximum: No limit, but consider breaking long lessons into multiple modules

3. CONTENT GUIDELINES:
   - Keep text slides under 100 words for readability
   - Use clear, descriptive titles
   - Include 'description' for accessibility and sidebar preview
   - Choose relevant emojis/icons for animation slides

4. MEDIA FILES:
   - Videos: Use MP4 format, keep under 50MB
   - Images: Use JPG/PNG, optimize for web (800-1200px width)
   - Host files in /public/assets/ or use CDN URLs

5. LEARNING OBJECTIVES:
   - List 3-5 clear, measurable objectives
   - Start with action verbs (Learn, Understand, Identify, Master)
   - Be specific about what students will gain

6. RESOURCES:
   - Add supplementary materials for deeper learning
   - Include links to quizzes, PDFs, external references
   - Use descriptive titles and types

7. ACCESSIBILITY:
   - Write descriptive 'description' fields for each slide
   - Use high-contrast images
   - Include captions for videos when possible
   - Keep text readable (avoid tiny fonts in images)
*/

// ============================================
// HOW TO ADD YOUR LESSON TO THE SYSTEM
// ============================================

/*
STEP 1: Create your lesson object (use templates above)
STEP 2: Add it to SAMPLE_LESSONS in Modules.jsx:

const SAMPLE_LESSONS = {
  1: quickLesson,
  2: mediaRichLesson,
  3: textLesson,
  4: comprehensiveLesson,
  5: yourNewLesson,  // <-- Add here
};

STEP 3: Make sure your MOCK_MODULES array has a corresponding module:

{
  id: 5,
  title: 'Your Module Title',
  description: 'Module description',
  status: 'available', // or 'locked' or 'completed'
  ...
}

STEP 4: Upload any media files to the appropriate directories:
- Videos: /public/assets/videos/
- Images: /public/assets/images/
- Documents: /public/assets/downloads/

STEP 5: Test in development mode (npm run dev)
*/

// ============================================
// EXPORT FOR USE
// ============================================

export const lessonTemplates = {
  quick: quickLesson,
  mediaRich: mediaRichLesson,
  textBased: textLesson,
  comprehensive: comprehensiveLesson,
};

export default lessonTemplates;
