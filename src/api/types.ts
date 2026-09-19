export interface User {
    id:number
    username:string
    password:string
    bio     :string
    image   :string
}

export interface psw {
    old_password:string
    new_password:string
}

export interface VideoItem {
    id: number
    title: string
    pic: string
    created_at: string
    author_id : number
    video_url: string
    like_count : number
    author_name: string
    author_image: string
    author_bio: string
    duration : number
    view_count : number
}

export interface VideoInput {
    title: string
    pic: string
    video_url: string
    duration : number
}

export interface CommentItem {
    id: number
    video_id: number
    author_id: number
    parent_id: number | null
    content: string
    created_at: string
    like_count: number
    author_name: string
    author_image: string
}

export interface CommentInput {
    content: string
    parent_id: number | null
}

export interface UserBrief {
    id: number
    username: string
    image: string
    bio: string
}

export interface FollowStats {
    following_count: number
    follower_count: number
    is_following: boolean
}

export interface HistoryItem {
    video_id: number
    progress: number
    updated_at: string
    title: string
    pic: string
    duration: number
    view_count: number
    author_id: number
    author_name: string
}