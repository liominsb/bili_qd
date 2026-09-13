<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tip = ref('正在登录，请稍候…')

onMounted(async function () {
  const error = route.query.error as string
  const token = route.query.token as string
  const refreshToken = route.query.refreshToken as string

  // 后端失败时只回传一句笼统的提示，具体原因在后端日志里
  if (error || !token || !refreshToken) {
    tip.value = error || '登录信息不完整，请重新登录'
    setTimeout(function () { router.replace('/') }, 1500)
    return
  }

  try {
    await userStore.loginWithTokens(token, refreshToken)
    router.replace('/')
  } catch (e) {
    tip.value = '登录失败，请重试'
    setTimeout(function () { router.replace('/') }, 1500)
  }
})
</script>

<template>
  <div class="oauth-callback">
    <p>{{ tip }}</p>
  </div>
</template>

<style scoped>
.oauth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #666;
  font-size: 14px;
}
</style>
