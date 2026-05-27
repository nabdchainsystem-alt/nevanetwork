import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Waitlist API origin (Phase 7). In dev/preview Vite proxies `/api` to the standalone Node
// waitlist server (run `pnpm server`, default :8787). Override with NEVA_API if it runs elsewhere.
const apiTarget = process.env.NEVA_API ?? 'http://localhost:8787'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bind to 0.0.0.0 so other devices on the same Wi-Fi (phones, tablets) can
  // open the dev/preview server. `pnpm dev` then prints a "Network:" URL like
  // http://192.168.x.x:5173/ — open that on the device.
  // `/api` is proxied to the waitlist server so the landing form works in dev/preview.
  server: { host: true, proxy: { '/api': { target: apiTarget, changeOrigin: true } } },
  preview: { host: true, proxy: { '/api': { target: apiTarget, changeOrigin: true } } },
})
