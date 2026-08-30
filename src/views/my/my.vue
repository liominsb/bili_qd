<script setup lang="ts">
import useUserStore from '../../store/user.ts'
import { NAvatar,NDivider } from 'naive-ui'
const userStore = useUserStore()

</script>

<template>
    <div class="bilibili-space-header">
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
          <div class="stat-item">
            <div class="stat-num">{{ userStore.followNum || 325 }}</div>
            <div class="stat-label">关注数</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ userStore.fansNum || 44 }}</div>
            <div class="stat-label">粉丝数</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ userStore.likeNum || 284 }}</div>
            <div class="stat-label">获赞数</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ userStore.playNum || '7.1万' }}</div>
            <div class="stat-label">播放数</div>
          </div>
        </div>
      </div>

      <n-divider style="margin-top: -16px;"/>
      <router-view></router-view>
    </div>
</template>

<style scoped>
/* 最外层容器 */
.bilibili-space-header {
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
.stat-item { text-align: center; }
.stat-num { font-size: 18px; font-weight: 600; color: #18191c; }
.stat-label { font-size: 12px; color: #9499a0; margin-top: 2px; }

/* 导航栏：分隔线保留，按钮高亮交给 naive 自己画 */
.nav-tab-bar {
  padding: 12px 24px;
  border-bottom: 1px solid #e3e5e7;
}
</style>
