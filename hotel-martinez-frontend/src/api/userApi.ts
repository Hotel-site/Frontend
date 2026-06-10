import apiClient from './apiClient'

export interface UserProfile {
  id: number
  username: string
  email: string
  isActive: boolean
  role?: string
}

export interface UserChangePasswordDTO {
  email: string
  password: string
}

export interface UserRegDTO {
  username: string
  email: string
  password: string
}

export interface UserCreateResponse {
  isSuccess: boolean
  message: string
  id?: number
}

export interface ResponseMsg {
  isSuccess: boolean
  message: string
}

export interface UserActivateDTO {
  id: number
  isActive: boolean
}

export const userApi = {
  getProfile: async (userId: number): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/user/${userId}`)
    return response.data
  },

  getAll: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get<UserProfile[]>('/user/all')
    return response.data
  },

  recoverPassword: async (userId: number, dto: UserChangePasswordDTO): Promise<ResponseMsg> => {
    const response = await apiClient.put<ResponseMsg>(`/user/password/recovery/${userId}`, dto)
    return response.data
  },

  create: async (dto: UserRegDTO): Promise<UserCreateResponse> => {
    const response = await apiClient.post<UserCreateResponse>('/user', dto)
    return response.data
  },

  update: async (id: number, dto: { username: string; email: string; isActive: boolean }): Promise<ResponseMsg> => {
    const response = await apiClient.put<ResponseMsg>(`/user/${id}`, dto)
    return response.data
  },

  activate: async (id: number, isActive: boolean): Promise<ResponseMsg> => {
    const response = await apiClient.put<ResponseMsg>(`/user/activate/${id}`, { isActive })
    return response.data
  },

  remove: async (id: number): Promise<ResponseMsg> => {
    const response = await apiClient.delete<ResponseMsg>(`/user/${id}`)
    return response.data
  },
}
