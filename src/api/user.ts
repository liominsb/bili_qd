import request from '../utils/request'
import type { User,psw } from './types'

export interface LoginReq {
    username: string
    password: string
}
export interface LoginRes {
    token: string
    refreshToken: string
}
export interface UserRes {
    user: User
}


// 响应拦截器已解包,返回的就是 LoginRes
export const login = (data: LoginReq) =>
    request.post<LoginReq , LoginRes>('/api/auth/login', data)

export const register = (data: LoginReq) =>
    request.post<LoginReq , LoginRes>('/api/auth/register', data)

export const refreshTokenFuncApi = (data: { access_token:string,refresh_token: string }) =>
    request.post<{ refreshToken: string }, LoginRes>('/api/auth/refreshTokens', data)

export const getMyUser = () =>
    request.get<any, UserRes>('/api/v1/users/me')

export const getUserProfileById = (id:number) =>
    request.get<any,UserRes>(`/api/v1/users/${id}`)

export const updateMyUser = (data: User) =>
    request.put<User, UserRes>('/api/v1/users/me', data)

export const updatePsw = (data: psw) =>
    request.put<psw, any>('/api/v1/users/me/psw', data)
