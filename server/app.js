import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'colors';

// Configuration
dotenv.config();
colors.enable();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewPath = path.join(__dirname, './View');
const publicPath = path.join(__dirname, './public');
const buildPath = path.join(__dirname, './public/build');

console.log('📦 Loading Express application...'.cyan);
console.log(`   View Path: ${viewPath}`.dim);
console.log(`   Public Path: ${publicPath}`.dim);
console.log(`   Build Path: ${buildPath}`.dim);


// Request Handler
const app = express();

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    // Log request
    const isApi = req.path.startsWith('/api');
    if (isApi || process.env.LOG_ALL_REQUESTS === 'true') {
        console.log(`📥 ${req.method} ${req.path}`.dim);
    }
    
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 500 ? 'red' : 
                           res.statusCode >= 400 ? 'yellow' : 
                           res.statusCode >= 300 ? 'cyan' : 'green';
        
        if (isApi || process.env.LOG_ALL_REQUESTS === 'true') {
            console.log(`📤 ${req.method} ${req.path} ${res.statusCode} ${duration}ms`[statusColor]);
        }
    });
    
    next();
});

// Middleware
app.use(urlencoded({ extended: true, limit: '50mb' })); // Increased limit for image uploads
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(cookieParser());
app.use(express.static(viewPath));
app.use('/public', express.static(publicPath));
// Serve React build
app.use(express.static(buildPath));

app.use(
    cors({
        origin: true, // reflect request origin
        methods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
        credentials: true,
    })
);

// API Route
import index from './API/index.js';

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DATABASE_URL ? 'connected' : 'not configured'
    });
});

app.use('/api', index);

console.log('✅ API routes loaded'.green);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('\n' + '❌ ERROR CAUGHT BY MIDDLEWARE'.red.bold);
    console.error('='.repeat(60).red);
    console.error(`Path: ${req.method} ${req.path}`.yellow);
    console.error(`Error: ${err.message}`.red);
    console.error(`Stack: ${err.stack}`.dim);
    console.error('='.repeat(60).red + '\n');
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Serve React app for all non-API routes (must be after API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

console.log('✅ Express application configured'.green);

export default app;
