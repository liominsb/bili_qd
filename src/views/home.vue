<script setup lang="ts">
import {getVideos} from "../api/video.ts";
import type {VideoItem} from "../api/types.ts";
import {onMounted, onUnmounted, ref} from "vue";
import {formatPubdate} from "../utils/format.ts";
import VideoCard from "../components/VideoCard.vue";

const videos = ref<VideoItem[]>([])
const offset = ref(0)          // 当前已加载到第几条，下一页从这里开始
const limit = 20
const loading = ref(false)     // 请求进行中，防止重复触发
const hasMore = ref(true)      // 后端还有没有更多数据

// 加载一页数据：offset 累加，结果拼到已有列表后面
async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const list = await getVideos(offset.value, limit)
    videos.value = videos.value.concat(list)
    offset.value += list.length
    // 返回条数不足 limit，说明这是最后一页
    if (list.length < limit) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('获取推荐视频失败:', error)
  } finally {
    loading.value = false
  }
}

function onScroll() {
  const scrollBottom = window.scrollY + window.innerHeight
  const docHeight = document.documentElement.scrollHeight
  if (docHeight - scrollBottom < 200) {
    loadMore()
  }
}

onMounted(function () {
      loadMore()  // 首屏先加载一页
      window.addEventListener('scroll', onScroll)
    }
)

onUnmounted(function () {
  window.removeEventListener('scroll', onScroll)
})

const banners = [
  { id: 1, pic: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg', title: '第一个轮播标题' },
  { id: 2, pic: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg', title: '第二个轮播标题' },
  { id: 3, pic: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg', title: '第三个轮播标题' },
  { id: 4, pic: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg', title: '第四个轮播标题' },
]
</script>

<template>
  <div class="home">
    <div class="home-focus">
      <n-carousel show-arrow class="home-carousel">
        <div class="slide" v-for="banner in banners" :key="banner.id">
          <img class="slide-img" :src="banner.pic" alt="">
          <div class="slide-mask"></div>
          <p class="slide-text">{{ banner.title }}</p>
        </div>
      </n-carousel>
    </div>

    <VideoCard
      v-for="video in videos"
      :key="video.id"
      :video="video"
      :video-id="video.id"
      :time-text="formatPubdate(Math.floor(new Date(video.created_at).getTime() / 1000))"
    />
    <!-- 底部哨兵：横跨整行，进入视口就触发加载 -->
    <div class="load-more">
      <p v-if="loading">加载中...</p>
      <p v-else-if="!hasMore">没有更多了</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;

  box-sizing: border-box;
  width: 100%;
  max-width: 1985px;
  margin: 0 auto;
  padding: 40px 120px;

  container-type: inline-size;
}
.home-focus {
  /* 内容宽度减去四个间距，再分成五列 */
  --card-width: calc((100cqw - 80px) / 5);

  /* 标题、作者及其间距的总高度 */
  --info-height: 70px;

  grid-column: span 2;
  grid-row: span 2;

  position: relative;
  width: 100%;
  min-width: 0;

  /* 两张封面 + 第一行文字区 + 行间距 */
  height: calc(
      var(--card-width) * 9 / 8
      + var(--info-height)
      + 20px
  );

  align-self: start;
}

.home-focus > .home-carousel {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}


.slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home > .video {
  width: 100%;
  min-width: 0;
  height: auto;
}

/* 新增：每张卡片的标题都预留两行高度 */
.home > .video :deep(h4) {
  height: 40px;
}

/* 底部渐变遮罩：黑 -> 透明，从下往上 */
.slide-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 90px;
  background: linear-gradient(to top, rgb(0 0 0 / 0.69), rgba(0, 0, 0, 0));
}

/* 文字：放在圆点上方（圆点 bottom:18px + 高度约16px，故文字放 44px） */
.slide-text {
  position: absolute;
  left: 18px;
  bottom: 44px;
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .4);
}

.load-more {
  grid-column: 1 / -1;   /* 横跨整个网格的所有列 */
  text-align: center;
  padding: 20px 0;
  color: #9499a0;
  font-size: 14px;
}
</style>