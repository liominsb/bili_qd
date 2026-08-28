import { defineStore } from 'pinia'
import { ref } from 'vue'
import useUserStore from './user'

export const useUiStore = defineStore('ui', () => {
    const loginVisible = ref(false)

    const openLogin = () => {
        // 已经登录就不弹登录框；判登录态改读 userStore.isLogin（单一真相源）
        if (!useUserStore().isLogin) {
            loginVisible.value = true
        }
    }
    const closeLogin = () => (loginVisible.value = false)

    return { loginVisible, openLogin, closeLogin }
})
