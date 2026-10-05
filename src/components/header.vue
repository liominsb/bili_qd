<script setup lang="ts">
import {ref, onMounted, onUnmounted, h} from 'vue'
import {useRouter} from "vue-router";
import {NAvatar, NButton, NDropdown} from 'naive-ui'
import {useUiStore} from '../store/ui.ts'
import useUserStore from "../store/user.ts";
import {formatDuration} from "../utils/format.ts";
import {getMyFavorites} from "../api/favorite.ts";
import {getHistory} from "../api/history.ts";
import type {FavoriteItem, HistoryItem} from "../api/types.ts";

const ui = useUiStore()
const store = useUserStore()
const isScrolled = ref(false)

const router = useRouter()
const searchInput = ref('')
function handleSearch() {
  const input = searchInput.value
  if(!input) return
  router.push({ name: 'Search', query: { q: input } })
}

function pushupload() {
  router.push({ name: 'upload' })
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  store.fetchMe()

})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)

})

const options = [
  {
    label: '编辑用户资料',
    key: 'editProfile',
    icon: () => h('i', { class: 'iconfont icon-edit' })
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h('i', { class: 'iconfont icon-tuichu' })
  }
]
function handleDropdownSelect (key:string) {
  if (key === 'profile') {
    ui.openLogin()
    router.push('/my')
  }  else if (key === 'editProfile') {
    router.push('/edit')
  } else if (key === 'logout') {
    void store.logoutFromServer()
  }
}

const videos = ref<FavoriteItem[] | null>(null)
async function favoriteVideosShow (show: boolean) {
  if (!show) return
  videos.value=(await getMyFavorites(0, 10))
}

const historyVideos = ref<HistoryItem[] | null>(null)
async function historyVideosShow(show: boolean) {
  if (!show) return
  historyVideos.value = await getHistory(0, 10)
}

</script>

