import apiClient from './apiClient'

export interface Favorite {
  id: number
  userId: number
  userName?: string
  entityType: number
  entityId: number
}

export interface CreateFavoriteDTO {
  userId: number
  entityType: number
  entityId: number
}

export const favoriteApi = {
  getUserFavorites: async (userId: number): Promise<Favorite[]> => {
    const response = await apiClient.get(`/favorite/user/${userId}`)
    const raw = response.data as any[]

    return raw.map((r) => {
      const id = Number(r.id)

      const userIdNum = r.userId != null ? Number(r.userId) : NaN

      // 1 -> Product, 2 -> Attraction
      let entityTypeNum: number
      if (typeof r.entityType === 'number') {
        entityTypeNum = r.entityType
      } else if (typeof r.entityType === 'string') {
        const t = r.entityType.toLowerCase()
        if (t.includes('product')) entityTypeNum = 1
        else if (t.includes('attract') || t.includes('local') || t.includes('guide')) entityTypeNum = 2
        else entityTypeNum = Number.NaN
      } else {
        entityTypeNum = Number.NaN
      }

      const entityIdNum = Number(r.entityId ?? r.itemId ?? r.productId ?? NaN)

      if (!Number.isFinite(entityIdNum) || Number.isNaN(entityTypeNum)) {
        console.debug('favoriteApi.getUserFavorites: unexpected favorite shape', r)
      }

      return {
        id: Number.isFinite(id) ? id : NaN,
        userId: userIdNum,
        userName: r.userName ?? r.username ?? undefined,
        entityType: entityTypeNum,
        entityId: entityIdNum,
      } as Favorite
    })
  },

  addFavorite: async (data: CreateFavoriteDTO): Promise<Favorite> => {
    const response = await apiClient.post<Favorite>('/favorite', data)
    return response.data
  },

  removeFavorite: async (favoriteId: number): Promise<void> => {
    await apiClient.delete(`/favorite/${favoriteId}`)
  },
}