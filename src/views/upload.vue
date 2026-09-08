<script setup lang="ts">
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5'
import { NUpload, type UploadFileInfo, useMessage } from 'naive-ui'
import { ref } from 'vue'
import type {VideoInput} from '../api/types.ts'
import {addNewVideo} from '../api/video.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = useMessage()
const title = ref<string>("")
const MAX_IMG_SIZE = 50 * 1024 * 1024        // 封面 50MB
const MAX_VIDEO_SIZE = 10000 * 1024 * 1024    // 视频 10000MB

function formatSize(size: number) {
  return (size / 1024 / 1024).toFixed(1) + 'MB'
}

async function beforeUpload_img(data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  const raw = data.file.file
  if (!raw) return false
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(raw.type)) {
    message.error('只能上传 png / jpg / webp 格式的图片，请重新上传')
    return false
  }
  if (raw.size > MAX_IMG_SIZE) {
    message.error(`封面不能超过 50MB，当前 ${formatSize(raw.size)}`)
    return false
  }
  return true
}

async function beforeUpload_video(data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  const raw = data.file.file
  if (!raw) return false
  if (data.file.file?.type !== 'video/mp4') {
    message.error('只能上传 mp4 格式的视频文件，请重新上传')
    return false
  }
  if (raw.size > MAX_VIDEO_SIZE) {
    message.error(`单个视频不能超过 10000MB，当前 ${formatSize(raw.size)}`)
    return false
  }
  return true
}

const uploadResults_video = ref<string>('')
const uploadResults_img = ref<string>('')

