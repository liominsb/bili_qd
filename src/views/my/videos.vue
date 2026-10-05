<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMessage, type UploadFileInfo } from 'naive-ui'
import { deleteVideo, getMyVideos, updateVideo } from '../../api/video.ts'
import { uploadFile } from '../../api/upload.ts'
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
const showDrawer = ref(false)
const drawerMode = ref<'delete' | 'edit'>('delete')
const selectedVideo = ref<VideoItem | null>(null)
const editTitle = ref('')
const coverFile = ref<File | null>(null)
const coverPreview = ref('')
const uploadedCoverUrl = ref('')
const saving = ref(false)
const busy = computed(() => saving.value || deletingVideoId.value !== null)
const previewVideo = computed(() => {
  const video = selectedVideo.value
  if (!video || drawerMode.value === 'delete') return video
  return { ...video, title: editTitle.value, pic: coverPreview.value || video.pic }
})
const hasMore = ref(true)
const errorMessage = ref('')

async function loadMore() {
  if (loading.value || busy.value || !hasMore.value) return
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

function resetCover() {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverPreview.value = ''
  coverFile.value = null
  uploadedCoverUrl.value = ''
}

function openDrawer(video: VideoItem, mode: 'delete' | 'edit') {
  if (busy.value) return
  resetCover()
  selectedVideo.value = video
  drawerMode.value = mode
  editTitle.value = video.title
  showDrawer.value = true
}

function clearSelection() {
  if (!showDrawer.value) {
    selectedVideo.value = null
    resetCover()
  }
}

function validateCover({ file }: { file: UploadFileInfo }) {
  if (busy.value || !showDrawer.value || drawerMode.value !== 'edit') return false
  const raw = file.file
  if (!raw) return false
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(raw.type)) {
    message.error('封面只支持 PNG、JPEG、WebP 图片')
    return false
  }
  if (!raw.size || raw.size > 50 * 1024 * 1024) {
    message.error('请选择大小不超过 50MB 的非空图片')
    return false
  }
  return true
}

function handleCoverChange({ file }: { file: UploadFileInfo }) {
  if (busy.value || !showDrawer.value || drawerMode.value !== 'edit' || !file.file) return
  resetCover()
  coverFile.value = file.file
  coverPreview.value = URL.createObjectURL(file.file)
}

async function handleSave() {
  const video = selectedVideo.value
  if (!video || drawerMode.value !== 'edit' || loading.value || busy.value) return
  const title = editTitle.value.trim()
  if (!title || Array.from(title).length > 255) {
    message.error('标题不能为空，且不能超过 255 个字符')
    return
  }
  saving.value = true
  try {
    if (coverFile.value && !uploadedCoverUrl.value) {
      const result = await uploadFile(coverFile.value)
      if (!result.url) throw new Error('封面上传失败，请重试')
      uploadedCoverUrl.value = result.url
    }
    const pic = uploadedCoverUrl.value || video.pic
    await updateVideo({ title, pic, video_url: video.video_url, duration: video.duration }, String(video.id))
    list.value = list.value.map(item => item.id === video.id ? { ...item, title, pic } : item)
    selectedVideo.value = { ...video, title, pic }
    showDrawer.value = false
    message.success('保存完成')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!selectedVideo.value || drawerMode.value !== 'delete' || loading.value || busy.value) return false
  const videoId = selectedVideo.value.id
  deletingVideoId.value = videoId
  try {
    await deleteVideo(String(videoId))
    list.value = list.value.filter(item => item.id !== videoId)
    offset.value = Math.max(0, offset.value - 1)
    showDrawer.value = false
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
  resetCover()
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
        <n-button
          class="edit-btn"
          size="small"
          :disabled="loading || busy"
          @click="openDrawer(item, 'edit')"
        >编辑</n-button>
        <VideoDeleteButton
          :disabled="loading || busy"
          :aria-label="'删除视频：' + item.title"
          @click="openDrawer(item, 'delete')"
        />
      </template>
    </VideoCard>

    <n-drawer
      v-model:show="showDrawer"
      width="min(380px, 100vw)"
      placement="right"
      :mask-closable="!busy"
      :close-on-esc="!busy"
      @after-leave="clearSelection"
    >
      <n-drawer-content :title="drawerMode === 'edit' ? '编辑视频' : '删除视频'" :closable="!busy">
        <VideoCard
          v-if="previewVideo"
          class="drawer-video"
          :video="previewVideo"
          :video-id="previewVideo.id"
          :time-text="'发布于 ' + formatPubdate(Math.floor(new Date(previewVideo.created_at).getTime() / 1000))"
          @click.capture="busy && $event.preventDefault()"
        />
        <n-form v-if="drawerMode === 'edit'" class="edit-form">
          <n-form-item label="标题">
            <n-input v-model:value="editTitle" :disabled="saving" placeholder="请输入视频标题" />
          </n-form-item>
          <n-form-item label="封面">
            <div>
              <n-upload
                :default-upload="false"
                :file-list="[]"
                :show-file-list="false"
                :max="1"
                :disabled="saving"
                accept="image/png,image/jpeg,image/webp"
                @before-upload="validateCover"
                @change="handleCoverChange"
              >
                <n-button :disabled="saving">选择新封面</n-button>
              </n-upload>
              <p v-if="coverFile">已选择：{{ coverFile.name }}</p>
              <n-button v-if="coverFile" text :disabled="saving" @click="resetCover">恢复原封面</n-button>
              <p>支持 PNG、JPEG、WebP，最大 50MB。点击保存后上传。</p>
            </div>
          </n-form-item>
        </n-form>
        <p v-else>请核对视频，点击下方按钮继续确认。</p>
        <template #footer>
          <n-space>
            <n-button
              :disabled="busy"
              @click="showDrawer = false"
            >取消</n-button>
            <n-button
              v-if="drawerMode === 'edit'"
              type="primary"
              :loading="saving"
              :disabled="loading || busy"
              @click="handleSave"
            >{{ saving ? '保存中...' : '保存' }}</n-button>
            <n-popconfirm
              v-else
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

.edit-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  opacity: 0;
}

.video:hover .edit-btn {
  opacity: 1;
}

.edit-form {
  margin-top: 20px;
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