<template>
  <div class="header-wrapper">
    <nav class="fixed-nav" :class="{ 'has-bg': isScrolled }">
      <div class="left">
        <i class="iconfont icon-bilibili-line" style="color: #e0e0e0;font-size: 24px;padding: 0"></i>
        <router-link to="/">首页</router-link>
      </div>
      <div class="search-box">
        <n-input type="text" placeholder="搜索关键词" v-model:value="searchInput"  @keydown.enter="handleSearch" :bordered="false" clearable />
        <i class="iconfont icon-sousuo" @click="handleSearch"></i>
      </div>
      <div class="right">
          <n-dropdown :options="options" @select="handleDropdownSelect">
            <n-button text color="#ffffff" @click="handleDropdownSelect('profile')">
              <n-avatar
                round
                :size="32"
                :src=store.image
              />
            </n-button>
          </n-dropdown>
        <router-link to="/my/news" class="nav-item">
          <i class="iconfont icon-xiaoxi"></i>
          <span>消息</span>
        </router-link>
        <router-link to="/my/trends" class="nav-item">
          <i class="iconfont icon-fengche"></i>
          <span>动态</span>
        </router-link>
        <n-popover
            trigger="hover"
            placement="bottom-end"
            :width="360"
            style="padding: 0; max-width: calc(100vw - 24px);"
            @update:show="favoriteVideosShow"
        >
          <template #trigger>
            <router-link to="/my/favorites" class="nav-item">
              <i class="iconfont icon-shoucang1"></i>
              <span>收藏</span>
            </router-link>
          </template>
          <n-card
              class="popover-panel"
              size="small"
              :bordered="false"
              content-style="padding: 0;"
          >
            <div class="popover-list">
              <div class="video-item" v-for="vid in videos" :key="vid.video_id">
                <router-link :to="`/video/${vid.video_id}`" class="card-link" v-if="!vid.deleted_at">
                  <div class="cover">
                    <img :src="vid.pic" alt="视频封面" />
                    <span class="cover-time">{{ formatDuration(vid.duration) }}</span>
                  </div>
                  <div class="video-info">
                    <h4 class="title">{{ vid.title }}</h4>
                    <div class="author">{{ vid.author_name }}</div>
                    <div class="meta">
                      <i class="iconfont icon-shipin1"></i>
                      <span>{{ vid.view_count }}</span>
                    </div>
                  </div>
                </router-link>
                <!-- 失效视频保留收藏信息，不跳转详情 -->
                <div v-else class="card-link dead-card">
                  <div class="cover dead-cover">
                    <img :src="vid.pic" :alt="vid.title" />
                    <div class="dead-mask">视频已失效</div>
                  </div>

                  <div class="video-info">
                    <h4 class="title">{{ vid.title }}</h4>
                    <div class="dead-meta">稿件已删除</div>
                  </div>
                </div>
              </div>
            </div>
            <router-link to="/my/favorites" class="popover-footer">查看全部</router-link>
          </n-card>
        </n-popover>
        <n-popover
            trigger="hover"
            placement="bottom-end"
            :width="360"
            style="padding: 0; max-width: calc(100vw - 24px);"
            @update:show="historyVideosShow"
        >
          <template #trigger>
            <router-link to="/my/history" class="nav-item">
              <i class="iconfont icon-zhongbiao"></i>
              <span>历史</span>
            </router-link>
          </template>
          <n-card
              class="popover-panel"
              size="small"
              :bordered="false"
              content-style="padding: 0;"
          >
            <div class="popover-list">
              <div class="video-item" v-for="vid in historyVideos" :key="vid.video_id">
                <router-link :to="`/video/${vid.video_id}`" class="card-link">
                  <div class="cover">
                    <img :src="vid.pic" alt="视频封面" />
                    <span class="cover-time">{{ formatDuration(vid.duration) }}</span>
                  </div>
                  <div class="video-info">
                    <h4 class="title">{{ vid.title }}</h4>
                    <div class="author">{{ vid.author_name }}</div>
                    <div class="meta">
                      <i class="iconfont icon-shipin1"></i>
                      <span>{{ vid.view_count }}</span>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
            <router-link to="/my/history" class="popover-footer">查看全部</router-link>
          </n-card>
        </n-popover>
        <button @click="pushupload" style="cursor: pointer;color: #ffffff; background-color: #fb7299; border: none; height: 34px;width: 90px;border-radius: 6px;">
          <i class="iconfont icon-tougaox" style="font-size: 16px; color: #ffffff;padding: 0 6px 0 0"></i>
          <span style="font-weight: 450">投稿</span>
        </button>
      </div>
    </nav>

    <div class="banner-box" :class="{ collapsed: ui.bannerCollapsed }">
      <img class="banner-image" src="../../img/h2.avif" alt="Header Image" />
      <img class="banner-logo" src="../../img/bilibili-logo.png" alt="" />
    </div>
  </div>
</template>

<style scoped>
.header-wrapper {
  position: relative;
  width: 100%;
}

.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 100;
  background-color: transparent;          /* 基础透明背景 */
  background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 100%
  );
  background-size: 100% 50px;            /* 只覆盖顶部 50px 高度 */
  background-repeat: no-repeat;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
}

.left ,.right {
  display: flex;
  flex: 1;
  align-items: center;
}

.left {

  font-size: 13px;
}

.right {

  justify-content: flex-end;
  gap: 14px;
}

.left .icon-bilibili-line {
  margin-right: -6px;
}

