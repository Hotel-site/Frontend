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

export const productApi = {
  getAll: async (): Promise<UiProduct[]> => {
    const response = await apiClient.get<ProductDto[]>('/product/all')
    return response.data.map(toUiProduct)
  },

  getById: async (id: number): Promise<UiProduct> => {
    const response = await apiClient.get<ProductDto>(`/product/${id}`)
    return toUiProduct(response.data)
  },
}