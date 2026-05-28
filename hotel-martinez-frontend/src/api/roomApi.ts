import apiClient from './apiClient'

export interface Room {
  id: number
  name: string
  description: string
  amenities: string[]
  images: Array<{ url: string }>
  price: number
  status: number
}

export const roomApi = {
  getAll: async (): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>('/room/all')
    return response.data
  },

  getById: async (id: number): Promise<Room> => {
    const response = await apiClient.get<Room>(`/room/${id}`)
    return response.data
  },
}
