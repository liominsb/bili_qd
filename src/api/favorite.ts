import request from '../utils/request'
import type { FavoriteItem, FavoriteStats } from './types'

// 收藏视频（PUT 幂等：重复收藏也返回成功）
export async function favoriteVideo(videoId: number) {
    return await request.put<any, { message: string }>(`/api/v1/videos/${videoId}/favorite`)
}

export async function unfavoriteVideo(videoId: number) {
    return await request.delete<any, { message: string }>(`/api/v1/videos/${videoId}/favorite`)
}

// 收藏数 + 是否已收藏（公开接口，未登录 is_favorite 恒为 false）
export async function getFavoriteStats(videoId: number): Promise<FavoriteStats> {
    const res = await request.get<any, { stats: FavoriteStats }>(`/api/v1/videos/${videoId}/favorite/stats`)
    return res.stats
}

// 我的收藏列表，分页同 history
export async function getMyFavorites(offset = 0, limit = 20): Promise<FavoriteItem[]> {
    const res = await request.get<any, { favorites: FavoriteItem[] }>('/api/v1/users/me/favorites', { params: { offset, limit } })
    return res.favorites
}
