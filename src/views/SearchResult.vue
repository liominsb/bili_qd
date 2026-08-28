<!-- views/SearchResult.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()
const keyword = ref(route.query.q as string || '')
const results = ref<string[]>([])

async function fetchResults(kw: string) {
  // 调接口拿搜索结果
  // results.value = await api.search(kw)
  results.value = [kw,'结果1', '结果2', '结果3'] // 模拟搜索结果
}

watch(() => route.query.q, (newQ) => {
  keyword.value = newQ as string
  fetchResults(keyword.value)
}, { immediate: true })// 组件挂载时立即执行，支持刷新页面或直接访问链接时自动搜索
</script>

<template>
  <div class="search-result">
    <h2>搜索：{{ results.join(', ') }}</h2>
    <!-- 渲染结果列表 -->
  </div>
</template>