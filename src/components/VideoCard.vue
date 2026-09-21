<script setup lang="ts">
// 视频卡片组件：home / SearchResult / history 三处共用
// 只负责公共骨架（封面 + 标题 + 作者行）；页面独有的东西通过插槽自己加：
//   #cover → 渲染在封面内部（以 .cover 为定位上下文，如观看进度条）
//   #extra → 渲染在卡片根部、链接外面（以 .video 为定位上下文，如删除按钮）
import {formatDuration} from '../utils/format.ts'

// 卡片实际用到的字段。VideoItem 和 HistoryItem 都满足这个形状，
// TS 结构化类型：字段是它的超集就能传（跟 Go 的接口隐式实现一个思路）
interface CardVideo {
  pic: string
  title: string
  view_count: number
  duration: number
  author_name: string
}

defineProps<{
  video: CardVideo
  videoId: number    // 跳转用的 id：VideoItem 叫 id，HistoryItem 叫 video_id，页面自己传
  timeText: string   // 底部时间文本，页面算好格式再传（发布时间/观看时间各不相同）
}>()
</script>

<template>
  <div class="video">
    <router-link :to="`/video/${videoId}`">
      <div class="cover">
        <img :src="video.pic" :alt="video.title"/>
        <div class="img-interface"></div>
        <i class="iconfont icon-shipin1" style="color: #ffffff;"></i>
        <p class="cover-text">{{ video.view_count }}</p>
        <p class="cover-time">{{ formatDuration(video.duration) }}</p>
        <!-- 封面扩展位：贴封面定位（history 的观看进度条从这塞进来） -->
        <slot name="cover"></slot>
      </div>
      <h4>{{ video.title }}</h4>
      <div class="meta">
        <h5>{{ video.author_name }}</h5>
        <h5>· {{ timeText }}</h5>
      </div>
    </router-link>
    <!-- 根部扩展位：链接外面，以整张卡片为定位上下文（history 的删除按钮从这塞进来） -->
    <slot name="extra"></slot>
  </div>
</template>

<style scoped>
/* 卡片宽高不在这里定：那是页面网格布局的事。
   父页面 scoped 样式能作用到组件根元素（根节点同时带父子两个 data-v） */
.video {
  position: relative;   /* 根部扩展位里绝对定位元素的定位上下文 */
  width:333px;
  height:263px;
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

/* 封面底部渐变遮罩，让白色文字看得清 */
.video .img-interface {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40px;
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

.video .cover-time {
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

.video a {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

/* 标题：锁定 2 行高度，超出省略号 */
.video h4 {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  max-height: 40px;          /* 20px * 2行 = 40px */
  margin: 8px 0 0 0;
  flex-shrink: 0;            /* 禁止被 flex 容器挤压导致第二行下半部分被裁 */
  color: #18191c;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  transition: color 0.2s ease;
}

/* 底部作者与时间：贴底对齐 */
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
