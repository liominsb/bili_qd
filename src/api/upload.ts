import request from '../utils/request'

export interface Upload{

}


export async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)   // key 必须叫 'file'

    return request.post<any,{url:string}>('/upload', formData)
}

export async function getFile(url: string) {
    return request.get<string,any>(url)
}