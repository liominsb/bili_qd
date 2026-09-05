<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFollowing } from '../../api/follow.ts'
import useUserStore from '../../store/user.ts'
import type { UserBrief } from '../../api/types.ts'

const userStore = useUserStore()
const list = ref<UserBrief[]>([])

onMounted(async function () {
    list.value = await getFollowing(userStore.id)
})
</script>

<template>
  <div class="follow-list">
    <div v-for="u in list" :key="u.id" class="follow-item">
      <n-avatar round :size="48" :src="u.image" />
      <div class="info">
        <span class="name">{{ u.username }}</span>
        <span class="bio">{{ u.bio }}</span>
      </div>
    </div>
    <div v-if="!list.length" class="empty">还没有关注任何人</div>
  </div>
</template>

<style scoped>
.follow-list { display: flex; flex-direction: column; gap: 16px; padding: 20px 0; }
.follow-item { display: flex; align-items: center; gap: 12px; }
.info { display: flex; flex-direction: column; gap: 4px; }
.name { font-size: 15px; font-weight: 600; }
.bio { font-size: 13px; color: #999; }
.empty { color: #999; }
</style>
