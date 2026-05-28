import apiClient from './apiClient'

export interface UserProfile {
  id: number
  username: string
  email: string
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
}
