import express from 'express';
import login from '../../Controller/auth/login.js';

const router = express.Router();

// Public login
router.post('/login', login);

export default router;
