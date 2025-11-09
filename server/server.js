import http from 'http'
import dotenv from 'dotenv'
import colors from 'colors'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './app.js'

// Configuration
dotenv.config();
colors.enable();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log startup information
console.log('\n' + '='.repeat(60).cyan);
console.log('🏍️  RIDERMIND SERVER STARTING'.bold.cyan);
console.log('='.repeat(60).cyan);
console.log(`📅 Time: ${new Date().toISOString()}`.dim);
console.log(`🌍 Environment: ${NODE_ENV}`.yellow);
console.log(`🔌 Port: ${PORT}`.green);
console.log(`📂 Directory: ${__dirname}`.dim);
console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`.yellow);
console.log('='.repeat(60).cyan + '\n');

// Server
const server = http.createServer(app);

// Error handling for server
server.on('error', (error) => {
    console.error('\n' + '❌ SERVER ERROR'.red.bold);
    console.error('='.repeat(60).red);
    
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`.red);
        console.error('💡 Try a different port or kill the process using this port'.yellow);
    } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied for port ${PORT}`.red);
        console.error('💡 Try using a port number above 1024'.yellow);
    } else {
        console.error(`❌ ${error.message}`.red);
        console.error(error.stack.dim);
    }
    
    console.error('='.repeat(60).red + '\n');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n' + '⚠️  SIGTERM received, shutting down gracefully...'.yellow);
    server.close(() => {
        console.log('✅ Server closed'.green);
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n' + '⚠️  SIGINT received, shutting down gracefully...'.yellow);
    server.close(() => {
        console.log('✅ Server closed'.green);
        process.exit(0);
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('\n' + '💥 UNCAUGHT EXCEPTION'.red.bold);
    console.error('='.repeat(60).red);
    console.error(`❌ ${error.message}`.red);
    console.error(error.stack.dim);
    console.error('='.repeat(60).red + '\n');
    process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n' + '💥 UNHANDLED REJECTION'.red.bold);
    console.error('='.repeat(60).red);
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    console.error('='.repeat(60).red + '\n');
});

server.listen(PORT,'0.0.0.0', ()=>{
    console.log('✅ SERVER READY'.green.bold);
    console.log('='.repeat(60).green);
    console.log('🌐 Server is listening on:'.green);
    console.log(`   Local:   ${'http://localhost:' + PORT}`.cyan.underline);
    console.log(`   Network: ${'http://127.0.0.1:' + PORT}`.cyan.underline);
    if (NODE_ENV === 'production') {
        console.log(`   Public:  ${process.env.RENDER_EXTERNAL_URL || 'N/A'}`.cyan.underline);
    }
    console.log('='.repeat(60).green);
    console.log('📡 API endpoints available at: ' + `http://localhost:${PORT}/api`.yellow);
    console.log('🎨 React app served from: ' + 'public/build'.yellow);
    console.log('='.repeat(60).green + '\n');
    console.log('💡 Press Ctrl+C to stop the server'.dim);
    console.log('');
})

export default server;
