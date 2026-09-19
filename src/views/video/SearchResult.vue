<!-- views/SearchResult.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import {ref, watch} from 'vue'
import {searchVideoByTitle} from '../../api/video.ts'
import type {VideoItem} from '../../api/types.ts'
import {formatDuration, formatPubdate} from "../../utils/format.ts";


const route = useRoute()
const keyword = ref(route.query.q as string || '')
const results = ref<VideoItem[]>([])
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
      <!--      <router-link :to="{ name: 'video', params: { id: video.id } }">-->
      <router-link :to="`/video/${video.id}`">
        <div class="cover">
          <img :src="video.pic" :alt="video.title"/>
          <div class="img-interface"></div>
          <i class="iconfont icon-shipin1" style="color: #ffffff;"></i>
          <p class="cover-text">{{ video.view_count }}</p>
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
.search-result {
  display: grid;
  grid-template-columns: repeat(auto-fill, 333px);  /* 列宽=卡片宽，容器能放几列放几列 */
  gap: 20px;                                    /* 行距40 列距20，和原来一致 */
  justify-content: center;                           /* 整个网格在容器内居中 */
  padding: 40px 120px;
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