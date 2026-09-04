<!-- views/SearchResult.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import {ref, watch} from 'vue'
import {searchVideoByTitle} from '../api/video.ts'
import type {VideoItem} from '../api/types.ts'
import {formatPubdate} from "../utils/format.ts";

const route = useRoute()
const keyword = ref(route.query.q as string || '')
const results = ref<VideoItem[]>([])
const authorName =ref<Map<number, string>>(new Map())
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
    <div class="video" v-for="video in results" :key="video.id">
      <router-link :to="`/video/${video.id}`">
        <img :src="video.pic" :alt="video.title"/>
        <h4>{{ video.title }}</h4>
        <div class="meta">
          <h5>{{ video.author_name }}</h5>
          <h5>· {{ formatPubdate(Math.floor(new Date(video.created_at).getTime() / 1000)) }}</h5>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.search-result {
  display: flex;
  flex-direction: row;
  gap: 40px 20px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 40px 140px;
}

.video {
  width: 264px;
  height: 220px;
}

/* 2. 封面图与圆角 */
.video img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}

/* 3. 基础容器与 B 站字体栈 */
.video a {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", HarmonyOS_Regular, "Helvetica Neue", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 4. 视频标题：锁定 2 行高度并防止被 Flex 压缩截断 */
.video h4 {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  max-height: 40px;          /* 20px * 2行 = 40px */
  margin: 8px 0 0 0;
  flex-shrink: 0;            /* 核心：禁止被 flex 容器挤压导致第二行下半部分被裁 */
  color: #18191c;

  /* 多行截断与省略号 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  transition: color 0.2s ease;
}

/* 5. 底部作者与时间：贴底对齐 */
.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: auto;          /* 吸收多余空间沉底 */
  padding: 4px 0 0 0;
}

.meta h5 {
  font-size: 12px;
  font-weight: 400;
  color: #9499a0;
  margin: 0;
  transition: color 0.2s ease;
}

/* 悬停联动效果 */
.video:hover h4,
.video:hover h5 {
  color: #00aeec;
}
</style>