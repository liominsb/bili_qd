<script setup lang="ts">
import headerBil from './components/header.vue'
import LoginModal from './components/auth/Login.vue'
import useUserStore from './store/user'

const userStore = useUserStore()
if (userStore.token) {
  userStore.fetchMe().catch(() => userStore.logout())
}

// 全局主题：把 naive-ui 默认的 primary（绿）统一成品牌蓝 #23ade5
const themeOverrides = {
  common: {
    primaryColor: '#23ade5',
    primaryColorHover: '#3db9e8',
    primaryColorPressed: '#1f9ad0',
    primaryColorSuppl: '#3db9e8',
    fontFamily: 'PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important',
    bodyColor: '#f4f5f7',
  },
}
</script>

<template>
  <div class="app">
    <n-back-top :right="75"  />
    <n-config-provider :theme-overrides="themeOverrides">
      <div class="header-wrapper">
        <headerBil />
      </div>
      <n-message-provider :closable="true">
        <router-view></router-view>
        <LoginModal/>
      </n-message-provider>
    </n-config-provider>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
  color: #18191c;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<style >
.app {
  min-height: 100vh; /* 使用视口高度 100%，保证内容少时也铺满全屏 */
  width: 100%;
  box-sizing: border-box; /* 确保 padding 不会撑出滚动条 */
}
.header-wrapper {
  width: 100%;
}

/* 表单控件默认不继承字体，强制跟随 body */
input, button, textarea, select {
  font-family: inherit;
}

</style>