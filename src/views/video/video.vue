<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getVideoById,updateVideoLike } from '../../api/video.ts'
import {getCommentsByVideoId,addNewComments} from '../../api/comment.ts'
import {computed, onMounted, ref} from "vue";
import type {VideoItem,CommentItem} from '../../api/types.ts'
import {formatPubdate} from "../../utils/format.ts";
const route = useRoute()
defineProps(['id'])
const video = ref<VideoItem | null>(null)
const comments = ref<CommentItem[]>([])
onMounted(async () => {
  video.value=(await getVideoById(route.params.id as string))
  comments.value=(await getCommentsByVideoId(video.value?.id as number))
})
// ok = true 表示当前已赞
const ok = ref<boolean>(false)
async function updateVL(id: number) {
  const res=await updateVideoLike(id)
  ok.value=res.ok
  if (ok.value) {
    if (video.value) {
      video.value.like_count++
    }
  } else {
    if (video.value) {
      video.value.like_count--
    }
  }
}
const src = computed(() => video.value?.video_url ?? '')

const value = ref<string>("")

async function handleSubmit() {
  try {
    const res = await addNewComments({ content: value.value, parent_id: 0 }, video.value?.id as number)
    alert(res.message)
    value.value = ''
  } catch (err) {
    // err 就是拦截器抛出来的 Error，.message 是后端返回的错误信息
    alert(err instanceof Error ? err.message : '发表失败')
  }
}

</script>

<template>
  <div class="video" v-if="video">
    <h1 class="video-title">{{video.title}}</h1>
    <div class="video-wrapper">
      <video :src="src" controls></video>
    </div>
    <div class="video-data">
      <i class="iconfont icon-dianzan" :class="{ 'liked': ok }" @click="updateVL(video.id)"></i>
      <span>{{video.like_count}}</span>
    </div>
    <n-divider />
    <div class="video-text">
      <h1>
        评论
        <span>最热</span>
        <span>|</span>
        <span>最新</span>
      </h1>
      <n-button type="info" @click="handleSubmit">
        发布
      </n-button>
    </div>
    <n-space vertical>
      <n-input
          v-model:value="value"
          type="textarea"
          placeholder="千山万水总是情，写个评论行不行"
          size="medium"
      />
    </n-space>
    <div class="comment" v-for="comment in comments" :key="comment.id">
      <n-flex vertical>
        <div class="comment-Authorinfo">
          <n-avatar
              round
              size="medium"
              :src="comment.author_image"
          />
          <span>{{ comment.author_name }}</span>
        </div>
        <div class="comment-content">
          <span>{{ comment.content }}</span>
        </div>
        <div class="comment-Date">{{ formatPubdate(Math.floor(new Date(comment.created_at).getTime() / 1000)) }}</div>
      </n-flex>
      <n-divider />
    </div>
  </div>
</template>

<style scoped>
/* 让整个容器水平垂直居中，占满视口高度 */
.video {
  --size:60px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 60px;
  box-sizing: border-box;
}

/* 视频固定宽高（16:9 示例），并居中 */
video {
  width: calc(var(--size) * 16);
  height: calc(var(--size) * 9);
  background: #000; /* 加载时黑色背景 */
  display: block;
}

.n-space {
  width: calc(var(--size) * 16);
}

.n-input {
  width: 100%;

}
.video-text {
  width: calc(var(--size) * 16);
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
  margin: 20px 0;
}

/* 让h1里的span水平排列（默认h1是块级） */
.video-text h1 {
  display: flex;
  align-items: center;
  gap: 8px; /* span之间的间距 */
  font-size: 20px; /* 调整大小 */
  margin: 0; /* 去掉默认外边距 */
}

.video-text span {
  font-size: 14px;
  color: #999;
  margin-left: 10px;
}

.icon-dianzan {          /* 选择器：选中 class 为 "icon-dianzan" 的元素 */
  font-size: 24px;       /* 图标大小：24 像素（因为它是字体图标） */
  color: #999;           /* 图标颜色：中灰色 #999 */
  cursor: pointer;       /* 鼠标悬停时显示"小手"光标，提示可点击 */
  transition: color .2s; /* 颜色变化时，用 0.2 秒平滑过渡，而不是瞬间变 */

}

.icon-dianzan.liked {
  color: #fb7299;
}

.comment {
  --size:60px;
  width: calc(var(--size) * 16);
  padding: 20px 0 0 20px;
}

.comment .comment-Authorinfo {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #999;                              /* 灰色 */
  font-family: "PingFang SC", "Microsoft YaHei", "PingFang SC Round", sans-serif;  /* 圆润 */
}

.comment .comment-content {
  padding-left: 54px;
  font-size: 15px;
  font-family: "PingFang SC", "Microsoft YaHei", "PingFang SC Round", sans-serif;
}

.comment .comment-Date {
  padding-left: 54px;
  font-size: 13px;
  color: #999;                              /* 灰色 */
  font-family: "PingFang SC", "Microsoft YaHei", "PingFang SC Round", sans-serif;  /* 圆润 */
}
</style>