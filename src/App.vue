<script setup lang="ts">
import headerBil from './components/header.vue'
import LoginModal from './components/auth/Login.vue'
</script>

<template>
  <div class="app">
    <div class="header-wrapper">
      <headerBil />
    </div>
    <LoginModal/>
    <router-view></router-view>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
<style >
.app {
  min-height: 100vh; /* 使用视口高度 100%，保证内容少时也铺满全屏 */
  width: 100%;
  box-sizing: border-box; /* 确保 padding 不会撑出滚动条 */
}
.header-wrapper {
  zoom: 1.1;
  width: 100%;
}
</style>