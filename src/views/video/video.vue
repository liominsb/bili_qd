<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getVideoById } from '../../api/video.ts'
import {computed, onMounted, ref} from "vue";
import type {VideoItem} from '../../api/types.ts'
const route = useRoute()
defineProps(['id'])
const video = ref<VideoItem | null>(null)
onMounted(async () => {
  video.value=(await getVideoById(route.params.id as string))
})

const src = computed(() => video.value?.video_url ?? '')

</script>

<template>
  <div class="video" v-if="video">
    <h1 class="video-title">Video: {{video.title}}</h1>
    <div class="video-wrapper">
      <video :src="src" controls></video>
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