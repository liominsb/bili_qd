import request from '../utils/request'
import type {VideoItem,VideoInput} from './types'


export async function getVideos(offset: number, limit: number): Promise<VideoItem[]> {
    const res = await request.get<any,{ videos: VideoItem[] }>('/api/v1/videos', { params: { offset: offset || 0, limit: limit || 20 } })
    return res.videos
}

export async function getVideoById(id: string): Promise<VideoItem> {
    const res = await request.get<any, { video: VideoItem }>(`/api/v1/videos/${id}`)
    return res.video
}

export async function addNewVideo(VideoInput: VideoInput) {
    return await request.post<any,{message:string}>('/api/v1/videos', VideoInput)
}

export async function updateVideo(VideoInput: VideoInput,id: string){
    return await request.put<any,{message:string}>(`/api/v1/videos/${id}`, VideoInput)
}

export async function deleteVideo(id: string) {
    return await request.delete<any,{message:string}>(`/api/v1/videos/${id}`)
}

export async function  searchVideoByTitle(title: string,offset?:number,limit?:number) {
    const res =await request.get<any,{ videos: VideoItem[] }>('/api/v1/videos/search', {params: {title: title,offset:offset,limit:limit}})
    return res.videos
}

export async function updateVideoLike(videoId:number) {
    return await request.put<any,{ok:boolean}>(`/api/v1/videos/${videoId}/like`)
}