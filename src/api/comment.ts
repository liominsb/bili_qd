import type {CommentInput,CommentItem} from "./types.ts";
import request from '../utils/request'

export async function addNewComments(commentInput: CommentInput,videoId: number) {
    return await request.post<any,{ message: string }>(`/api/v1/videos/${videoId}/comments`, commentInput)
}

export async function deleteCommentByID(id: number) {
    return await request.delete<any,{ message: string }>(`/api/v1/comments/${id}`)
}

export async function getCommentsByVideoId(videoId: number, offset?: number, limit?: number) {
    const res=await request.get<any,{comments:CommentItem[]}>(`/api/v1/videos/${videoId}/comments`, { params: { offset: offset || 0, limit: limit || 20 } })
    return res.comments
}

export async function updateComment(id: number, commentInput: CommentInput) {
    return await request.put<any,{ message: string }>(`/api/v1/comments/${id}`, commentInput)
}