.fixed-nav a {
  padding: 8px;
  color: #ffffff;
  text-decoration: none;
  font-weight: bold;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 0 1 500px;
  height: 40px;
  max-width: 500px;
  margin: 0 20px;
  padding: 0 12px 0 0;        /* 👈 修改右边距为 12px，两端对称 */
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.search-box :deep(.n-input) {
  flex: 1;
  height: 100%;
  border: none;
  background-color: transparent;              /* 不聚焦：透明 */
  --n-placeholder-color: rgb(0 0 0 / 0.5) !important;
}


.search-box:hover,.search-box :deep(.n-input):hover{
  background-color: #ffffff;
}

.search-box:focus-within :deep(.n-input) {
  background-color: #ebebeb;       /* 灰色 */
  border-radius: 5px;              /* 圆角，灰块更柔和 */
  margin: 3px 4px;                 /* 四周内缩：上下3px、左右4px */
  height: calc(100% - 6px);        /* 高度扣掉上下 margin（3+3） */
}

.search-box:focus-within {
  background-color: #ffffff;      /* 聚焦后整条变白 */
}

/* 内部真正的 input 文字 */
.search-box :deep(.n-input__input-el) {
  font-size: 14px;
  color: #18191c;
  font-family: inherit;
}

.search-box .icon-sousuo {
  color: #18191c;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  font-size: 14px;
}

/* 滚动激活样式 */
.fixed-nav.has-bg {
  background-color: #ffffff;
  box-shadow: 0 2px 4px #00000014;
  background-image: none;
}
.fixed-nav.has-bg .search-box {
  background-color: #f0f0f0;     /* 与导航栏背景一致 */
  border-color: #e0e0e0;          /* 可选的边框颜色，更柔和 */
}

.fixed-nav.has-bg a {
  color: #333333;
  text-shadow: none;
}


.fixed-nav.has-bg .n-button {
  color: #333333;
}

.banner-box {
  position: relative;
  width: 100%;
  height: auto;
}

.banner-box .banner-image {
  width: 100%;
  display: block;
  object-fit: cover;
}

.banner-logo {
  position: absolute;
  left: 4.4%;
  top: 41.7%;
  width: 8.3%;
  pointer-events: none;
}

.banner-box.collapsed .banner-logo {
  display: none;
}


/* 详情页压缩 banner：高度归零并裁掉溢出，横幅完全收起 */
.banner-box.collapsed {
  height: 80px;
  overflow: hidden;
  position: relative;
}

i{
  color: #23ADE5;
  font-size: 27px;
}

:deep(.n-button) {
  font-weight: 600; /* 你想要的值，如 400、500、600、700 */
}

.right .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  font-size: 12px;           /* 调小文字字号 */
  line-height: 1.2;
}

/* 调小右侧导航栏图标大小（覆盖全局 i 的 27px） */
.right .nav-item .iconfont {
  font-size: 18px;           /* 图标尺寸 */
  margin-bottom: 3px;        /* 图标与文字间距 */
  color: #e0e0e0;
}

.banner-box.collapsed img {
  height: 60px;
  object-fit: cover;
}

/* 收藏和历史共用弹窗样式 */
.popover-panel {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.popover-list {
  padding: 8px;
  max-height: min(420px, calc(100vh - 144px));
  overflow-y: auto;
  overflow-x: hidden;
}

.popover-footer {
  display: block;
  padding: 12px;
  border-top: 1px solid #eee;
  color: #23ade5;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  text-decoration: none;
}

.video-item + .video-item {
  margin-top: 4px;
}

/* 视频条目：左侧封面，右侧信息 */
.card-link {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  color: #18191c;
  text-decoration: none;
  transition: background-color 0.15s;
}

a.card-link:hover,
.popover-footer:hover {
  background-color: #f1f2f3;
}

a.card-link:focus-visible,
.popover-footer:focus-visible {
  outline: 2px solid #23ade5;
  outline-offset: -2px;
}

.cover {
  position: relative;
  width: 128px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f1f2f3;
}

.cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-time {
  position: absolute;
  right: 4px;
  bottom: 4px;
  padding: 1px 4px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 12px;
  line-height: 14px;
  pointer-events: none;
}

.video-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0; /* 允许长标题和作者名截断 */
  height: 72px;
}

.video-info .title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: #18191c;
  white-space: normal;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.author,
.meta,
.dead-meta {
  font-size: 12px;
  line-height: 16px;
  color: #9499a0;
}

.author {
  margin-top: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta .iconfont {
  font-size: 12px;
  color: inherit;
}

/* 失效视频沿用条目布局，只改变显示状态 */
.dead-card {
  cursor: not-allowed;
}

.dead-cover img {
  filter: grayscale(1);
  opacity: 0.7;
}

.dead-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
}

.dead-card .title {
  color: #9499a0;
}

.dead-meta {
  margin-top: auto;
}
</style>
