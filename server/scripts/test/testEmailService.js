/**
 * Email Service Test Script
 * Tests all email templates
 */

import { sendEmail, getAvailableTemplates } from '../utils/emailService.js';

const TEST_EMAIL = 'test@example.com'; // Replace with your email for testing

async function testEmailService() {
  console.log('🧪 Testing Email Service\n');

  // Get available templates
  const templates = getAvailableTemplates();
  console.log('📋 Available templates:', templates.join(', '));
  console.log('');

  // Test 1: Forgot Password Email
  console.log('1️⃣ Testing Forgot Password Email...');
  const forgotPasswordResult = await sendEmail(TEST_EMAIL, 'forgotPassword', {
    name: 'John Doe',
    resetLink: 'http://localhost:5173/reset-password?token=abc123',
    resetToken: 'ABC123',
    expiresIn: '1 hour',
  });
  console.log('Result:', forgotPasswordResult);
  console.log('');

  // Test 2: Notification Email
  console.log('2️⃣ Testing Notification Email...');
  const notificationResult = await sendEmail(TEST_EMAIL, 'notification', {
    name: 'Jane Smith',
    title: 'New Module Available',
    icon: '📚',
    badge: 'NEW',
    message: 'A new learning module "Advanced JavaScript" has been added to your curriculum. Start learning today!',
    actionUrl: 'http://localhost:5173/modules/123',
    actionText: 'View Module',
    additionalInfo: 'This module includes 10 lessons and 5 interactive quizzes.',
  });
  console.log('Result:', notificationResult);
  console.log('');

  // Test 3: Registration Rejected Email
  console.log('3️⃣ Testing Registration Rejected Email...');
  const rejectedResult = await sendEmail(TEST_EMAIL, 'registrationRejected', {
    name: 'Alex Johnson',
    reason: 'The email address provided does not match our institutional domain requirements. Please use your official educational institution email address.',
    allowReapply: true,
    registrationUrl: 'http://localhost:5173/register',
  });
  console.log('Result:', rejectedResult);
  console.log('');

  console.log('✅ Email service test completed!');
  console.log('Check your inbox at', TEST_EMAIL);
}

// Run tests
testEmailService().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
