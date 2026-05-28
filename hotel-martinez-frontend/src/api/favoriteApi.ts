import apiClient from './apiClient'

export interface Favorite {
  id: number
  userId: number
  entityType: number
  entityId: number
}

export interface CreateFavoriteDTO {
  userId: number
  entityType: number
  entityId: number
}

export const favoriteApi = {
  getUserFavorites: async (userId: string): Promise<Favorite[]> => {
    const response = await apiClient.get<Favorite[]>(`/favorite/user/${userId}`)
    return response.data
  },

  addFavorite: async (data: CreateFavoriteDTO): Promise<Favorite> => {
    const response = await apiClient.post<Favorite>('/favorite', data)
    return response.data
  },

  removeFavorite: async (favoriteId: number): Promise<void> => {
    await apiClient.delete(`/favorite/${favoriteId}`)
  },
}
