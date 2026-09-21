<script setup lang="ts">
import { useRoute } from 'vue-router'
import {getVideoById, updateVideoLike, getVideos, getLikeStats} from '../../api/video.ts'
import {getCommentsByVideoId,addNewComments} from '../../api/comment.ts'
import {computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch} from "vue";
import type {VideoItem,CommentItem,VideoLike} from '../../api/types.ts'
import {formatDuration, formatPubdate} from "../../utils/format.ts";
import {useUiStore} from "../../store/ui.ts";
import useUserStore from '../../store/user.ts'
import { followUser, unfollowUser, getFollowStats } from '../../api/follow.ts'
import { favoriteVideo, unfavoriteVideo, getFavoriteStats } from '../../api/favorite.ts'
import { reportHistory } from '../../api/history.ts'
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'

const ui = useUiStore()
const message = useMessage()
const route = useRoute()
defineProps(['id'])
const video = ref<VideoItem | null>(null)
const videos = ref<VideoItem[] | null>(null)
const comments = ref<CommentItem[]>([])
const likes = ref<VideoLike>()
async function loadData(id: string | number) {
  video.value = await getVideoById(String(id))
  comments.value = await getCommentsByVideoId(Number(id))
  likes.value =await getLikeStats(Number(id))
  if (video.value) {
    loadFollowState(video.value.author_id)
    loadFavoriteState(video.value.id)
  }
  videos.value=(await getVideos(0, 10))
}

