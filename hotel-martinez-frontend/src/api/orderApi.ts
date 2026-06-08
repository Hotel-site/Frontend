import apiClient from './apiClient'
import type { BookingData } from '../types/cart'

export interface OrderItemDTO {
  id: number
  orderId: number
  type: number
  itemId: number
  quantity: number
  priceAtPurchase: number
  createdAt: string
}

export interface CartItemReq {
  userId: number
  item: OrderItemDTO
  price: number
  bookingData?: BookingData
}

export interface QuantityReq {
  quantity: number
}

export interface Order {
  id: number
  userId: number
  items: OrderItemDTO[]
  totalPrice: number
  status: number
  createdAt: string
}

export const orderApi = {
  getUserCart: async (userId: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/order/${userId}`)
    return response.data
  },

  getOrderHistory: async (userId: number): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/order/history/${userId}`)
    return response.data
  },

  addToCart: async (userId: number, item: OrderItemDTO, price: number, bookingData?: BookingData): Promise<void> => {
    await apiClient.post('/order/cart/add', {
      userId,
      item,
      price,
      ...(bookingData ? { bookingData } : {}),
    })
  },

  updateCartItemQuantity: async (itemId: number, quantity: number): Promise<void> => {
    await apiClient.put(`/order/cart/item/${itemId}/quantity`, {
      quantity,
    })
  },

  removeFromCart: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/order/cart/item/${itemId}`)
  },

  checkout: async (userId: number): Promise<{ isSuccess: boolean; message: string }> => {
    const response = await apiClient.post<{ isSuccess: boolean; message: string }>(`/order/checkout/${userId}`)
    return response.data
  },
}