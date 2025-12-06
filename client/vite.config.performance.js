import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production optimizations
const dropConsole = () => {
  return {
    name: 'drop-console',
    transform(code, id) {
      if (process.env.NODE_ENV === 'production') {
        return code
          .replace(/console\.(log|info|debug|warn)\(.*?\);?/g, '')
          .replace(/console\.(log|info|debug|warn)\([^)]*\)/g, '');
      }
      return code;
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    dropConsole()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'icons': ['lucide-react'],
          'print': ['react-to-print']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  }
});
