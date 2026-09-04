import { defineStore } from 'pinia'
import { ref } from 'vue'
import useUserStore from './user'

export const useUiStore = defineStore('ui', () => {
    const loginVisible = ref(false)
    const bannerCollapsed = ref(false)

    const collapseBanner = () => (bannerCollapsed.value = true)
    const expandBanner   = () => (bannerCollapsed.value = false)
    const openLogin = () => {
        // 已经登录就不弹登录框；判登录态改读 userStore.isLogin（单一真相源）
        if (!useUserStore().isLogin) {
            loginVisible.value = true
        }
    }
    const closeLogin = () => (loginVisible.value = false)

    return { loginVisible, bannerCollapsed, openLogin, closeLogin, collapseBanner, expandBanner }
})

export default useUiStore