<script setup lang="ts">
import {getVideos} from "../api/video.ts";
import type {VideoItem} from "../api/types.ts";
import {onMounted, ref} from "vue";
import {formatDuration, formatPubdate} from "../utils/format.ts";

const videos = ref<VideoItem[]>([])
// 2. 在组件挂载时异步请求
onMounted(async () => {
  try {
    videos.value = await getVideos(0, 20)
  }
   catch (error) {
    console.error('获取推荐视频失败:', error)
  }
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
      <n-carousel show-arrow style="width: 686px;height: 470px;">
        <div class="slide" v-for="banner in banners" :key="banner.id">
          <img class="slide-img" :src="banner.pic">
          <div class="slide-mask"></div>
          <p class="slide-text">{{ banner.title }}</p>
        </div>
      </n-carousel>
    </div>

    <div class="video" v-for="video in videos" :key="video.id">
<!--      <router-link :to="{ name: 'video', params: { id: video.id } }">-->
      <router-link :to="`/video/${video.id}`">
        <div class="cover">
          <img :src="video.pic" :alt="video.title"/>
          <div class="img-interface"></div>
          <i class="iconfont icon-shipin1" style="color: #ffffff;"></i>
          <p class="cover-text">{{ video.id }}</p>
          <p class="cover-time">{{ formatDuration(video.duration) }}</p>
        </div>
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
.home {
  display: grid;
  grid-template-columns: repeat(auto-fill, 333px);  /* 列宽=卡片宽，容器能放几列放几列 */
  gap: 20px;                                    /* 行距40 列距20，和原来一致 */
  justify-content: center;                           /* 整个网格在容器内居中 */
  padding: 40px 120px;
}

.home-focus {
  grid-column: span 2;   /* 横向占 2 列 → 333×2 + 20 = 686px */
  grid-row: span 2;      /* 纵向占 2 行 → 262×2 + 20 = 544px */
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

.video {
  width: 333px;
  height: 262px;
}

.video .cover {
  position: relative;
  flex-shrink: 0;          /* 防止被 flex 压扁 */
  line-height: 0;          /* 去掉 img 下方基线间隙 */
}

.video .cover img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}

/* 遮罩：现在是 img 的兄弟，盖在图片底部 */
.video .img-interface {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40px;                                   /* 9px 太薄，只能当一条黑线 */
  border-radius: 0 0 6px 6px;                     /* 跟图片下圆角对齐，否则方角露出来 */
  background: linear-gradient(to top, rgb(0 0 0 / 0.69), rgb(0 0 0 / 0));
  pointer-events: none;                           /* 不挡鼠标事件 */
}

.video .iconfont {
  position: absolute;
  left: 6px;
  bottom: 15px;
  margin: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .4);
}

.video .cover-text {
  position: absolute;
  left: 24px;
  bottom: 15px;
  margin: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .4);
  pointer-events: none;
}

.video .cover-time{
  position: absolute;
  right: 8px;
  bottom: 15px;
  margin: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .4);
  pointer-events: none;
}

/* 3. 基础容器与 B 站字体栈 */
.video a {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
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