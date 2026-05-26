import apiClient from './apiClient'

export interface Product {
  id: number
  name: string
  description: string
  categoryId: number
  price: number
  images: Array<{ url: string }>
  stock: number
  requireBooking: boolean
  productStatus: number
}

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/product/all')
    return response.data
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/product/${id}`)
    return response.data
  },
}
