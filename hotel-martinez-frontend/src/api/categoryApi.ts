import apiClient from './apiClient'

export type CategoryDto = {
  id: number
  name: string
}

export const categoryApi = {
  getAll: async (): Promise<CategoryDto[]> => {
    const response = await apiClient.get<CategoryDto[]>('/category/all')
    return response.data
  },
}