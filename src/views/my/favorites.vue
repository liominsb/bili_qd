<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { getMyFavorites, unfavoriteVideo } from '../../api/favorite.ts'
import type { FavoriteItem } from '../../api/types.ts'
import VideoCard from '../../components/VideoCard.vue'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'

const message = useMessage()

const list = ref<FavoriteItem[]>([])
const offset = ref(0)          // 当前已加载到第几条，下一页从这里开始
const limit = 20
const loading = ref(false)     // 请求进行中，防止重复触发
const hasMore = ref(true)      // 后端还有没有更多数据

// 加载一页数据：offset 累加，结果拼到已有列表后面
async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const items = await getMyFavorites(offset.value, limit)
    list.value = list.value.concat(items)
    offset.value += items.length
    // 返回条数不足 limit，说明这是最后一页
    if (items.length < limit) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
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
})

onUnmounted(function () {
  window.removeEventListener('scroll', onScroll)
})

// 收藏时间：今天/昨天带时刻，更早的只到日期
function formatFavoriteTime(time: string) {
  const target = dayjs(time)
  const today = dayjs().startOf('day')
  if (target.isAfter(today)) return '今天 ' + target.format('HH:mm')
  if (target.isAfter(today.subtract(1, 'day'))) return '昨天 ' + target.format('HH:mm')
  return target.format('MM-DD HH:mm')
}

async function handleUnfavorite(videoId: number) {
  try {
    await unfavoriteVideo(videoId)
    list.value = list.value.filter(function (item) {
      return item.video_id !== videoId
    })
    offset.value--   // 本地少了一条，下一页的起点也要往前挪一格
    message.success('已取消收藏')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '取消失败')
  }
}
</script>

<template>
  <div class="favorites">
    <div class="favorites-head">
      <h2>我的收藏</h2>
    </div>

    <!-- 单循环走列表原顺序：有效视频渲染公共卡片，失效视频渲染页面自己的灰卡片。
         key 挂在 template 上，两个分支共用同一个 key（它们是同一行数据的两种形态） -->
    <template v-for="item in list" :key="item.video_id">
      <VideoCard
        v-if="!item.deleted_at"
        :video="item"
        :video-id="item.video_id"
        :time-text="'收藏于 ' + formatFavoriteTime(item.created_at)"
      >
        <!-- 取消收藏按钮放在链接外（#extra 以整张卡片为定位上下文） -->
        <template #extra>
          <button class="del-btn" title="取消收藏" @click.prevent.stop="handleUnfavorite(item.video_id)">×</button>
        </template>
      </VideoCard>

      <!-- 视频已失效：可取消收藏，但不可点进详情 -->
      <div v-else class="dead-card">
        <div class="dead-cover">
          <img :src="item.pic" :alt="item.title" />
          <div class="dead-mask">视频已失效</div>
        </div>
        <h4>{{ item.title }}</h4>
        <div class="dead-meta">
          <h5>稿件已删除</h5>
          <button class="dead-del" @click="handleUnfavorite(item.video_id)">取消收藏</button>
        </div>
      </div>
    </template>

    <div class="load-more">
      <p v-if="loading">加载中...</p>
      <p v-else-if="!hasMore && list.length">没有更多了</p>
      <div v-if="!loading && !list.length" class="empty">还没有收藏任何视频</div>
    </div>
  </div>
</template>

<style scoped>
/* 布局照 history：网格放卡片，列宽 264，能放几列放几列 */
.favorites {
  display: grid;
  grid-template-columns: repeat(auto-fill, 264px);
  gap: 20px;
  justify-content: start;
  padding: 20px 0;
}

.favorites-head {
  grid-column: 1 / -1;   /* 标题行横跨整个网格 */
  display: flex;
  align-items: center;
  padding-bottom: 6px;
  padding-right: 100px;
}

.favorites-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #18191c;
}

/* 卡片尺寸归页面管：收藏页列宽 264，卡片 264×220
   （.video 是 VideoCard 的根，根节点带父子两个 data-v，页面样式改得到） */
.video,
.dead-card {
  width: 264px;
  height: 220px;
}

/* 取消收藏按钮：悬停才出现，平时不打扰 */
.del-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, .6);
  color: #fff;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s ease;
}

.video:hover .del-btn {
  opacity: 1;
}

/* ===== 失效视频灰卡片（页面独有，不进 VideoCard 组件） ===== */
.dead-card {
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: not-allowed;   /* 明确告诉用户这块点不动 */
}

.dead-cover {
  position: relative;
  line-height: 0;        /* 去掉 img 下方基线间隙 */
}

.dead-cover img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-radius: 6px;
  filter: grayscale(1);  /* 封面灰度化，一眼看出失效 */
  opacity: .7;
}

.dead-mask {
  position: absolute;
  inset: 0;              /* 上下左右全贴上 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0, 0, 0, .45);
  color: #fff;
  font-size: 14px;
}

.dead-card h4 {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  max-height: 40px;      /* 锁定 2 行 */
  margin: 8px 0 0 0;
  flex-shrink: 0;
  color: #9499a0;        /* 标题也灰掉 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.dead-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;      /* 吸收多余空间沉底 */
  padding: 4px 0 0 0;
}

.dead-meta h5 {
  font-size: 12px;
  font-weight: 400;
  color: #9499a0;
  margin: 0;
}

.dead-del {
  border: 1px solid #e3e5e7;
  background: #fff;
  color: #61666d;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;       /* 盖掉父级的 not-allowed：这个按钮是可点的 */
  transition: all .2s ease;
}

.dead-del:hover {
  border-color: #00aeec;
  color: #00aeec;
}

.load-more {
  grid-column: 1 / -1;   /* 横跨整个网格的所有列 */
  text-align: center;
  padding: 16px 0;
  color: #9499a0;
  font-size: 14px;
}

.load-more .empty {
  color: #999;
}
</style>
