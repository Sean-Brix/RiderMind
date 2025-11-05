# 🎉 Feedback System API - Quick Start Guide

## ✅ What's Been Created

A complete feedback system with **10 API endpoints** for:
- ⭐ Module ratings (1-5 stars)
- 💬 Module comments
- 👍👎 Module likes/dislikes
- 👍👎 Quiz question reactions

---

## 🚀 Quick Start

### 1. Apply Database Migration

**Option A - Using MySQL CLI:**
```bash
cd server
mysql -u root -p RiderMind < prisma/manual_feedback_migration.sql
```

**Option B - Copy SQL directly:**
Open `server/prisma/manual_feedback_migration.sql` and run in MySQL Workbench or phpMyAdmin.

### 2. Verify Server is Running
```bash
cd server
npm start
# Server should start at http://localhost:3000
```

### 3. Test the API
Open in browser: `http://localhost:3000/public/test-feedback-api.html`

---

## 📚 API Endpoints

### Module Feedback
```http
POST   /api/modules/:moduleId/feedback          # Submit/update feedback
GET    /api/modules/:moduleId/feedback          # List feedback (paginated)
GET    /api/modules/:moduleId/feedback/stats    # Get statistics
GET    /api/modules/:moduleId/feedback/my       # Get user's feedback
DELETE /api/modules/:moduleId/feedback          # Delete feedback
```

### Quiz Reactions
```http
POST   /api/quiz-questions/:questionId/reaction      # Toggle like/dislike
GET    /api/quiz-questions/:questionId/reactions     # Get stats
GET    /api/quiz-questions/:questionId/reaction/my   # Get user's reaction
DELETE /api/quiz-questions/:questionId/reaction      # Remove reaction
GET    /api/quizzes/:quizId/reactions                # Get all quiz reactions
```

---

## 💡 Example Usage

### Submit Module Feedback
```javascript
fetch('/api/modules/1/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rating: 5,
    comment: 'Excellent module! Very informative.',
    isLike: true
  })
});
```

### Toggle Quiz Question Reaction
```javascript
fetch('/api/quiz-questions/1/reaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ isLike: true })
});
```

---

## 📊 Frontend Integration

### Update LessonModal.jsx

Replace the handleSubmitFeedback function:

```javascript
const handleSubmitFeedback = async () => {
  if (feedbackRating === 0 || !feedbackText.trim()) {
    alert('Please provide both rating and comment');
    return;
  }

  try {
    setIsSubmittingFeedback(true);
    
    const response = await fetch(`/api/modules/${lesson.moduleId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token when ready
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: feedbackRating,
        comment: feedbackText.trim(),
        isLike: feedbackRating >= 4
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('Feedback submitted successfully!');
      setFeedbackText('');
      setFeedbackRating(0);
      // Reload feedback list
      loadFeedback();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Feedback error:', error);
    alert('Failed to submit feedback');
  } finally {
    setIsSubmittingFeedback(false);
  }
};
```

### Load Real Feedback Data

Add this function to LessonModal.jsx:

```javascript
const [realFeedbacks, setRealFeedbacks] = useState([]);

const loadFeedback = async () => {
  try {
    const response = await fetch(`/api/modules/${lesson.moduleId}/feedback?page=1&limit=10`);
    const data = await response.json();
    
    if (data.success) {
      setRealFeedbacks(data.data.feedbacks);
    }
  } catch (error) {
    console.error('Load feedback error:', error);
  }
};

useEffect(() => {
  if (sidebarTab === 'feedbacks') {
    loadFeedback();
  }
}, [sidebarTab]);
```

---

## 📁 Files Reference

### Controllers
- `server/Controller/Feedback/moduleFeedback.js` - Module feedback logic
- `server/Controller/Feedback/quizReaction.js` - Quiz reaction logic

### Routes
- `server/API/module-feedback/index.js` - Module feedback routes
- `server/API/quiz-reactions/index.js` - Quiz reactions routes (includes quiz-wide stats)

### Documentation
- `server/Documentation/Feedback_API_Documentation.md` - Complete API docs
- `server/Documentation/Feedback_System_Implementation_Summary.md` - This summary

### Testing
- `server/public/test-feedback-api.html` - Interactive tester

---

## 🔧 Enable Authentication

When ready to protect endpoints, uncomment in route files:
- `server/API/module-feedback/index.js`
- `server/API/quiz-reactions/index.js`

```javascript
import { verifyToken } from '../../Middlewares/JWT/verifyToken.js';
router.use(verifyToken);
```

---

## ✨ Features

### Module Feedback
- ⭐ Star ratings (1-5)
- 💬 Comments (10-1000 chars)
- 👍👎 Likes/dislikes
- 🔄 Update existing feedback
- 🗑️ Soft delete
- 📊 Statistics (avg rating, distribution)
- 📄 Pagination

### Quiz Reactions
- 👍👎 Like/dislike toggle
- 🔄 Smart toggle (like → dislike → remove)
- 📊 Reaction statistics
- 🎯 Quiz-wide stats
- 🔒 One reaction per user per question

---

## 🛡️ Security

### Validation
- Rating: 1-5 integers only
- Comment: 10-1000 characters
- Inputs sanitized (trimmed)

### Database
- Unique constraints prevent duplicates
- Foreign keys with CASCADE delete
- CHECK constraints enforce rules
- Soft delete (isActive flag)

---

## 📊 Database Tables

### module_feedbacks
- Stores ratings, comments, likes/dislikes
- One feedback per user per module
- Soft delete support

### quiz_question_reactions
- Stores likes/dislikes for questions
- One reaction per user per question
- Simple toggle logic

---

## 🧪 Testing

### Manual Testing
1. Start server: `npm start`
2. Open: `http://localhost:3000/public/test-feedback-api.html`
3. Test all endpoints interactively

### API Testing
Use Postman or curl:
```bash
# Submit feedback
curl -X POST http://localhost:3000/api/modules/1/feedback \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Great module!","isLike":true}'

# Get stats
curl http://localhost:3000/api/modules/1/feedback/stats
```

---

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Test endpoints
3. 🔄 Update LessonModal.jsx to use real API
4. 🔄 Add authentication middleware
5. 🔄 Implement rate limiting
6. 🔄 Add content moderation
7. 🔄 Create admin dashboard for feedback management

---

## 📖 Full Documentation

See `server/Documentation/Feedback_API_Documentation.md` for:
- Detailed endpoint specs
- Request/response examples
- Error handling
- Security best practices
- Frontend integration examples

---

## ✅ Status

**Server**: ✅ Running at http://localhost:3000
**Routes**: ✅ Registered in API
**Controllers**: ✅ All 10 functions created
**Database**: ⏳ Migration pending
**Frontend**: ⏳ Integration pending
**Auth**: ⏳ Commented (ready to enable)

---

## 🆘 Troubleshooting

### Server won't start
```bash
cd server
npm install
node server.js
```

### Database errors
1. Check MySQL is running
2. Verify .env database credentials
3. Run migration SQL script

### API returns 404
1. Check server is running
2. Verify route is registered in `server/API/index.js`
3. Check endpoint path spelling

---

**Need help?** Check the full documentation in `server/Documentation/Feedback_API_Documentation.md`
