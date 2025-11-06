/**
 * Quiz Media System Test Script
 * 
 * This script helps verify that the quiz media upload and retrieval system is working correctly.
 * Run this in your browser console while logged in as an admin.
 */

// Configuration
const API_BASE = '/api/quizzes';
const TEST_QUESTION_ID = 1; // Change this to a real question ID

// Test 1: Check if quiz-videos directory is accessible
async function testVideoDirectoryAccess() {
  console.log('🧪 TEST 1: Video Directory Access');
  try {
    const response = await fetch('/public/quiz-videos/', { credentials: 'include' });
    console.log('Directory response status:', response.status);
    if (response.ok) {
      console.log('✅ Directory is accessible');
    } else {
      console.log('⚠️ Directory returned', response.status, '- This is normal if directory listing is disabled');
    }
  } catch (error) {
    console.error('❌ Error accessing directory:', error);
  }
}

// Test 2: Upload a test video
async function testVideoUpload(questionId, videoFile) {
  console.log('🧪 TEST 2: Video Upload');
  console.log('Question ID:', questionId);
  console.log('Video file:', {
    name: videoFile.name,
    size: videoFile.size,
    type: videoFile.type
  });

  const formData = new FormData();
  formData.append('video', videoFile);

  try {
    const response = await fetch(`${API_BASE}/questions/${questionId}/upload-video`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Video uploaded successfully');
      console.log('Video path in DB:', data.data?.videoPath);
      return data.data;
    } else {
      console.error('❌ Upload failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Test 3: Upload a test image
async function testImageUpload(questionId, imageFile) {
  console.log('🧪 TEST 3: Image Upload');
  console.log('Question ID:', questionId);
  console.log('Image file:', {
    name: imageFile.name,
    size: imageFile.size,
    type: imageFile.type
  });

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(`${API_BASE}/questions/${questionId}/upload-image`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Image uploaded successfully');
      console.log('Has image:', data.data?.hasImage);
      console.log('Image MIME:', data.data?.imageMime);
      return data.data;
    } else {
      console.error('❌ Upload failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Test 4: Retrieve video stream
async function testVideoRetrieval(questionId) {
  console.log('🧪 TEST 4: Video Retrieval');
  
  try {
    const response = await fetch(`${API_BASE}/questions/${questionId}/video`, {
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));
    console.log('Content-Length:', response.headers.get('Content-Length'));
    console.log('Accept-Ranges:', response.headers.get('Accept-Ranges'));

    if (response.ok) {
      console.log('✅ Video is accessible');
      // Don't actually download the video, just check headers
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');
      console.log('Blob type:', blob.type);
      return true;
    } else {
      const data = await response.json();
      console.error('❌ Video not found:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error retrieving video:', error);
    return false;
  }
}

// Test 5: Retrieve image
async function testImageRetrieval(questionId) {
  console.log('🧪 TEST 5: Image Retrieval');
  
  try {
    const response = await fetch(`${API_BASE}/questions/${questionId}/image`, {
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));
    console.log('Content-Length:', response.headers.get('Content-Length'));

    if (response.ok) {
      console.log('✅ Image is accessible');
      
      // Try to load as image
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');
      console.log('Blob type:', blob.type);
      
      // Create image URL to test
      const imageUrl = URL.createObjectURL(blob);
      console.log('Test image URL:', imageUrl);
      console.log('You can paste this in browser to view:', imageUrl);
      
      return true;
    } else {
      const data = await response.json();
      console.error('❌ Image not found:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error retrieving image:', error);
    return false;
  }
}

// Test 6: Get question details
async function testGetQuestion(questionId) {
  console.log('🧪 TEST 6: Get Question Details');
  
  try {
    const response = await fetch(`${API_BASE}/questions/${questionId}`, {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Question data:', data.data);
      console.log('Has imageMime:', !!data.data?.imageMime);
      console.log('Has videoPath:', !!data.data?.videoPath);
      console.log('imageMime:', data.data?.imageMime);
      console.log('videoPath:', data.data?.videoPath);
      console.log('✅ Question retrieved');
      return data.data;
    } else {
      console.error('❌ Failed to get question');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting question:', error);
    return null;
  }
}

// Run all tests
async function runAllTests(questionId) {
  console.log('🚀 Starting Quiz Media System Tests');
  console.log('='.repeat(50));
  
  await testVideoDirectoryAccess();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const question = await testGetQuestion(questionId);
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (question?.videoPath) {
    await testVideoRetrieval(questionId);
    console.log('\n' + '='.repeat(50) + '\n');
  } else {
    console.log('⏭️ Skipping video retrieval test (no video uploaded)');
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  if (question?.imageMime) {
    await testImageRetrieval(questionId);
    console.log('\n' + '='.repeat(50) + '\n');
  } else {
    console.log('⏭️ Skipping image retrieval test (no image uploaded)');
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  console.log('✨ All tests completed');
}

// Helper to create file input for testing uploads
function createFileInput(accept, onSelect) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) onSelect(file);
  };
  input.click();
}

// Export test functions to window for easy access
window.quizMediaTest = {
  // Run all retrieval tests
  runAllTests: () => runAllTests(TEST_QUESTION_ID),
  
  // Individual tests
  testVideoDirectory: testVideoDirectoryAccess,
  testGetQuestion: (id = TEST_QUESTION_ID) => testGetQuestion(id),
  testVideoRetrieval: (id = TEST_QUESTION_ID) => testVideoRetrieval(id),
  testImageRetrieval: (id = TEST_QUESTION_ID) => testImageRetrieval(id),
  
  // Upload tests (will prompt for file)
  testVideoUpload: (id = TEST_QUESTION_ID) => {
    createFileInput('video/*', (file) => {
      testVideoUpload(id, file);
    });
  },
  
  testImageUpload: (id = TEST_QUESTION_ID) => {
    createFileInput('image/*', (file) => {
      testImageUpload(id, file);
    });
  }
};

console.log('📋 Quiz Media Test Suite Loaded!');
console.log('Available commands:');
console.log('  quizMediaTest.runAllTests()          - Run all retrieval tests');
console.log('  quizMediaTest.testGetQuestion(id)    - Get question details');
console.log('  quizMediaTest.testVideoRetrieval(id) - Test video streaming');
console.log('  quizMediaTest.testImageRetrieval(id) - Test image retrieval');
console.log('  quizMediaTest.testVideoUpload(id)    - Upload a test video');
console.log('  quizMediaTest.testImageUpload(id)    - Upload a test image');
console.log('\nDefault question ID:', TEST_QUESTION_ID);
console.log('Change TEST_QUESTION_ID in the script to test different questions');
