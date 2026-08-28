export interface ApiResponse<T = any> {
    code: number
    message: string
    ttl: number
    data: T
}

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