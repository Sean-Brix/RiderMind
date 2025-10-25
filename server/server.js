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

// Server
const server = http.createServer(app);

server.listen(PORT, ()=>{
    console.log(
        '\n\n\n\nLINK: '.cyan + ('http://127.0.0.1:' + PORT + '/\n').yellow.italic.underline
    );
})

export default server;
