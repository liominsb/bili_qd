import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {login as loginApi, register as registerApi, getMyUser, updateMyUser, updatePsw, refreshTokenFuncApi} from '../api/user'
import { getFollowStats } from '../api/follow'
import type { User,psw } from '../api/types'

const useUserStore = defineStore('user', () => {
    // token 真相源是 localStorage，store 只是响应式镜像，初始化时读回来
    const token = ref(localStorage.getItem('token') || '')
    const refreshToken = ref(localStorage.getItem('refreshToken') || '')

    const id = ref(0)
    const name = ref('')
    const bio = ref('')
    const image = ref('')

    const followNum = ref(0)
    const fansNum = ref(0)

    const fetchFollowStats = async function () {
        if (!id.value) await fetchMe()   // 保底：没拉过资料先拉一次拿 id
        if (!id.value) return
        const stats = await getFollowStats(id.value)
        followNum.value = stats.following_count
        fansNum.value = stats.follower_count
    }

    // 模板里直接 v-if="userStore.isLogin"
    const isLogin = computed(() => !!token.value)

    // state 和 localStorage 一起写，杜绝不同步
    const setToken = (t: string, rt: string) => {
        token.value = t
        refreshToken.value = rt
        localStorage.setItem('token', t)
        localStorage.setItem('refreshToken', rt)
    }

    const setUser = (u: User) => {
        id.value = u.id
        name.value = u.username
        bio.value = u.bio
        image.value = u.image
    }

    // 拉当前登录用户资料：靠 token 认身份，不用传 id
    const fetchMe = async () => {
        if (!token.value) return
        const res = await getMyUser()
        setUser(res.user)          // 后端返回 gin.H{"user": user}，所以要 .user
    }

    const login = async (form: { username: string; password: string }) => {
        const res = await loginApi(form)
        setToken(res.token, res.refreshToken)
        await fetchMe()            // 登录成功立刻拉资料
        return res
    }

    const register = async (form: { username: string; password: string }) => {
        const res = await registerApi(form)
        setToken(res.token, res.refreshToken)
        await fetchMe()            // 注册成功立刻拉资料
        return res
    }

    const logout = () => {
        token.value = ''
        refreshToken.value = ''
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        id.value = 0
        name.value = ''
        bio.value = ''
        image.value = ''
        fansNum.value = 0
        followNum.value = 0
    }

    const updateMyUserinfo = async (data: User) => {
        await updateMyUser(data)
        setUser(data)
    }

    const updateMyPassword = async (data: psw) => {
        await updatePsw(data)
        logout()
    }

    const refreshTokenFunc = async () => {
        if (!localStorage.getItem('refreshToken')) return
        const res = await refreshTokenFuncApi({ access_token: localStorage.getItem('token')||'', refresh_token: localStorage.getItem('refreshToken')||'' })
        setToken(res.token, res.refreshToken)
    }

    const loginWithTokens = async function (t: string, rt: string) {
        setToken(t, rt)
        await fetchMe()
    }

    return { token, refreshToken, id, name, bio, image, followNum, fansNum, isLogin, login, fetchMe, logout,register, updateMyUserinfo, updateMyPassword,refreshTokenFunc, fetchFollowStats,loginWithTokens }
})

export default useUserStore
