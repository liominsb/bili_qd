<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { getMyVideos } from '../../api/video.ts'
import type { VideoItem } from '../../api/types.ts'
import VideoCard from '../../components/VideoCard.vue'
import { formatPubdate } from '../../utils/format.ts'

const list = ref<VideoItem[]>([])
const offset = ref(0)
const limit = 20
const loading = ref(false)
const hasMore = ref(true)
const errorMessage = ref('')

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const items = await getMyVideos(offset.value, limit)
    list.value = list.value.concat(items)
    offset.value += items.length
    hasMore.value = items.length === limit
  } catch (error) {
    console.error('获取我的视频失败:', error)
    errorMessage.value = '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

function onScroll() {
  const scrollBottom = window.scrollY + window.innerHeight
  if (document.documentElement.scrollHeight - scrollBottom < 200) {
    loadMore()
  }
}

onMounted(() => {
  loadMore()
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="my-videos">
    <div class="videos-head">
      <h2>我的视频</h2>
    </div>

    <VideoCard
      v-for="item in list"
      :key="item.id"
      :video="item"
      :video-id="item.id"
      :time-text="'发布于 ' + formatPubdate(Math.floor(new Date(item.created_at).getTime() / 1000))"
    />

    <div class="load-more">
      <p v-if="loading">加载中...</p>
      <template v-else-if="errorMessage">
        <p>{{ errorMessage }}</p>
        <n-button size="small" @click="loadMore">重试</n-button>
      </template>
      <p v-else-if="!list.length">还没有发布任何视频</p>
      <p v-else-if="!hasMore">没有更多了</p>
    </div>
  </div>
</template>

<style scoped>
.my-videos {
  display: grid;
  grid-template-columns: repeat(auto-fill, 290px);
  gap: 20px;
  justify-content: start;
  padding: 20px 0;
}

.videos-head {
  grid-column: 1 / -1;
  padding-bottom: 6px;
}

.videos-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #18191c;
}

.video {
  width: 290px;
  height: 235px;
}

.load-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: 16px 0;
  color: #9499a0;
  font-size: 14px;
}
</style>
