import apiClient from './apiClient'

export interface UserProfile {
  id: number
  username: string
  email: string
  isActive: boolean
}

export interface UserChangePasswordDTO {
  email: string
  password: string
}

export interface ResponseMsg {
  isSuccess: boolean
  message: string
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
}
