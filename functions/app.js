import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const isApi = req.path.startsWith('/api');
  if (isApi) console.log(`📥 ${req.method} ${req.path}`);
  res.on('finish', () => {
    if (isApi) console.log(`📤 ${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use(urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  methods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

import apiRouter from './src/API/index.js';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error(`❌ ${req.method} ${req.path} - ${err.message}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

export default app;
