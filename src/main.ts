import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import {createPinia} from "pinia";
import './assets/css/inconfont.css'
import 'vfonts/FiraCode.css'

const app =createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.mount("#app")
window.history.replaceState = function() {};
// 使用这个可能会导致bug，已修复1次