onMounted(async () => {
  loadData(route.params.id as string)
  ui.collapseBanner()
  window.addEventListener('pagehide', onPageHide) // 刷新/关标签页时还能抢救一次
})
// ⚠️ 上报必须放在 beforeUnmount，不能挪到 unmounted：
// unmounted 触发时 DOM 已被移除、videoRef 已变成 null，那时读 currentTime 只会得到 0，
// 一上报就把用户刚攒的进度清零。这里没有别的兜底，钩子时机就是唯一保障。
onBeforeUnmount(() => {
  sendHistory() // 离开页面前把进度存下来
})
onUnmounted(() => {
  stopTimer()
  window.removeEventListener('pagehide', onPageHide)
  ui.expandBanner() // 等页面拆完再展开顶部 banner
})
// res.ok = true 表示点赞后当前处于已赞状态
async function updateVL(id: number) {
  if (likes.value == undefined) {
    return
  }
  const res=await updateVideoLike(id)
  likes.value.is_liked = res.ok
  if (res.ok) {
      likes.value.like_count++
  } else {
      likes.value.like_count--
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

// ===== 收藏 =====
const isFavorited = ref(false)
const favoriteCount = ref(0)

async function loadFavoriteState(videoId: number) {
  const stats = await getFavoriteStats(videoId)
  isFavorited.value = stats.is_favorite
  favoriteCount.value = stats.favorite_count
}

async function toggleFavorite() {
  if (!userStore.isLogin) {
    message.warning('请先登录')
    return
  }
  const videoId = video.value?.id
  if (!videoId) return
  try {
    if (isFavorited.value) {
      await unfavoriteVideo(videoId)
      favoriteCount.value--
      isFavorited.value = false
      message.success('已取消收藏')
    } else {
      await favoriteVideo(videoId)
      favoriteCount.value++
      isFavorited.value = true
      message.success('收藏成功')
    }
  } catch (err) {
    // err 就是拦截器抛出的 Error，.message 是后端返回的错误信息
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        sendHistory() // 先把【旧】视频的进度存下来，再加载新的
        hasPlayed = false  // 新视频的"看过"重新计
        stopTimer()
        loadData(newId as string)
        window.scrollTo({ top: 0, behavior: 'smooth' }) // 顺便滚回顶部
      }
    }
)

// ===== 播放历史上报 =====
// 首次 play 立即上报（保证"看过"能进历史），播放中每 1 分钟兜底一次，
// 暂停/切视频/离开页面时各存一次；页面真卸载时只有 keepalive 请求发得出去。
const videoRef = ref<HTMLVideoElement | null>(null)
let timer: number | null = null   // 播放中的周期上报定时器
let hasPlayed = false             // 没点过播放的页面不产生历史记录

const REPORT_INTERVAL = 60 * 1000 // 1 分钟

function startTimer() {
  stopTimer()
  timer = window.setInterval(function () {
    sendHistory()
  }, REPORT_INTERVAL)
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function sendHistory() {
  if (!hasPlayed || !video.value) return
  reportHistory(video.value.id, Math.floor(videoRef.value?.currentTime ?? 0)).catch(function () {})
}

function onPlay() {
  hasPlayed = true
  sendHistory() // 首次 play 立刻记一笔
  startTimer()
}

function onPause() {
  sendHistory() // 暂停是天然的保存点
  stopTimer()        // 暂停期间不计时
}

// 页面真卸载（刷新/关标签页/关浏览器）时才走这里
function onPageHide() {
  sendHistory()
}

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
          <video ref="videoRef" :src="src" controls @play="onPlay" @pause="onPause"></video>
        </div>
        <div class="video-data">
          <i class="iconfont icon-dianzan_kuai" :class="{ 'liked': likes?.is_liked }" @click="updateVL(video.id)"></i>
          <span>{{likes?.like_count}}</span>
          <i class="iconfont icon-shoucang" :class="{ 'favorited': isFavorited }" @click="toggleFavorite()"></i>
          <span>{{ favoriteCount }}</span>
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
          :size="48"
          :src="video.author_image"
      />
      <div class="author-info">
        <span class="author-name">{{ video.author_name }}</span>
        <span class="author-bio">{{ video.author_bio }}</span>
      </div>
      </div>
      <n-button
          size="small"
          :type="isFollowing ? 'default' : 'primary'"
          @click="toggleFollow(video.author_id)"
          style="border-radius: 5px; "
      >
        {{ isFollowing ? '已关注' : '+ 关注' }} {{ followerCount }} 粉丝
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

.icon-dianzan_kuai {          /* 选择器：选中 class 为 "icon-dianzan_kuai" 的元素 */
  font-size: 24px;       /* 图标大小：24 像素（因为它是字体图标） */
  color: #999;           /* 图标颜色：中灰色 #999 */
  cursor: pointer;       /* 鼠标悬停时显示"小手"光标，提示可点击 */
  transition: color .2s; /* 颜色变化时，用 0.2 秒平滑过渡，而不是瞬间变 */

}

.icon-dianzan_kuai.liked {
  color: #fb7299;
}

/* 点赞/收藏那一行：横向排列 + 垂直居中对齐（原来图标和数字是 inline，对齐靠基线） */
.video-data {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-shoucang {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: color .2s;
  margin-left: 20px;     /* 跟点赞之间留点距离 */
}

.icon-shoucang.favorited {
  color: #ffb027;        /* 收藏用 B 站的金黄色，跟点赞的粉色区分开 */
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
  min-width: 0;          /* 让这一行可以在 .aside 里收缩，长 bio 才不会撑爆 */
}

/* 头像作为 flex item 默认 flex-shrink:1，长文本会把它挤扁/挤出画面 */
.author-wrap :deep(.n-avatar) {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;    /* 兜底：没有图片时也保证是正圆 */
}

.author-info {
  padding: 10px;
  display: flex;
  flex-direction: column; /* 竖排 */
  gap: 4px;

  /* 关键：flex item 的 min-width 默认是 auto（不能小于内容最小宽度），
     改成 0 才允许它比内容更窄，里面的省略号才有机会生效 */
  min-width: 0;
  flex: 1;               /* 占满头像右侧剩余空间，给 bio 一个确切宽度 */
}

.author-name {
  font-size: 16px;
  font-weight: 600;
}

.author-bio {
  font-size: 13px;
  color: #999;
  /* 单行省略三件套 */
  white-space: nowrap;      /* 不换行，否则会被折成多行 */
  overflow: hidden;         /* 溢出部分裁掉 */
  text-overflow: ellipsis;  /* 裁掉的地方显示 … */

  max-width: 100%;          /* 兜底，确保它不会反过来把父容器撑宽 */
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