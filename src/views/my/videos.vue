<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { deleteVideo, getMyVideos } from '../../api/video.ts'
import type { VideoItem } from '../../api/types.ts'
import VideoCard from '../../components/VideoCard.vue'
import VideoDeleteButton from '../../components/VideoDeleteButton.vue'
import { formatPubdate } from '../../utils/format.ts'

const message = useMessage()
const list = ref<VideoItem[]>([])
const offset = ref(0)
const limit = 20
const loading = ref(false)
const deletingVideoId = ref<number | null>(null)
const showDeleteDrawer = ref(false)
const selectedVideo = ref<VideoItem | null>(null)
const hasMore = ref(true)
const errorMessage = ref('')

async function loadMore() {
  if (loading.value || deletingVideoId.value !== null || !hasMore.value) return
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

function openDeleteDrawer(video: VideoItem) {
  selectedVideo.value = video
  showDeleteDrawer.value = true
}

function clearDeleteSelection() {
  if (!showDeleteDrawer.value) selectedVideo.value = null
}

async function handleDelete() {
  if (!selectedVideo.value || loading.value || deletingVideoId.value !== null) return false
  const videoId = selectedVideo.value.id
  deletingVideoId.value = videoId
  try {
    await deleteVideo(String(videoId))
    list.value = list.value.filter(item => item.id !== videoId)
    offset.value = Math.max(0, offset.value - 1)
    showDeleteDrawer.value = false
    message.success('视频删除成功')
    return true
  } catch (error) {
    message.error(error instanceof Error ? error.message : '删除失败，请重试')
    return false
  } finally {
    deletingVideoId.value = null
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
    >
      <template #extra>
        <VideoDeleteButton
          :disabled="loading || deletingVideoId !== null"
          :aria-label="'删除视频：' + item.title"
          @click="openDeleteDrawer(item)"
        />
      </template>
    </VideoCard>

    <n-drawer
      v-model:show="showDeleteDrawer"
      width="min(380px, 100vw)"
      placement="right"
      :mask-closable="deletingVideoId === null"
      :close-on-esc="deletingVideoId === null"
      @after-leave="clearDeleteSelection"
    >
      <n-drawer-content title="删除视频" :closable="deletingVideoId === null">
        <VideoCard
          v-if="selectedVideo"
          class="drawer-video"
          :video="selectedVideo"
          :video-id="selectedVideo.id"
          :time-text="'发布于 ' + formatPubdate(Math.floor(new Date(selectedVideo.created_at).getTime() / 1000))"
        />
        <p>请核对视频，点击下方按钮继续确认。</p>
        <template #footer>
          <n-space>
            <n-button
              :disabled="deletingVideoId !== null"
              @click="showDeleteDrawer = false"
            >取消</n-button>
            <n-popconfirm
              @positive-click="handleDelete"
              negative-text="取消"
              positive-text="确定删除"
              :positive-button-props="{
                loading: deletingVideoId !== null,
                disabled: loading || deletingVideoId !== null
              }"
              :negative-button-props="{ disabled: deletingVideoId !== null }"
            >
              <template #trigger>
                <n-button type="error" :disabled="loading || deletingVideoId !== null">
                  删除视频
                </n-button>
              </template>
              确定要删除「{{ selectedVideo?.title }}」吗？
            </n-popconfirm>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

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

.video.drawer-video {
  width: 100%;
  height: auto;
}

.drawer-video :deep(a) {
  height: auto;
}

.drawer-video :deep(h4) {
  display: block;
  max-height: none;
  overflow: visible;
  -webkit-line-clamp: unset;
  line-clamp: unset;
}

.drawer-video :deep(.meta) {
  flex-wrap: wrap;
}

.load-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: 16px 0;
  color: #9499a0;
  font-size: 14px;
}
</style>
