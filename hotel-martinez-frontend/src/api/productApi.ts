import apiClient from './apiClient'
import type { HotelCategory, Product as UiProduct } from '../types/product'

// DTO coming from backend can be either camelCase or PascalCase depending on serializer.
export type ProductDto = {
  id?: number
  Id?: number
  name?: string
  Name?: string
  title?: string
  Title?: string
  description?: string | null
  Description?: string | null
  categoryId?: number
  CategoryId?: number
  price?: number
  Price?: number
  images?: Array<{ url?: string | null } | string> | null
  Images?: Array<{ url?: string | null } | string> | null
  image?: string | null
  Image?: string | null
  imageUrl?: string | null
  ImageUrl?: string | null
  unit?: string | null
  Unit?: string | null
  stock?: number
  Stock?: number
  requireBooking?: boolean
  RequireBooking?: boolean
  requiresBooking?: boolean
  RequiresBooking?: boolean
  productStatus?: number
  ProductStatus?: number
  status?: number
  Status?: number
}

const CATEGORY_BY_ID: Record<number, HotelCategory> = {
  1: 'SPA & Wellness',
  2: 'Рестораны',
  3: 'Трансфер',
  4: 'События',
  5: 'Мерч',
  // 6+: add when backend categories are defined
}

const toImageList = (dto: ProductDto): string[] => {
  const raw = dto.images ?? dto.Images
  if (!raw || !Array.isArray(raw)) return []

  return raw
    .map((x) => (typeof x === 'string' ? x : x?.url))
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
}

const toNumber = (value: unknown, fallback = 0) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : fallback
  return Number.isFinite(n) ? n : fallback
}

const toUiProduct = (dto: ProductDto): UiProduct => {
  const id = toNumber(dto.id ?? dto.Id, 0)
  const title = dto.title ?? dto.Title ?? dto.name ?? dto.Name ?? `Товар #${id}`
  const price = toNumber(dto.price ?? dto.Price, 0)

  const images = toImageList(dto)
  const image =
    dto.image ??
    dto.Image ??
    dto.imageUrl ??
    dto.ImageUrl ??
    images[0] ??
    '/martinez-logo-placeholder.svg'

  const categoryId = toNumber(dto.categoryId ?? dto.CategoryId, 0)
  const category = (categoryId ? CATEGORY_BY_ID[categoryId] : undefined) ?? 'Мерч'

  const requiresBooking =
    dto.requiresBooking ??
    dto.RequiresBooking ??
    dto.requireBooking ??
    dto.RequireBooking ??
    false

  return {
    id,
    title,
    price,
    image,
    images: images.length ? images : undefined,
    category,
    unit: dto.unit ?? dto.Unit ?? undefined,
    description: (dto.description ?? dto.Description ?? undefined) || undefined,
    requiresBooking,
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