function handleFinish_img({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) {
  const xhr = event?.target as XMLHttpRequest
  const resp = JSON.parse(xhr.response) as { url: string }
  uploadResults_img.value = 'http://localhost:3000' + resp.url
  file.url = resp.url
  file.name = file.name || resp.url.split('/').pop() || 'uploaded'
  return file
}

function handleFinish_video({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) {
  const xhr = event?.target as XMLHttpRequest
  const resp = JSON.parse(xhr.response) as { url: string }
  uploadResults_video.value='http://localhost:3000' + resp.url
  file.url = resp.url
  file.name = file.name || resp.url.split('/').pop() || 'uploaded'
  return file
}

async function submit() {
  if (!title.value.trim()) {
    message.error('请先填写视频标题')
    return
  }
  if (!uploadResults_video.value) {
    message.error('请先上传视频文件')
    return
  }
  if (!uploadResults_img.value) {
    message.error('请先上传视频封面')
    return
  }
  const video :VideoInput = {
    title:title.value,
    pic:uploadResults_img.value,
    video_url:uploadResults_video.value,
  }
  const r=await addNewVideo(video)
  message.success(r.message)
  router.push({ name: 'home' })
}
</script>

<template>
  <n-input v-model:value="title" type="text" placeholder="请输入视频标题" />
  <div class="upload-panel">
    <!-- 封面：预览 + 上传框 -->
    <div class="field">
      <div class="field-label">视频封面</div>

      <div class="cover">
        <img v-if="uploadResults_img" :src="uploadResults_img" alt="封面" class="cover-img" />
        <div v-else class="cover-empty">
          <n-icon size="30" :depth="3"><ArchiveIcon /></n-icon>
          <span>暂无封面</span>
        </div>
      </div>

      <n-upload
          class="upload-box upload-box--img"
          action="http://localhost:3000/api/v1/upload"
          :max="1"
          accept="image/png,image/jpeg,image/webp"
          @beforeUpload="beforeUpload_img"
          @finish="handleFinish_img"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 8px">
            <n-icon size="32" :depth="3"><ArchiveIcon /></n-icon>
          </div>
          <n-text style="font-size: 14px">点击或拖动图片到此处上传</n-text>
        </n-upload-dragger>
      </n-upload>

      <div class="tip">建议 16:9，png / jpg / webp，≤5MB</div>
    </div>

    <!-- 视频：拖拽上传框 -->
    <div class="field">
      <div class="field-label">视频文件</div>

      <n-upload
          class="upload-box upload-box--video"
          multiple
          directory-dnd
          action="http://localhost:3000/api/v1/upload"
          :max="1"
          accept="video/mp4"
          @beforeUpload="beforeUpload_video"
          @finish="handleFinish_video"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 8px">
            <n-icon size="40" :depth="3"><ArchiveIcon /></n-icon>
          </div>
          <n-text style="font-size: 15px">点击或者拖动视频到该区域来上传</n-text>
        </n-upload-dragger>
      </n-upload>

      <div class="tip">仅支持 mp4，单个 ≤200MB，最多 5 个</div>
    </div>
  </div>
  <button @click="submit" title="发布"/>
</template>

<style scoped>
/* ============================================================
   说明：现在是独立页面（不在 home.vue 的 .home flex 网格里），
   不需要 flex: 0 0 100% 那套 hack 了。
   整页内容宽度统一收在 820px 内并水平居中：三块（标题 / 卡片 /
   按钮）共用下面这个 --page-w，改一处就整体变宽变窄。
   ============================================================ */

.n-input,
.upload-panel,
button {
  --page-w: min(820px, calc(100% - 48px));
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", HarmonyOS_Regular, "Helvetica Neue", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ===== 1. 标题输入条 ===== */
.n-input {
  display: flex;                    /* 原来是 inline-flex，margin:auto 不生效，改 flex 才能水平居中 */
  width: var(--page-w);
  margin: 32px auto 0;
  box-sizing: border-box;
  /* naive-ui 把这些变量写在行内 style 上，必须 !important 才能覆盖 */
  --n-height: 40px !important;
  --n-font-size: 15px !important;
  --n-border-radius: 8px !important;
  --n-padding-left: 12px !important;
  --n-padding-right: 12px !important;
  --n-border: 1px solid #e3e5e7 !important;
  --n-border-hover: 1px solid #00aeec !important;
  --n-border-focus: 1px solid #00aeec !important;
  --n-box-shadow-focus: 0 0 0 2px rgba(0, 174, 236, 0.12) !important;
  --n-placeholder-color: #9499a0 !important;
}

/* ===== 2. 上传区卡片 ===== */
.upload-panel {
  width: var(--page-w);
  margin: 20px auto 0;
  box-sizing: border-box;           /* 有 padding + border，不加会被撑出 50px */
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px 32px;
  padding: 20px 24px 24px;
  background: #fff;
  border: 1px solid #e3e5e7;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.field {
  display: flex;
  flex-direction: column;
}

/* 视频那一列吃掉剩余宽度，这样宽屏不会留一大块空白 */
.field:last-child {
  flex: 1 1 320px;
}

.field-label {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #18191c;
}

.tip {
  margin-top: 8px;
  font-size: 12px;
  color: #9499a0;
}

/* ===== 3. 封面预览 ===== */
.cover {
  width: 264px;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 12px;
  border-radius: 6px;
  background: #f6f7f8;
  overflow: hidden;
}

.cover-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;           /* 不想裁剪就改成 contain */
}

.cover-empty {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #9499a0;
  font-size: 13px;
}

/* ===== 4. 拖拽框 ===== */
.upload-box :deep(.n-upload-dragger) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  border: 1px dashed #e3e5e7;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-box :deep(.n-upload-dragger:hover) {
  border-color: #fb7299;
  background: #fff5f8;
}

.upload-box--img :deep(.n-upload-dragger) {
  width: 264px;
  height: 110px;
}

.upload-box--video :deep(.n-upload-dragger) {
  width: 100%;                  /* 跟随 .field:last-child 的剩余宽度 */
  height: 150px;
}

/* ===== 5. 发布按钮 =====
   模板里 button 没有文字，用 ::after 补上"发布"两个字。
   按钮本身占满整行宽度并把胶囊推到右侧，点击热区只有胶囊那一块。 */
button {
  width: var(--page-w);
  margin: 24px auto 48px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;    /* 想居中就改成 center */
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

button::after {
  content: '发布';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 40px;
  border-radius: 8px;
  background: #fb7299;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

button:hover::after {
  background: #fc8bab;
  box-shadow: 0 2px 8px rgba(251, 114, 153, 0.35);
}

button:active::after {
  background: #e5658a;
}

/* ===== 6. 窄屏：两个上传区改为上下排列 ===== */
@media (max-width: 900px) {
  .upload-panel {
    flex-direction: column;
    gap: 24px;
  }
}
</style>
