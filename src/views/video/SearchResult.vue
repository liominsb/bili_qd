<!-- views/SearchResult.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import {ref, watch} from 'vue'
import {searchVideoByTitle} from '../../api/video.ts'
import type {VideoItem} from '../../api/types.ts'
import {formatPubdate} from "../../utils/format.ts";
import VideoCard from '../../components/VideoCard.vue'


const route = useRoute()
const keyword = ref(route.query.q as string || '')
const results = ref<VideoItem[]>([])
async function fetchResults(title: string,offset?: number, limit?: number,) {
  // 调接口拿搜索结果
  results.value = await searchVideoByTitle(title,offset,limit)
}
watch(() => route.query.q, (newQ) => {
  keyword.value = newQ as string
  fetchResults(keyword.value)
}, { immediate: true })// 组件挂载时立即执行，支持刷新页面或直接访问链接时自动搜索
</script>

<template>
  <div class="search-result">
    <VideoCard
      v-for="video in results"
      :key="video.id"
      :video="video"
      :video-id="video.id"
      :time-text="formatPubdate(Math.floor(new Date(video.created_at).getTime() / 1000))"
    />
  </div>
</template>

<style scoped>
.search-result {
  display: grid;
  grid-template-columns: repeat(auto-fill, 333px);  /* 列宽=卡片宽，容器能放几列放几列 */
  gap: 20px;                                    /* 行距40 列距20，和原来一致 */
  justify-content: center;                           /* 整个网格在容器内居中 */
  padding: 40px 120px;
}

/* 卡片尺寸归页面管：本页网格列宽 333，卡片就 333×262
   （组件根节点同时带父子两个 data-v，所以这里改得到组件根元素） */
.video {
  width: 333px;
  height: 262px;
}
</style>