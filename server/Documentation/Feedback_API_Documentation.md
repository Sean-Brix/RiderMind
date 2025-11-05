# Feedback System API Documentation

## Overview
This API provides endpoints for managing module feedback (ratings, comments, likes/dislikes) and quiz question reactions (likes/dislikes).

## Base URL
```
http://localhost:3000/api
```

---

## Module Feedback Endpoints

### 1. Submit/Update Module Feedback
Submit new feedback or update existing feedback for a module.

**Endpoint:** `POST /api/modules/:moduleId/feedback`

**Authentication:** Required (Private)

**URL Parameters:**
- `moduleId` (integer) - The module ID

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent module! Very informative and well-structured.",
  "isLike": true
}
```

**Validation:**
- `rating`: Required, integer between 1 and 5
- `comment`: Required, minimum 10 characters, maximum 1000 characters
- `isLike`: Optional boolean (defaults to `true` if rating >= 4)

**Success Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": 1,
    "moduleId": 1,
    "userId": 1,
    "rating": 5,
    "comment": "Excellent module! Very informative and well-structured.",
    "isLike": true,
    "isActive": true,
    "createdAt": "2025-11-06T10:30:00.000Z",
    "updatedAt": "2025-11-06T10:30:00.000Z",
    "user": {
      "id": 1,
      "username": "juandelacruz",
      "firstName": "Juan",
      "lastName": "Dela Cruz"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid rating or comment
- `404 Not Found` - Module not found
- `500 Internal Server Error` - Server error

---

### 2. Get Module Feedback List
Retrieve all feedback for a specific module with pagination.

**Endpoint:** `GET /api/modules/:moduleId/feedback`

**Authentication:** Public

**URL Parameters:**
- `moduleId` (integer) - The module ID

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `sortBy` (string, default: 'createdAt') - Field to sort by
- `order` (string, default: 'desc') - Sort order ('asc' or 'desc')

**Example Request:**
```
GET /api/modules/1/feedback?page=1&limit=10&sortBy=createdAt&order=desc
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "id": 1,
        "moduleId": 1,
        "userId": 1,
        "rating": 5,
        "comment": "Excellent module!",
        "isLike": true,
        "isActive": true,
        "createdAt": "2025-11-06T10:30:00.000Z",
        "updatedAt": "2025-11-06T10:30:00.000Z",
        "user": {
          "id": 1,
          "username": "juandelacruz",
          "firstName": "Juan",
          "lastName": "Dela Cruz"
        }
      }
    ],
    "pagination": {
      "total": 48,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 3. Get Module Feedback Statistics
Get aggregated statistics for module feedback.

**Endpoint:** `GET /api/modules/:moduleId/feedback/stats`

**Authentication:** Public

**URL Parameters:**
- `moduleId` (integer) - The module ID

**Success Response:**
```json
{
  "success": true,
  "data": {
    "totalFeedbacks": 48,
    "averageRating": 4.5,
    "totalLikes": 42,
    "totalDislikes": 6,
    "totalComments": 48,
    "ratingDistribution": {
      "1": 2,
      "2": 4,
      "3": 5,
      "4": 15,
      "5": 22
    }
  }
}
```

---

### 4. Get My Module Feedback
Retrieve the current user's feedback for a specific module.

**Endpoint:** `GET /api/modules/:moduleId/feedback/my`

**Authentication:** Required (Private)

**URL Parameters:**
- `moduleId` (integer) - The module ID

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "moduleId": 1,
    "userId": 1,
    "rating": 5,
    "comment": "Excellent module!",
    "isLike": true,
    "isActive": true,
    "createdAt": "2025-11-06T10:30:00.000Z",
    "updatedAt": "2025-11-06T10:30:00.000Z",
    "user": {
      "id": 1,
      "username": "juandelacruz",
      "firstName": "Juan",
      "lastName": "Dela Cruz"
    }
  }
}
```

**Error Response:**
- `404 Not Found` - No feedback found

---

### 5. Delete Module Feedback
Soft delete the current user's feedback for a module.

**Endpoint:** `DELETE /api/modules/:moduleId/feedback`

**Authentication:** Required (Private)

**URL Parameters:**
- `moduleId` (integer) - The module ID

**Success Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

**Error Response:**
- `404 Not Found` - Feedback not found

---

## Quiz Question Reaction Endpoints

### 6. Toggle Quiz Question Reaction
Add, update, or remove a like/dislike reaction on a quiz question.

**Endpoint:** `POST /api/quiz-questions/:questionId/reaction`

**Authentication:** Required (Private)

**URL Parameters:**
- `questionId` (integer) - The question ID

**Request Body:**
```json
{
  "isLike": true
}
```

**Validation:**
- `isLike`: Required boolean (`true` for like, `false` for dislike)

**Behavior:**
- If no reaction exists: Creates new reaction
- If same reaction exists: Removes the reaction (toggle off)
- If opposite reaction exists: Updates to new reaction

**Success Response (Created):**
```json
{
  "success": true,
  "message": "Like added",
  "data": {
    "id": 1,
    "questionId": 1,
    "userId": 1,
    "isLike": true,
    "createdAt": "2025-11-06T10:30:00.000Z",
    "updatedAt": "2025-11-06T10:30:00.000Z"
  }
}
```

**Success Response (Updated):**
```json
{
  "success": true,
  "message": "Reaction updated to dislike",
  "data": {
    "id": 1,
    "questionId": 1,
    "userId": 1,
    "isLike": false,
    "createdAt": "2025-11-06T10:30:00.000Z",
    "updatedAt": "2025-11-06T10:35:00.000Z"
  }
}
```

**Success Response (Removed):**
```json
{
  "success": true,
  "message": "Reaction removed",
  "data": null
}
```

---

### 7. Get Question Reaction Statistics
Get aggregated reaction statistics for a quiz question.

**Endpoint:** `GET /api/quiz-questions/:questionId/reactions`

**Authentication:** Public

**URL Parameters:**
- `questionId` (integer) - The question ID

**Success Response:**
```json
{
  "success": true,
  "data": {
    "totalReactions": 150,
    "totalLikes": 135,
    "totalDislikes": 15,
    "likePercentage": "90.00"
  }
}
```

---

### 8. Get My Question Reaction
Get the current user's reaction for a specific question.

**Endpoint:** `GET /api/quiz-questions/:questionId/reaction/my`

**Authentication:** Required (Private)

**URL Parameters:**
- `questionId` (integer) - The question ID

**Success Response (Has Reaction):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "questionId": 1,
    "userId": 1,
    "isLike": true,
    "createdAt": "2025-11-06T10:30:00.000Z",
    "updatedAt": "2025-11-06T10:30:00.000Z"
  }
}
```

