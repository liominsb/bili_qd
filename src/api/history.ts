import request from '../utils/request'
import type { HistoryItem } from './types'

// 上报播放进度，前端节流后调用
export async function reportHistory(videoId: number, progress: number) {
    return await request.put<any, { message: string }>(`/api/v1/videos/${videoId}/history`, { progress },{
        adapter: 'fetch',                  // 用 fetch 做底层（xhr 不支持 keepalive）
        fetchOptions: { keepalive: true }, // 页面卸载时也保证请求发得出去
    })
}

export async function getHistory(offset = 0, limit = 20): Promise<HistoryItem[]> {
    const res = await request.get<any, { history: HistoryItem[] }>('/api/v1/users/me/history', { params: { offset, limit } })
    return res.history
}

export async function deleteHistory(videoId: number) {
    return await request.delete<any, { message: string }>(`/api/v1/videos/${videoId}/history`)
}

export async function clearHistory() {
    return await request.delete<any, { message: string }>('/api/v1/users/me/history')
}
