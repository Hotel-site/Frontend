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

  create: async (name: string): Promise<void> => {
    await apiClient.post('/category', { name })
  },

  update: async (id: number, name: string): Promise<void> => {
    await apiClient.put(`/category/${id}`, { id, name, isActive: true })
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/category/${id}`)
  },
}