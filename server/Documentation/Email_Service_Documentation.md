# Email Service Documentation

## Overview
The RiderMind email service uses Nodemailer to send emails to users. It includes a scalable template system with three built-in templates.

## Setup

### 1. Install Dependencies
```bash
npm install nodemailer
```

### 2. Configure Environment Variables
Add to your `.env` file:

```env
# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
SUPPORT_EMAIL="support@ridermind.com"
APP_URL="http://localhost:5173"
```

### 3. Gmail App Password Setup (if using Gmail)
1. Go to Google Account settings: https://myaccount.google.com/
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Use this password in `EMAIL_PASSWORD` (not your regular Gmail password)

## Usage

### Import the Service
```javascript
import { sendEmail } from './utils/emailService.js';
```

### Send Email
```javascript
const result = await sendEmail(
  'user@example.com',
  'forgotPassword',
  {
    name: 'John Doe',
    resetLink: 'http://localhost:5173/reset-password?token=abc123',
    resetToken: 'ABC123',
    expiresIn: '1 hour',
  }
);

if (result.success) {
  console.log('Email sent successfully');
} else {
  console.error('Email failed:', result.error);
}
```

## Built-in Templates

### 1. Forgot Password
**Template Name:** `forgotPassword`

**Required Data:**
- `resetLink` (string): URL to reset password page

**Optional Data:**
- `name` (string): User's name (default: "User")
- `resetToken` (string): Reset code to display
- `expiresIn` (string): Expiration time (default: "1 hour")

**Example:**
```javascript
await sendEmail('user@example.com', 'forgotPassword', {
  name: 'John Doe',
  resetLink: 'http://localhost:5173/reset-password?token=abc123',
  resetToken: 'ABC123',
  expiresIn: '1 hour',
});
```

### 2. Notification
**Template Name:** `notification`

**Required Data:**
- `message` (string): Main notification message

**Optional Data:**
- `name` (string): User's name (default: "User")
- `title` (string): Notification title (default: "Notification")
- `subject` (string): Email subject (default: "Notification from RiderMind")
- `icon` (string): Emoji icon (default: "🔔")
- `badge` (string): Badge text (e.g., "NEW", "URGENT")
- `actionUrl` (string): URL for action button
- `actionText` (string): Button text (default: "View Details")
- `additionalInfo` (string): Extra information

**Example:**
```javascript
await sendEmail('user@example.com', 'notification', {
  name: 'Jane Smith',
  title: 'New Module Available',
  icon: '📚',
  badge: 'NEW',
  message: 'A new learning module has been added to your curriculum.',
  actionUrl: 'http://localhost:5173/modules/123',
  actionText: 'View Module',
  additionalInfo: 'This module includes 10 lessons.',
});
```

### 3. Registration Rejected
**Template Name:** `registrationRejected`

**Optional Data:**
- `name` (string): Applicant's name (default: "Applicant")
- `reason` (string): Rejection reason
- `allowReapply` (boolean): Allow reapplication (default: true)
- `registrationUrl` (string): URL to registration page

**Example:**
```javascript
await sendEmail('user@example.com', 'registrationRejected', {
  name: 'Alex Johnson',
  reason: 'Email address does not match institutional requirements.',
  allowReapply: true,
  registrationUrl: 'http://localhost:5173/register',
});
```

## Advanced Usage

### Send Bulk Emails
```javascript
import { sendBulkEmails } from './utils/emailService.js';

const emails = [
  {
    to: 'user1@example.com',
    template: 'notification',
    data: { name: 'User 1', message: 'Hello!' },
  },
  {
    to: 'user2@example.com',
    template: 'notification',
    data: { name: 'User 2', message: 'Hi there!' },
  },
];

const results = await sendBulkEmails(emails);
```

### Add Custom Template
```javascript
import { addEmailTemplate } from './utils/emailService.js';

addEmailTemplate('welcome', (data) => ({
  subject: 'Welcome to RiderMind',
  html: `<h1>Welcome ${data.name}!</h1><p>${data.message}</p>`,
  text: `Welcome ${data.name}! ${data.message}`,
}));

// Use the new template
await sendEmail('user@example.com', 'welcome', {
  name: 'John',
  message: 'Thanks for joining!',
});
```

### Get Available Templates
```javascript
import { getAvailableTemplates } from './utils/emailService.js';

const templates = getAvailableTemplates();
console.log(templates); // ['forgotPassword', 'notification', 'registrationRejected']
```

## Testing

Run the test script:
```bash
node scripts/test/testEmailService.js
```

Make sure to update `TEST_EMAIL` in the script to your email address.

## Integration Examples

### Password Reset Endpoint
```javascript
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';

async function forgotPassword(req, res) {
  const { email } = req.body;
  
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  
  // Save token to database
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });
  
  // Send email
  const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  const result = await sendEmail(user.email, 'forgotPassword', {
    name: `${user.firstName} ${user.lastName}`,
    resetLink,
    resetToken: resetToken.substring(0, 6).toUpperCase(),
    expiresIn: '1 hour',
  });
  
  if (result.success) {
    return res.json({ message: 'Password reset email sent' });
  } else {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
```

### Registration Rejection Endpoint
```javascript
import { sendEmail } from '../utils/emailService.js';

async function rejectRegistration(req, res) {
  const { userId, reason } = req.body;
  
  // Update user status
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: 'REJECTED' },
  });
  
  // Send rejection email
  const result = await sendEmail(user.email, 'registrationRejected', {
    name: `${user.firstName} ${user.lastName}`,
    reason: reason,
    allowReapply: true,
    registrationUrl: `${process.env.APP_URL}/register`,
  });
  
  if (result.success) {
    return res.json({ message: 'User rejected and notified' });
  } else {
    return res.status(500).json({ error: 'Rejection succeeded but email failed' });
  }
}
```

## Troubleshooting

### Email not sending
1. Check that `EMAIL_USER` and `EMAIL_PASSWORD` are correct in `.env`
2. For Gmail, ensure you're using an App Password, not your regular password
3. Check if 2-Factor Authentication is enabled (required for App Passwords)
4. Verify your email service allows less secure app access

### Template not found
1. Check spelling of template name
2. Use `getAvailableTemplates()` to see valid template names
3. Ensure custom templates are added before use

### Emails going to spam
1. Use a verified sender email address
2. Set up SPF, DKIM, and DMARC records (for production)
3. Ask users to whitelist your email address
4. Use a professional email service (SendGrid, AWS SES) for production

## Production Recommendations

For production environments, consider:

1. **Use a professional email service:**
   - SendGrid
   - AWS SES
   - Mailgun
   - Postmark

2. **Set up proper DNS records:**
   - SPF (Sender Policy Framework)
   - DKIM (DomainKeys Identified Mail)
   - DMARC (Domain-based Message Authentication)

3. **Implement rate limiting:**
   - Prevent email bombing
   - Add cooldown periods for password resets

4. **Add email queue:**
   - Use Bull or RabbitMQ
   - Retry failed emails
   - Better performance for bulk emails

5. **Monitor email deliverability:**
   - Track bounces
   - Monitor spam reports
   - Keep sender reputation high

## File Locations

- Email Service: `server/utils/emailService.js`
- Test Script: `server/scripts/test/testEmailService.js`
- Documentation: `server/Documentation/Email_Service_Documentation.md`
- Environment Config: `server/.env.example`
