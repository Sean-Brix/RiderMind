/**
 * Upload Sample Media to Firebase Storage
 * This script uploads all images and videos from prisma/data/modules to Firebase Storage
 * in an organized structure: sample-media/images/ and sample-media/videos/
 * 
 * Run from project root: node server/scripts/uploadSampleMedia.js
 * Or from server dir: node scripts/uploadSampleMedia.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Failed to load .env file:', result.error);
  console.error('   Looking for .env at:', envPath);
  process.exit(1);
}

console.log('✅ Environment variables loaded from:', envPath);
console.log('🔧 Firebase Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);

// Now import Firebase utilities after env is loaded
const { uploadFile } = await import('../utils/firebase.js');

async function uploadSampleMedia() {
  const imagesDir = path.join(__dirname, '../prisma/data/modules/images');
  const videosDir = path.join(__dirname, '../prisma/data/modules/videos');

  try {
    console.log('📤 Starting sample media upload to Firebase Storage...\n');

    // Upload images
    console.log('📸 Uploading images...');
    const imageFiles = await fs.readdir(imagesDir);
    const imageUrls = {};
    
    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const buffer = await fs.readFile(filePath);
      const contentType = file.endsWith('.jpg') || file.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
      const storagePath = `sample-media/images/${file}`;
      
      console.log(`  ↳ Uploading ${file}...`);
      const url = await uploadFile(buffer, storagePath, contentType);
      imageUrls[file] = { url, path: storagePath };
      console.log(`    ✓ ${file} uploaded`);
    }

    // Upload videos
    console.log('\n🎥 Uploading videos...');
    const videoFiles = await fs.readdir(videosDir);
    const videoUrls = {};
    
    for (const file of videoFiles) {
      const filePath = path.join(videosDir, file);
      const buffer = await fs.readFile(filePath);
      const contentType = 'video/mp4';
      const storagePath = `sample-media/videos/${file}`;
      
      console.log(`  ↳ Uploading ${file}...`);
      const url = await uploadFile(buffer, storagePath, contentType);
      videoUrls[file] = { url, path: storagePath };
      console.log(`    ✓ ${file} uploaded`);
    }

    // Save URLs to JSON for reference
    const outputPath = path.join(__dirname, '../prisma/data/modules/firebase-urls.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify({ images: imageUrls, videos: videoUrls }, null, 2)
    );

    console.log('\n✅ All sample media uploaded successfully!');
    console.log(`📄 URLs saved to: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`  - Images uploaded: ${Object.keys(imageUrls).length}`);
    console.log(`  - Videos uploaded: ${Object.keys(videoUrls).length}`);

  } catch (error) {
    console.error('❌ Error uploading sample media:', error);
    process.exit(1);
  }
}

// Run the upload
uploadSampleMedia()
  .then(() => {
    console.log('\n🎉 Upload complete! Exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
