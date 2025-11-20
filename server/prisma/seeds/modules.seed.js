/**
 * Module Seeds
 * Generates sample modules with slides using Firebase Storage media
 * 
 * Prerequisites:
 * 1. Run `node scripts/uploadSampleMedia.js` first to upload media to Firebase
 * 2. This will create firebase-urls.json with all media URLs
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moduleTemplates = [
  {
    title: "Mastering Motorcycle Safety",
    description: "Essential safety techniques and best practices for riders",
    skillLevel: "Beginner",
    objectives: [
      "Understand proper riding gear and equipment",
      "Learn defensive riding techniques",
      "Master pre-ride safety checks"
    ]
  },
  {
    title: "Advanced Cornering Techniques",
    description: "Develop skills for navigating turns with confidence and control",
    skillLevel: "Intermediate",
    objectives: [
      "Perfect body positioning in corners",
      "Learn throttle control through turns",
      "Understand racing lines and apex points"
    ]
  },
  {
    title: "Urban Riding Strategies",
    description: "Navigate city traffic safely and efficiently",
    skillLevel: "Beginner",
    objectives: [
      "Master lane positioning in traffic",
      "Learn to anticipate driver behavior",
      "Practice emergency braking techniques"
    ]
  },
  {
    title: "Track Day Preparation",
    description: "Get ready for your first track experience",
    skillLevel: "Expert",
    objectives: [
      "Understand track etiquette and rules",
      "Optimize bike setup for track riding",
      "Learn racing lines and passing zones"
    ]
  },
  {
    title: "Motorcycle Maintenance Basics",
    description: "Essential maintenance skills every rider should know",
    skillLevel: "Beginner",
    objectives: [
      "Perform basic maintenance checks",
      "Learn oil change procedures",
      "Understand chain maintenance"
    ]
  },
  {
    title: "Weather Riding Techniques",
    description: "Adapt your riding for various weather conditions",
    skillLevel: "Intermediate",
    objectives: [
      "Master wet weather riding",
      "Handle crosswinds safely",
      "Prepare for cold weather riding"
    ]
  },
  {
    title: "Group Riding Fundamentals",
    description: "Safe and enjoyable group riding practices",
    skillLevel: "Beginner",
    objectives: [
      "Learn group riding formations",
      "Understand hand signals",
      "Practice group communication"
    ]
  },
  {
    title: "Emergency Maneuvers",
    description: "Critical skills for avoiding accidents",
    skillLevel: "Intermediate",
    objectives: [
      "Master emergency braking",
      "Learn swerve techniques",
      "Practice panic situation responses"
    ]
  },
  {
    title: "Long Distance Touring",
    description: "Plan and execute successful motorcycle tours",
    skillLevel: "Intermediate",
    objectives: [
      "Plan efficient touring routes",
      "Pack effectively for long trips",
      "Manage fatigue on long rides"
    ]
  },
  {
    title: "Sport Bike Performance",
    description: "Unlock the potential of your sport bike",
    skillLevel: "Expert",
    objectives: [
      "Master high-speed stability",
      "Learn aggressive braking techniques",
      "Perfect throttle control"
    ]
  }
];

const slideTemplatesBySkillLevel = {
  "Beginner": [
    {
      type: "text",
      title: "Welcome to Basics",
      description: "Introduction for beginners",
      skillLevel: "Beginner"
    },
    {
      type: "image",
      title: "Fundamental Concepts",
      description: "Core beginner material",
      skillLevel: "Beginner"
    },
    {
      type: "video",
      title: "Basic Practice",
      description: "Beginner practice exercise",
      skillLevel: "Beginner"
    },
    {
      type: "text",
      title: "Beginner Summary",
      description: "Review of basic concepts",
      skillLevel: "Beginner"
    }
  ],
  "Intermediate": [
    {
      type: "text",
      title: "Building on Basics",
      description: "Intermediate introduction",
      skillLevel: "Intermediate"
    },
    {
      type: "image",
      title: "Advanced Concepts",
      description: "Intermediate learning material",
      skillLevel: "Intermediate"
    },
    {
      type: "video",
      title: "Intermediate Practice",
      description: "Apply intermediate techniques",
      skillLevel: "Intermediate"
    },
    {
      type: "text",
      title: "Intermediate Review",
      description: "Summary of intermediate concepts",
      skillLevel: "Intermediate"
    }
  ],
  "Expert": [
    {
      type: "text",
      title: "Mastery Level",
      description: "Expert-level introduction",
      skillLevel: "Expert"
    },
    {
      type: "image",
      title: "Expert Techniques",
      description: "Advanced expert material",
      skillLevel: "Expert"
    },
    {
      type: "video",
      title: "Expert Drills",
      description: "Master advanced skills",
      skillLevel: "Expert"
    },
    {
      type: "text",
      title: "Expert Mastery",
      description: "Complete mastery review",
      skillLevel: "Expert"
    }
  ]
};

/**
 * Load media URLs from firebase-urls.json
 */
