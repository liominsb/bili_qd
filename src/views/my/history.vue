<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { getHistory, deleteHistory, clearHistory } from '../../api/history.ts'
import type { HistoryItem } from '../../api/types.ts'
import VideoCard from '../../components/VideoCard.vue'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'

const message = useMessage()

const list = ref<HistoryItem[]>([])
const offset = ref(0)          // 当前已加载到第几条，下一页从这里开始
const limit = 20
const loading = ref(false)     // 请求进行中，防止重复触发
const hasMore = ref(true)      // 后端还有没有更多数据

// 加载一页数据：offset 累加，结果拼到已有列表后面
async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const items = await getHistory(offset.value, limit)
    list.value = list.value.concat(items)
    offset.value += items.length
    // 返回条数不足 limit，说明这是最后一页
    if (items.length < limit) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('获取播放历史失败:', error)
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

// 观看进度百分比（0~100），duration 缺失时算 0
function progressPercent(progress: number, duration: number) {
  if (!duration) return 0
  return Math.min(100, Math.round((progress / duration) * 100))
}

// 观看时间：今天/昨天显示成 "今天 HH:mm"，更早的显示 "MM-DD HH:mm"
function formatViewTime(time: string) {
  const target = dayjs(time)
  const today = dayjs().startOf('day')
  if (target.isAfter(today)) return '今天 ' + target.format('HH:mm')
  if (target.isAfter(today.subtract(1, 'day'))) return '昨天 ' + target.format('HH:mm')
  return target.format('MM-DD HH:mm')
}

async function handleDelete(videoId: number) {
  try {
    await deleteHistory(videoId)
    list.value = list.value.filter(function (item) {
      return item.video_id !== videoId
    })
    offset.value--   // 本地少了一条，下一页的起点也要往前挪一格
    message.success('已删除该记录')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '删除失败')
  }
}

async function handleClear() {
  try {
    await clearHistory()
    list.value = []
    offset.value = 0
    hasMore.value = false   // 列表已空，别再让滚动去请求
    message.success('已清空播放历史')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '清空失败')
  }
}
</script>

<template>
  <div class="history">
    <div class="history-head">
      <h2>播放历史</h2>
      <n-popconfirm v-if="list.length" @positive-click="handleClear">
        <template #trigger>
          <n-button size="small">清空历史</n-button>
        </template>
        确定清空全部播放历史吗？
      </n-popconfirm>
    </div>

    <VideoCard
      v-for="item in list"
      :key="item.video_id"
      :video="item"
      :video-id="item.video_id"
      :time-text="formatViewTime(item.updated_at)"
    >
      <!-- 页面独有的东西从插槽塞回卡片：进度条贴封面，删除按钮在链接外 -->
      <template #cover>
        <div class="progress-bar">
          <span :style="{ width: progressPercent(item.progress, item.duration) + '%' }"></span>
        </div>
      </template>
      <template #extra>
        <n-popconfirm
            @positive-click="handleDelete(item.video_id)"
            negative-text="取消"
            positive-text="确定"
        >
          <template #trigger>
            <n-button class="del-btn">×</n-button>
          </template>
          <p>确定要删除这条记录吗？</p>
        </n-popconfirm>
      </template>
    </VideoCard>

    <div class="load-more">
      <p v-if="loading">加载中...</p>
      <p v-else-if="!hasMore && list.length">没有更多了</p>
      <div v-if="!loading && !list.length" class="empty">还没有播放记录</div>
    </div>
  </div>
</template>

<style scoped>
.history {
  display: grid;
  grid-template-columns: repeat(auto-fill, 264px);  /* 卡片宽 264，能放几列放几列 */
  gap: 20px;
  justify-content: start;
  padding: 20px 0;
}

/* 标题行：横跨整个网格，左右两端对齐 */
.history-head {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
  padding-right: 100px;
}

.history-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #18191c;
}

/* 卡片尺寸归页面管：历史页列宽 264，卡片 264×220
   （组件根已带 position: relative，#extra 插槽里的删除按钮以它定位） */
.video {
  width: 264px;
  height: 220px;
}

/* 观看进度条：贴在封面最底部（经 #cover 插槽渲染进封面，
   插槽内容带的是本页面的 data-v，所以样式要定义在这里） */
.progress-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  pointer-events: none;
}

.progress-bar span {
  display: block;
  height: 100%;
  background: #00aeec;
  transition: width .2s ease;
}

/* 删除按钮：悬停才出现，平时不打扰 */
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
  background: rgb(255 255 255 / 0.56);
  color: #000000;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s ease;
}

.video:hover .del-btn {
  opacity: 1;
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
