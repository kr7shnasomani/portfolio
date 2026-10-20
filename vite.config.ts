import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Content-Security-Policy for the built page, as a meta tag so it holds on any static host. Dev is left alone: Vite's
// dev server relies on inline scripts. data: covers the SVG patterns City.tsx builds at runtime. The host headers
// (vercel.json, public/_headers) repeat it with frame-ancestors, which a meta tag can't carry.
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'"

const csp = (): Plugin => ({
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), csp()],
})
