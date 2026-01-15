import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base : '/',
  build: {
    // 1. Increase the warning limit to 1000kB so the error goes away
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // 2. Manual Chunking: Breaks big libraries into separate files
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put Firebase in its own chunk
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Put Gemini/Google AI in its own chunk
            if (id.includes('@google/generative-ai')) {
              return 'vendor-gemini';
            }
            // Put Lucide icons in its own chunk
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor'; // All other small libraries
          }
        },
      },
    },
  },
})
