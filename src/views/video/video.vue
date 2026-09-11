<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getVideoById,updateVideoLike,getVideos } from '../../api/video.ts'
import {getCommentsByVideoId,addNewComments} from '../../api/comment.ts'
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import type {VideoItem,CommentItem} from '../../api/types.ts'
import {formatDuration, formatPubdate} from "../../utils/format.ts";
import {useUiStore} from "../../store/ui.ts";
import useUserStore from '../../store/user.ts'
import { followUser, unfollowUser, getFollowStats } from '../../api/follow.ts'
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'

const ui = useUiStore()
const message = useMessage()
const route = useRoute()
defineProps(['id'])
const video = ref<VideoItem | null>(null)
const videos = ref<VideoItem[] | null>(null)
const comments = ref<CommentItem[]>([])
onMounted(async () => {
  loadData(route.params.id as string)
  loadFollowState(video.value?.author_id as number)
  ui.collapseBanner()

})
onUnmounted(() => {
  ui.expandBanner()
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
    message.success(res.message)
    value.value = ''
  } catch (err) {
    // err 就是拦截器抛出来的 Error，.message 是后端返回的错误信息
    message.error(err instanceof Error ? err.message : '发表失败')
  }
}

const userStore = useUserStore()
const isFollowing = ref(false)
const followerCount = ref(0)

async function loadFollowState(authorId: number) {
  const stats = await getFollowStats(authorId)
  isFollowing.value = stats.is_following
  followerCount.value = stats.follower_count
}

async function toggleFollow(authorId: number) {
  if (!userStore.isLogin) {
    message.warning('请先登录')
    return
  }
  try {
    if (isFollowing.value) {
      await unfollowUser(authorId)
      followerCount.value--
      isFollowing.value = false
    } else {
      await followUser(authorId)
      followerCount.value++
      isFollowing.value = true
    }
  } catch (err) {
    // err 就是拦截器抛出的 Error，.message 是后端返回的错误信息
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function loadData(id: string | number) {
  video.value = await getVideoById(String(id))
  comments.value = await getCommentsByVideoId(Number(id))
  if (video.value) {
    loadFollowState(video.value.author_id)
  }
  videos.value=(await getVideos(0, 10))
}

watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        loadData(newId as string)
        window.scrollTo({ top: 0, behavior: 'smooth' }) // 顺便滚回顶部
      }
    }
)

</script>

<template>
  <div class="video" v-if="video">
      <div class="main">
        <div class="video-title">
          <span class="title-text">{{ video.title }}</span>
          <div class="date-text">
            <i class="iconfont icon-shipin1"></i>
            <span class="cover-text" style="margin-left: -12px;">{{ video.view_count }}</span>
            <span>{{ dayjs(video.created_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </div>

        </div>
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
    <div class="aside">
      <div class="author-wrap">
      <n-avatar
          round
          :size=48
          :src="video.author_image"
      />
      <div class="author-info">
        <span class="author-name">{{ video.author_name }}</span>
        <span class="author-bio">{{ video.author_bio }} · {{ followerCount }} 粉丝</span>
      </div>
      </div>
      <n-button
          size="small"
          :type="isFollowing ? 'default' : 'primary'"
          @click="toggleFollow(video.author_id)"
          style="border-radius: 5px; "
      >
        {{ isFollowing ? '已关注' : '+ 关注' }}
      </n-button>
      <div class="recommended_videos" v-for="vid in videos" :key="vid.id">
        <n-card :bordered="false" size="small" style="width: 411px; margin-bottom: 10px;">
          <router-link :to="`/video/${vid.id}`" class="card-link">
            <!-- 1. 左侧封面 -->
            <div class="cover">
              <img :src="vid.pic" alt="视频封面" />
              <span class="cover-time">{{ formatDuration(vid.duration) }}</span>
            </div>
            <!-- 2. 右侧信息 -->
            <div class="video-info">
              <h4 class="title">{{ vid.title }}</h4>
              <div class="author">{{ vid.author_name }}</div>
              <div class="meta">
                <i class="iconfont icon-shipin1"></i>
                <span>{{ vid.view_count }}</span>
              </div>
            </div>
          </router-link>
        </n-card>
      </div>
  </div>
  </div>
</template>

<style scoped>
/* 让整个容器水平垂直居中，占满视口高度 */
.video {
  --size:80px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;;
  justify-content: center;
  gap: 20px;
  min-height: 100vh;
  margin: 0;
  padding: 0 200px;
  box-sizing: border-box;
}

.main {
  width: calc(var(--size) * 16);   /* 视频原来多宽，左栏就多宽 */
  flex-shrink: 0;                  /* 禁止被压缩 */
}

.aside {
  flex: 1;                  /* 占据剩余全部宽度 */
  min-width: 300px;         /* 太窄的话给个下限 */
  display: flex;
  flex-direction: column;
}

.video-title {
  display: flex;
  flex-direction: column;  /* 改为纵向排列 */
  padding: 0 0 20px 0;
  font-family: "PingFang SC", "Microsoft YaHei", "PingFang SC Round", sans-serif;
  height: 80px;
}

.video-title .title-text {
  font-size: 24px;
}

.video-title .date-text {
  display: flex;
  font-size: 13px;
  color: #999;
  margin-top: auto;
  gap: 12px;
  align-items: center;
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
  font-family: "PingFang SC", "Microsoft YaHei", "PingFang SC Round", sans-serif;
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

.author-wrap {
  display: flex;
  align-items: center;   /* 头像和文本垂直居中对齐 */
  gap: 12px;             /* 头像与文字间距 */
}

.author-info {
  padding: 10px;
  display: flex;
  flex-direction: column; /* 竖排 */
  gap: 4px;

}

.author-name {
  font-size: 16px;
  font-weight: 600;
}

.author-bio {
  font-size: 13px;
  color: #999;
}

/* 卡片链接：左右横向布局，设置 10px 间距 */
.card-link {
  display: flex;
  flex-direction: row;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}

/* 1. 左侧封面容器：固定宽高，相对定位 */
.cover {
  position: relative;
  width: 189px;
  height: 107px;
  flex-shrink: 0;         /* 禁止被 flex 挤压变形 */
  border-radius: 6px;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 封面右下角时长（仿 B 站黑色半透明小胶囊） */
.cover-time {
  position: absolute;
  right: 6px;
  bottom: 6px;
  font-size: 12px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.65);
  padding: 1px 4px;
  border-radius: 4px;
  line-height: 14px;
  pointer-events: none;
}

/* 2. 右侧信息容器：竖向排列，上下分散对齐 */
.recommended_videos .video-info {
  display: flex;
  flex-direction: column;
  justify-content:flex-start; /* 标题在顶部，作者和播放量在底部 */
  flex: 1;
  min-width: 0;                   /* 关键：允许子元素截断，防止撑开 */
  height: 107px;                  /* 高度和图片 107px 严格一致 */
}

/* 标题：最多显示 2 行，超出省略号 */
.recommended_videos .video-info .title {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: #18191c;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* 作者名称 */
.recommended_videos .video-info .author {
  font-size: 14px;
  color: #9499a0;
  line-height: 16px;
}

/* 底部播放量与图标（横向居中对齐） */
.recommended_videos .video-info .meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #9499a0;
}

/* 播放图标：改为浅灰色，不再使用看不见的白色 */
.recommended_videos .video-info .meta .iconfont {
  font-size: 14px;
  color: #9499a0;
}

</style>