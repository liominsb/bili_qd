import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

const BACKEND = 'http://localhost:3000'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [NaiveUiResolver()]
    })
  ],
  server: {
    // 开发时的「替身 nginx」：浏览器只跟 dev server 说话，
    // 由 Vite 在自己的 Node 进程里把请求转发给后端。
    // 好处一：页面和接口在浏览器看来永远同源，不用管 CORS。
    // 好处二：和线上 nginx 的 location /api/ 行为一致，
    //         前端地址不用在「空值 / localhost:3000」之间切来切去。
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      // 后端返回的媒体地址是相对路径（/uploads/xxx.mp4、/uploads/xxx.jpg），
      // 不一起代理的话会打到 dev server 上变 404，封面和视频全显示不出来
      '/uploads': { target: BACKEND, changeOrigin: true }
    }
  }
})
