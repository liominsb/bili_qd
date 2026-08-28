<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
defineProps(['id'])
const videoSrc = `http://127.0.0.1:3000/api/v1/videos/${route.params.id}`
</script>

<template>
  <div class="video">
    <h1 class="video-title">Video: {{ id }}</h1>
    <div class="video-wrapper">
      <video :src="videoSrc" controls></video>
    </div>

  </div>
</template>

<style scoped>
/* 让整个容器水平垂直居中，占满视口高度 */
.video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

/* 视频固定宽高（16:9 示例），并居中 */
video {
  width: 800px;
  height: 450px;
  background: #000; /* 加载时黑色背景 */
  display: block;
}
</style>