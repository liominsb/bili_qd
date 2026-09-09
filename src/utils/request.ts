// src/utils/request.ts
import axios from 'axios'
import useUserStore from "../store/user.ts";

const request = axios.create({
    baseURL: '',
    timeout: 5000
})

let refreshingPromise: Promise<void> | null = null

// 请求拦截器：带上 token
request.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

request.interceptors.response.use(
    (r) => r.data,

    async (error) => {
        const isRefreshReq = error.config.url?.includes('/api/auth/refreshTokens')

        // 不是 401 / 已重试过 / 是刷新请求自己 → 直接报错（防刷新接口自己 401 又触发刷新）
        if (error.response?.status !== 401 || error.config._retry || isRefreshReq) {
            const data = error.response?.data
            const msg = data?.错误 ?? data?.error ?? data?.msg ?? error.message ?? '网络异常'
            return Promise.reject(new Error(msg))
        }

        error.config._retry = true
        try {
            if (!refreshingPromise) {
                refreshingPromise = useUserStore().refreshTokenFunc().finally(function () {
                    refreshingPromise = null
                })
            }
            await refreshingPromise
            return request(error.config)  // 刷新成功 → 重试原请求
        } catch {
            // 刷新也失败（refreshToken 过期/被踢）→ 清态跳登录
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(error)
        }
    }
)


export default request
