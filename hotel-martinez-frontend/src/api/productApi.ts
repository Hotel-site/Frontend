import apiClient from './apiClient'
import type { HotelCategory, Product as UiProduct } from '../types/product'

type ProductImageDto = {
  url: string
}

// DTO coming from backend 
export type ProductDto = {
  id: number
  name: string
  description?: string | null
  category: HotelCategory
  price: number
  images?: ProductImageDto[] | null
  stock: number
  requireBooking: boolean
  status: number
}

const toImageList = (dto: ProductDto): string[] => {
  const raw = dto.images
  if (!raw || !Array.isArray(raw)) return []

  return raw
    .map((x) => x?.url)
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
}

const toUiProduct = (dto: ProductDto): UiProduct => {
  const images = toImageList(dto)
  const image = images[0] ?? '/martinez-logo-placeholder.svg'

  return {
    id: dto.id,
    title: dto.name,
    price: dto.price,
    image,
    images: images.length ? images : undefined,
    category: dto.category,
    description: dto.description || undefined,
    requiresBooking: dto.requireBooking,
  }
}

type CreateProductPayload = {
  name: string
  description?: string | null
  categoryId?: number | null
  price: number
  images?: { url: string }[]
  stock: number
  requireBooking: boolean
}

type UpdateProductPayload = {
  id: number
  name?: string | null
  description?: string | null
  categoryId?: number | null
  price: number
  images?: { url: string }[]
  stock: number
  requireBooking: boolean
  status?: number
}

const toCreatePayload = (ui: UiProduct): CreateProductPayload => {
  // Check if we have a categoryId stored on the UI object (admin panel use case)
  const categoryId = (ui as any).categoryId ?? null
  
  return {
    name: ui.title,
    description: ui.description ?? null,
    categoryId: categoryId,
    price: ui.price,
    images: (ui.images ?? []).map((url) => ({ url })),
    stock: 999,
    requireBooking: Boolean(ui.requiresBooking),
  }
}

const toUpdatePayload = (id: number, ui: UiProduct): UpdateProductPayload => {
  const categoryId = (ui as any).categoryId ?? null
  
  return {
    id,
    name: ui.title,
    description: ui.description ?? null,
    categoryId: categoryId,
    price: ui.price,
    images: (ui.images ?? []).map((url) => ({ url })),
    stock: 999,
    requireBooking: Boolean(ui.requiresBooking),
    status: 1,
  }
}

export const productApi = {
  getAll: async (): Promise<UiProduct[]> => {
    const response = await apiClient.get<ProductDto[]>('/product/all')
    return response.data.map(toUiProduct)
  },

  getById: async (id: number): Promise<UiProduct> => {
    const response = await apiClient.get<ProductDto>(`/product/${id}`)
    return toUiProduct(response.data)
  },

  create: async (payload: UiProduct): Promise<void> => {
    await apiClient.post('/product', toCreatePayload(payload))
  },

  update: async (id: number, payload: UiProduct): Promise<void> => {
    await apiClient.put(`/product/${id}`, toUpdatePayload(id, payload))
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/product/${id}`)
  },
}