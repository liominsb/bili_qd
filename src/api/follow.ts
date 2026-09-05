import request from '../utils/request'
import type { UserBrief, FollowStats } from './types'

export async function followUser(id: number) {
    return await request.put<any, { message: string }>(`/api/v1/users/${id}/follow`)
}

export async function unfollowUser(id: number) {
    return await request.delete<any, { message: string }>(`/api/v1/users/${id}/follow`)
}

export async function getFollowStats(id: number): Promise<FollowStats> {
    const res = await request.get<any, { stats: FollowStats }>(`/api/v1/users/${id}/follow/stats`)
    return res.stats
}

export async function getFollowers(id: number, offset = 0, limit = 20): Promise<UserBrief[]> {
    const res = await request.get<any, { users: UserBrief[] }>(`/api/v1/users/${id}/followers`, { params: { offset, limit } })
    return res.users
}

export async function getFollowing(id: number, offset = 0, limit = 20): Promise<UserBrief[]> {
    const res = await request.get<any, { users: UserBrief[] }>(`/api/v1/users/${id}/following`, { params: { offset, limit } })
    return res.users
}
