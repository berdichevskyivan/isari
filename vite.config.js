import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 443,
    strictPort: true,
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/isari.ai/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/isari.ai/fullchain.pem')
    },
    watch: {
      ignored: ['**/python/**']
    }
  }
})
