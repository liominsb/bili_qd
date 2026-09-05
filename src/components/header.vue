<script setup lang="ts">
import {ref, onMounted, onUnmounted, h} from 'vue'
import {useRouter} from "vue-router";
import {NAvatar, NButton, NDropdown} from 'naive-ui'
import {useUiStore} from '../store/ui.ts'
import useUserStore from "../store/user.ts";
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
    router.push('/my/edit')
  } else if (key === 'logout') {
    store.logout()
  }
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
        <router-link to="/my/favorites" class="nav-item">
          <i class="iconfont icon-shoucang"></i>
          <span>收藏</span>
        </router-link>
        <router-link to="/my/history" class="nav-item">
          <i class="iconfont icon-zhongbiao"></i>
          <span>历史</span>
        </router-link>
        <button @click="pushupload" style="cursor: pointer;color: #e0e0e0; background-color: #fb7299; border: none; height: 34px;width: 90px;border-radius: 6px;">
          <i class="iconfont icon-tougaox" style="font-size: 16px; color: #e0e0e0"></i>
          投稿
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
  left: 90px;
  top: 80px;
  bottom: 8px;
  width: 170px;         /* 原图 220x105，等比缩放后约 81px 高 */
  pointer-events: none; /* 不挡 banner 点击 */
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
</style>