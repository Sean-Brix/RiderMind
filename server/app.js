import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewPath = path.join(__dirname, './View');
const publicPath = path.join(__dirname, './public');


// Request Handler
const app = express();

// Middleware
app.use(urlencoded({ extended: true, limit: '50mb' })); // Increased limit for image uploads
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(cookieParser());
app.use(express.static(viewPath));
app.use('/public', express.static(publicPath));

app.use(
    cors({
        origin: true, // reflect request origin
        methods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
        credentials: true,
    })
);

// API Route
import index from './API/index.js';
app.use('/api', index);

// Fallback handler for non-API routes (optional)
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

export default app;