**Success Response (No Reaction):**
```json
{
  "success": true,
  "data": null
}
```

---

### 9. Delete Question Reaction
Remove the current user's reaction from a quiz question.

**Endpoint:** `DELETE /api/quiz-questions/:questionId/reaction`

**Authentication:** Required (Private)

**URL Parameters:**
- `questionId` (integer) - The question ID

**Success Response:**
```json
{
  "success": true,
  "message": "Reaction deleted successfully"
}
```

**Error Response:**
- `404 Not Found` - Reaction not found

---

### 10. Get All Quiz Reactions
Get reactions for all questions in a quiz.

**Endpoint:** `GET /api/quizzes/:quizId/reactions`

**Authentication:** Required (Private)

**URL Parameters:**
- `quizId` (integer) - The quiz ID

**Success Response:**
```json
{
  "success": true,
  "data": {
    "quizId": 1,
    "questions": [
      {
        "questionId": 1,
        "questionText": "What is React?",
        "totalLikes": 45,
        "totalDislikes": 5,
        "totalReactions": 50,
        "userReaction": "like"
      },
      {
        "questionId": 2,
        "questionText": "What is JSX?",
        "totalLikes": 38,
        "totalDislikes": 2,
        "totalReactions": 40,
        "userReaction": null
      }
    ]
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The middleware sets `req.user.id` with the authenticated user's ID.

---

## Rate Limiting Recommendations

To prevent abuse, implement rate limiting:

**Module Feedback:**
- Max 1 feedback per user per module per day

**Quiz Reactions:**
- Max 100 reactions per user per hour

---

## Usage Examples

### Frontend Example (React/Fetch)

**Submit Module Feedback:**
```javascript
const submitFeedback = async (moduleId, rating, comment) => {
  const response = await fetch(`/api/modules/${moduleId}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      rating,
      comment,
      isLike: rating >= 4
    })
  });
  
  const data = await response.json();
  return data;
};
```

**Toggle Quiz Reaction:**
```javascript
const toggleReaction = async (questionId, isLike) => {
  const response = await fetch(`/api/quiz-questions/${questionId}/reaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isLike })
  });
  
  const data = await response.json();
  return data;
};
```

**Get Module Feedback with Stats:**
```javascript
const loadModuleFeedback = async (moduleId) => {
  const [feedbackRes, statsRes] = await Promise.all([
    fetch(`/api/modules/${moduleId}/feedback?page=1&limit=10`),
    fetch(`/api/modules/${moduleId}/feedback/stats`)
  ]);
  
  const feedback = await feedbackRes.json();
  const stats = await statsRes.json();
  
  return { feedback, stats };
};
```

---

## Database Schema Reference

### module_feedbacks Table
```sql
CREATE TABLE module_feedbacks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  moduleId INT NOT NULL,
  userId INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  isLike BOOLEAN NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  UNIQUE KEY (userId, moduleId),
  FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

### quiz_question_reactions Table
```sql
CREATE TABLE quiz_question_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  questionId INT NOT NULL,
  userId INT NOT NULL,
  isLike BOOLEAN NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  UNIQUE KEY (userId, questionId),
  FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

---

## Testing Checklist

- [ ] Submit module feedback successfully
- [ ] Update existing module feedback
- [ ] Validate rating range (1-5)
- [ ] Validate comment length (10-1000 chars)
- [ ] Get paginated feedback list
- [ ] Get accurate feedback statistics
- [ ] Get user's own feedback
- [ ] Soft delete feedback (isActive = false)
- [ ] Toggle quiz reaction (like → dislike → remove)
- [ ] Get question reaction stats
- [ ] Get all reactions for a quiz
- [ ] Unique constraint prevents duplicate feedback/reactions
- [ ] CASCADE delete works properly
- [ ] Authentication required for private endpoints
- [ ] Error handling for invalid inputs
