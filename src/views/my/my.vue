<script setup lang="ts">
import useUserStore from '../../store/user.ts'
import { NAvatar,NDivider } from 'naive-ui'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
const userStore = useUserStore()
const route = useRoute()

onMounted(async function () {
    await userStore.fetchFollowStats()
})
</script>

<template>
    <div class="bilibili-space-header" :class="{ 'profile-edit-space': route.path === '/my/edit' }">
      <!-- 顶部行：左头像昵称 + 右数据统计 并排 -->
      <div class="header-top-row">
        <div class="user-info-wrap">
          <n-avatar round class="avatar" :size="64" :src="userStore.image" />
          <div class="name-bio-box">
            <div class="name-line">
              <h1 class="username">{{ userStore.name }}</h1>
              <span class="level-tag">LV6</span>
              <span class="vip-tag">大会员</span>
            </div>
            <h4 class="bio">{{ userStore.bio }}</h4>
          </div>
        </div>

        <div class="data-stat-wrap">
          <router-link to="/my/following" class="stat-item">
            <div class="stat-num">{{ userStore.followNum }}</div>
            <div class="stat-label">关注数</div>
          </router-link>
          <router-link to="/my/followers" class="stat-item">
            <div class="stat-num">{{ userStore.fansNum }}</div>
            <div class="stat-label">粉丝数</div>
          </router-link>
        </div>
      </div>

      <n-divider class="space-divider"/>
      <router-view></router-view>
    </div>
</template>

<style scoped>
/* 最外层容器 */
.bilibili-space-header {
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
  font-family: system-ui, -apple-system, "Microsoft Yahei", sans-serif;
  padding-left: 100px;
}

/* 顶部行：左头像昵称 + 右数据统计 左右并排 */
.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

/* 头像+用户名 区域 */
.user-info-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar { flex-shrink: 0; }

.name-bio-box { display: flex; flex-direction: column; gap: 4px; }
.name-line { display: flex; align-items: center; gap: 8px; }

.username { font-size: 24px; font-weight: 600; margin: 0; }

/* B站LV等级标签 */
.level-tag {
  background: #fb7299; color: #fff; font-size: 12px;
  padding: 2px 6px; border-radius: 4px;
}
/* 大会员粉色标签 */
.vip-tag {
  background: #ff6699; color: #fff; font-size: 12px;
  padding: 2px 8px; border-radius: 4px;
}
.bio { font-size: 14px; color: #666; margin: 0; font-weight: normal; }

/* 右侧数据统计：横向排列 */
.data-stat-wrap { display: flex; align-items: center; gap: 28px; padding-right: 150px; }
.stat-item { text-align: center; text-decoration: none; color: inherit; cursor: pointer; }
.stat-num { font-size: 18px; font-weight: 600; color: #18191c; }
.stat-label { font-size: 12px; color: #9499a0; margin-top: 2px; }

/* 导航栏：分隔线保留，按钮高亮交给 naive 自己画 */
.nav-tab-bar {
  padding: 12px 24px;
  border-bottom: 1px solid #e3e5e7;
}

.space-divider {
  margin-top: -16px;
}

/* 资料设置页与表单共用居中的内容宽度。 */
.profile-edit-space {
  min-height: calc(100vh - 64px);
  padding: 32px 24px 56px;
  background: #f4f5f7;
}

.profile-edit-space .header-top-row {
  box-sizing: border-box;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 0 24px;
  gap: 24px;
}

.profile-edit-space .user-info-wrap {
  flex: 1;
  min-width: 0;
  gap: 16px;
}

.profile-edit-space .name-bio-box {
  min-width: 0;
  gap: 8px;
}

.profile-edit-space .name-line {
  flex-wrap: wrap;
}

.profile-edit-space .username,
.profile-edit-space .bio {
  overflow-wrap: anywhere;
}

.profile-edit-space .username {
  min-width: 0;
  line-height: 1.4;
}

.profile-edit-space .bio {
  color: #777d87;
  line-height: 1.6;
}

.profile-edit-space .level-tag,
.profile-edit-space .vip-tag {
  flex-shrink: 0;
}

.profile-edit-space .data-stat-wrap {
  flex-shrink: 0;
  gap: 32px;
  padding-right: 0;
}

.profile-edit-space .space-divider {
  max-width: 960px;
  margin: 0 auto 28px;
}

@media (max-width: 640px) {
  .profile-edit-space {
    padding: 24px 16px 36px;
  }

  .profile-edit-space .header-top-row {
    flex-wrap: wrap;
    gap: 20px;
    padding-bottom: 20px;
  }

  .profile-edit-space .user-info-wrap {
    flex-basis: 100%;
    align-items: flex-start;
    gap: 12px;
  }

  .profile-edit-space .username {
    font-size: 21px;
  }

  .profile-edit-space .data-stat-wrap {
    padding-left: 76px;
    gap: 28px;
  }

  .profile-edit-space .space-divider {
    margin-bottom: 24px;
  }
}
</style>
