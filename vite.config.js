import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // 任何ip都可访问该项目
    port: 8081,  // 项目启动端口
    open: true   // 是否默认打开浏览器
  }
})
