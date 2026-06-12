import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // 使用相對路徑，讓 dist/index.html 可以直接用瀏覽器開啟，
  // 也能部署在 GitHub Pages 等子路徑底下而不會出現空白頁。
  base: './',
  plugins: [react(), tailwindcss()],
})
