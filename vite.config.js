import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  return {
    // EdgeOne Pages通常使用根路径，可通过环境变量自定义
    base: process.env.VITE_BASE_URL || '/',
    
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // 开发服务器配置
    server: {
      port: 5173,
      open: true,
      host: true
    },
    
    // 构建配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            icons: ['lucide-react'],
            dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
          },
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    
    // 环境变量配置
    define: {
      // 确保环境变量在生产构建中可用
      'process.env.NODE_ENV': JSON.stringify(mode),
      // 开发环境使用测试配置，生产环境使用环境变量
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(
        isDevelopment ? 'test123' : (
          process.env.VITE_ADMIN_PASSWORD || 
          process.env.ADMIN_PASSWORD || 
          'admin123'
        )
      ),
      'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(
        isDevelopment ? 'dev-test-token' : (
          process.env.VITE_GITHUB_TOKEN || 
          process.env.PERSONAL_ACCESS_TOKEN || 
          ''
        )
      ),
      'import.meta.env.VITE_GITHUB_REPO': JSON.stringify(
        isDevelopment ? 'test-user/test-repo' : (
          process.env.VITE_GITHUB_REPO || 
          process.env.REPOSITORY_NAME || 
          ''
        )
      ),
      // 开发环境启用调试
      'import.meta.env.VITE_DEBUG': JSON.stringify(
        isDevelopment ? 'true' : 'false'
      )
    },
    
    // 确保 EdgeOne Pages 能读取到环境变量
    envPrefix: ['VITE_', 'ADMIN_', 'PERSONAL_', 'REPOSITORY_']
  }
}) 