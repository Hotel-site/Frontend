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

type CreateRoomPayload = {
  name: string
  description?: string | null
  amenities: string[]
  images: { url: string }[]
  price: number
  status?: number
}

type UpdateRoomPayload = {
  id: number
  name: string
  description?: string | null
  amenities: string[]
  images: { url: string }[]
  price: number
  status?: number
}

const toCreatePayload = (ui: UiRoom): CreateRoomPayload => {
  return {
    name: ui.title,
    description: ui.description ?? null,
    amenities: ui.amenities ?? [],
    images: (ui.images ?? []).map((url) => ({ url })),
    price: ui.price,
    status: 0,
  }
}

const toUpdatePayload = (ui: UiRoom): UpdateRoomPayload => {
  return {
    id: ui.id,
    name: ui.title,
    description: ui.description ?? null,
    amenities: ui.amenities ?? [],
    images: (ui.images ?? []).map((url) => ({ url })),
    price: ui.price,
    status: ui.status ?? 0,
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

  create: async (payload: UiRoom): Promise<void> => {
    await apiClient.post('/room', toCreatePayload(payload))
  },

  update: async (id: number, payload: UiRoom): Promise<void> => {
    await apiClient.put(`/room/${id}`, toUpdatePayload({ ...payload, id }))
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/room/${id}`)
  },
}
