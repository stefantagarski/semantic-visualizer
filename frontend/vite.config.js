import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // allows external access (from Docker)
        port: 5173,
        watch: {
            usePolling: true,  // Better file watching in Docker volumes
            ignored: ['**/node_modules/**', '**/.git/**']
        }
    }
})