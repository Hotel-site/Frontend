import apiClient from './apiClient'
import type { Room as UiRoom } from '../types/room'

export interface RoomDto {
  id: number
  name: string
  description: string
  amenities: string[]
  images: Array<{ url: string }>
  price: number
  status: number
}

const toImageUrls = (images: RoomDto['images']) => {
  if (!Array.isArray(images) || images.length === 0) {
    return []
  }

  const urls = images
    .map((image) => image?.url)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)

  return urls
}

const toUiRoom = (room: RoomDto): UiRoom => {
  return {
    id: room.id,
    title: room.name,
    description: room.description,
    price: room.price,
    images: toImageUrls(room.images),
    amenities: room.amenities ?? [],
    status: room.status,
  }
}

export const roomApi = {
  getAll: async (): Promise<UiRoom[]> => {
    const response = await apiClient.get<RoomDto[]>('/room/all')
    return response.data.map(toUiRoom)
  },

  getById: async (id: number): Promise<UiRoom> => {
    const response = await apiClient.get<RoomDto>(`/room/${id}`)
    return toUiRoom(response.data)
  },
}