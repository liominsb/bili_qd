import request from '../utils/request'
import type { ApiResponse } from './types'


// 1. 单个视频条目（仅保留所需字段）
export interface VideoItem {
    bvid: string
    title: string
    pic: string
    pubdate: number
    owner: {
        name: string
    }
    uri: string
}

// 2. 响应数据容器
export interface VideoFeedData {
    item: VideoItem[]
}
export function getVideoFeed(): Promise<ApiResponse<VideoFeedData>> {
    return request.get<any,ApiResponse<VideoFeedData>>('/api/v1/videos/feed')
}