function loadMediaMap() {
  const jsonPath = path.join(__dirname, '../data/modules/firebase-urls.json');
  
  try {
    const jsonData = readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);
    
    // Convert to indexed format
    const mediaMap = { images: {}, videos: {} };
    
    // Map images by index
    Object.keys(data.images).forEach((filename, index) => {
      const imageData = data.images[filename];
      mediaMap.images[index + 1] = {
        url: imageData.url.url || imageData.url, // Handle nested url object
        path: imageData.url.path || imageData.path,
        mime: 'image/jpeg'
      };
    });
    
    // Map videos by index
    Object.keys(data.videos).forEach((filename, index) => {
      const videoData = data.videos[filename];
      mediaMap.videos[index + 1] = {
        url: videoData.url.url || videoData.url, // Handle nested url object
        path: videoData.url.path || videoData.path
      };
    });
    
    console.log(`📦 Loaded ${Object.keys(mediaMap.images).length} images and ${Object.keys(mediaMap.videos).length} videos from Firebase`);
    return mediaMap;
  } catch (error) {
    console.error('❌ Error loading firebase-urls.json');
    console.error('   Please run: node scripts/uploadSampleMedia.js');
    throw new Error('firebase-urls.json not found. Run uploadSampleMedia.js first.');
  }
}

/**
 * Seed modules with sample data
 */
export async function seedModules(prisma) {
  console.log('🏍️  Starting module seeding...');

  try {
    // Load media URLs from JSON
    const mediaMap = loadMediaMap();

    console.log(`📚 Creating ${moduleTemplates.length} modules...\n`);

    for (let i = 0; i < moduleTemplates.length; i++) {
      const template = moduleTemplates[i];
      const mediaIndex = (i % 11) + 1; // Cycle through 11 media files

      console.log(`Creating module ${i + 1}: ${template.title}`);

      // Create module with objectives and slides for ALL skill levels
      const allSlides = [];
      let slidePosition = 1;
      
      // Generate slides for each skill level (Beginner, Intermediate, Expert)
      ["Beginner", "Intermediate", "Expert"].forEach((skillLevel) => {
        const templates = slideTemplatesBySkillLevel[skillLevel];
        
        templates.forEach((slideTemplate) => {
          const slideData = {
            type: slideTemplate.type,
            title: slideTemplate.title,
            content: `${template.description}\n\n${slideTemplate.description} (${skillLevel} Level).`,
            description: slideTemplate.description,
            position: slidePosition++,
            skillLevel: skillLevel,
            imageUrl: null,
            imagePath: null,
            imageMime: null,
            videoUrl: null,
            videoPath: null
          };

          // Add media based on slide type (rotate through available media)
          if (slideTemplate.type === 'image') {
            const imageIndex = ((i + slidePosition) % 11) + 1; // Rotate through images
            const image = mediaMap.images[imageIndex];
            slideData.imageUrl = image.url;
            slideData.imagePath = image.path;
            slideData.imageMime = image.mime;
          } else if (slideTemplate.type === 'video') {
            const videoIndex = ((i + slidePosition) % 11) + 1; // Rotate through videos
            const video = mediaMap.videos[videoIndex];
            slideData.videoUrl = video.url;
            slideData.videoPath = video.path;
          }

          allSlides.push(slideData);
        });
      });

      const module = await prisma.module.create({
        data: {
          title: template.title,
          description: template.description,
          position: i + 1,
          objectives: {
            create: template.objectives.map((text, idx) => ({
              objective: text,
              position: idx + 1
            }))
          },
          slides: {
            create: allSlides
          }
        },
        include: {
          objectives: true,
          slides: true
        }
      });

      console.log(`  ✓ Created with ${module.slides.length} slides (${module.slides.filter(s => s.skillLevel === 'Beginner').length} Beginner, ${module.slides.filter(s => s.skillLevel === 'Intermediate').length} Intermediate, ${module.slides.filter(s => s.skillLevel === 'Expert').length} Expert)`);
    }

    const count = await prisma.module.count();
    console.log(`\n✅ Module seeding completed! Total modules: ${count}`);
    return { success: count, skipped: 0 };
  } catch (error) {
    console.error('❌ Error seeding modules:', error);
    throw error;
  }
}

/**
 * Clear all modules and their related data
 */
export async function clearModules(prisma) {
  console.log('🗑️  Clearing all modules...');

  try {
    // Delete in correct order due to foreign key constraints
    await prisma.moduleSlide.deleteMany({});
    await prisma.moduleObjective.deleteMany({});
    await prisma.studentModule.deleteMany({});
    await prisma.module.deleteMany({});

    console.log('✅ All modules cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing modules:', error);
    throw error;
  }
}
