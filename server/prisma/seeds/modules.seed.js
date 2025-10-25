import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const MODULE_DATA_PATH = join(__dirname, '..', 'data', 'modules', 'module.json');
const IMAGES_DIR = join(__dirname, '..', 'data', 'modules', 'images');
const VIDEOS_DIR = join(__dirname, '..', 'data', 'modules', 'videos');
const PUBLIC_VIDEOS_DIR = join(__dirname, '..', '..', 'public', 'videos');

// Ensure public videos directory exists
if (!existsSync(PUBLIC_VIDEOS_DIR)) {
  mkdirSync(PUBLIC_VIDEOS_DIR, { recursive: true });
}

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 1000) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

/**
 * Upload video file to public directory
 * @param {number} moduleIndex - Module index (1-11)
 * @returns {string} - Relative path to uploaded video
 */
function uploadVideoFile(moduleIndex) {
  const videoFileName = `${moduleIndex}.mp4`;
  const sourcePath = join(VIDEOS_DIR, videoFileName);
  
  if (!existsSync(sourcePath)) {
    throw new Error(`Video file not found: ${videoFileName}`);
  }

  // Generate unique filename
  const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
  const destFileName = `module-${moduleIndex}-${uniqueSuffix}.mp4`;
  const destPath = join(PUBLIC_VIDEOS_DIR, destFileName);

  // Copy video to public directory
  copyFileSync(sourcePath, destPath);

  // Return relative path for database
  return `/videos/${destFileName}`;
}

/**
 * Process image file and convert to binary
 * @param {number} moduleIndex - Module index (1-11)
 * @returns {Object} - { data: Buffer, mime: string }
 */
function processImageFile(moduleIndex) {
  // Try different extensions
  const extensions = ['.jpg', '.jpeg', '.png'];
  let imagePath = null;
  let foundExt = null;

  for (const ext of extensions) {
    const testPath = join(IMAGES_DIR, `${moduleIndex}${ext}`);
    if (existsSync(testPath)) {
      imagePath = testPath;
      foundExt = ext;
      break;
    }
  }

  if (!imagePath) {
    throw new Error(`Image file not found for module ${moduleIndex}`);
  }

  const imageBuffer = readFileSync(imagePath);
  const mimeType = foundExt === '.png' ? 'image/png' : 'image/jpeg';

  return {
    data: imageBuffer,
    mime: mimeType
  };
}

export async function seedModules() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  🏍️  SEEDING LEARNING MODULES'.bold.cyan);
  console.log('='.repeat(60).rainbow + '\n');

  // Load module data from JSON
  const modulesData = JSON.parse(readFileSync(MODULE_DATA_PATH, 'utf-8'));

  let successCount = 0;
  let skipCount = 0;
  let uploadedVideos = 0;
  let uploadedImages = 0;

  for (let i = 0; i < modulesData.length; i++) {
    const moduleData = modulesData[i];
    const moduleIndex = i + 1; // 1-based index
    const { objectives, slides, ...moduleInfo } = moduleData;
    
    try {
      // Check if module already exists
      const existing = await prisma.module.findFirst({
        where: { title: moduleInfo.title }
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${moduleInfo.title}`.yellow);
        skipCount++;
        continue;
      }

      // Animate module creation
      const createMessage = `[${moduleIndex}/11] Creating: ${moduleInfo.title}`;
      await animateProgress(createMessage, 800);

      // Process image
      console.log(`   📸 Processing image ${moduleIndex}...`.dim);
      const imageData = processImageFile(moduleIndex);
      uploadedImages++;

      // Upload video
      console.log(`   🎥 Uploading video ${moduleIndex}...`.dim);
      const videoPath = uploadVideoFile(moduleIndex);
      uploadedVideos++;

      // Prepare slides with image and video
      const processedSlides = slides.map((slide, idx) => {
        const baseSlide = {
          ...slide,
          position: idx + 1
        };

        // Add image to first slide
        if (idx === 0) {
          return {
            ...baseSlide,
            type: 'image',
            imageData: imageData.data,
            imageMime: imageData.mime
          };
        }
        
        // Add video to second slide
        if (idx === 1) {
          return {
            ...baseSlide,
            type: 'video',
            videoPath: videoPath
          };
        }

        // Keep text slide as is
        return baseSlide;
      });

      // Create module with objectives and slides
      await prisma.module.create({
        data: {
          ...moduleInfo,
          objectives: {
            create: objectives.map((obj, index) => ({
              objective: obj,
              position: index + 1
            }))
          },
          slides: {
            create: processedSlides
          }
        }
      });

      console.log(`   📚 ${objectives.length} objectives`.dim);
      console.log(`   📄 ${slides.length} slides (1 image, 1 video, 1 text)\n`.dim);
      successCount++;
      
    } catch (error) {
      console.log(`✗ Error creating ${moduleInfo.title}: ${error.message}`.red);
      console.log(`   ${error.stack}`.dim);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} modules`.green);
  console.log(`   📸 Uploaded: ${uploadedImages} images`.cyan);
  console.log(`   🎥 Uploaded: ${uploadedVideos} videos`.magenta);
  console.log(`   ⏭️  Skipped: ${skipCount} modules`.yellow);
  console.log('─'.repeat(60).gray + '\n');

  return { success: successCount, skipped: skipCount };
}

export default seedModules;
