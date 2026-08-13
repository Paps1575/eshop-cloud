import axios from 'axios'

const catalogApi = axios.create({
  baseURL: import.meta.env.VITE_CATALOG_URL,
})

const basketApi = axios.create({
  baseURL: import.meta.env.VITE_BASKET_URL || 'https://basket-api-b1ub.onrender.com',
})

const orderingApi = axios.create({
  baseURL: import.meta.env.VITE_ORDERING_URL || 'http://localhost:8083',
})

const ticketApi = axios.create({
  baseURL: import.meta.env.VITE_TICKET_URL || 'http://localhost:8084',
})

export async function getProducts() {
  const response = await catalogApi.get('/products')
  return response.data.data ?? []
}

export async function createProduct(product) {
  const response = await catalogApi.post('/products', product)
  return response.data
}

export async function getBasket(userName) {
  const response = await basketApi.get(`/basket/${userName}`)
  return response.data.cart
}

export async function saveBasket(cart) {
  // Basket.API espera el carrito dentro de la propiedad "cart".
  const response = await basketApi.post('/basket', { cart })
  return response.data
}

export async function deleteBasket(userName) {
  const response = await basketApi.delete(`/basket/${userName}`)
  return response.data
}

export async function createOrder(customerId, basketId) {
  const response = await orderingApi.post(
    '/api/orders',
    { customerId, basketId },
    { headers: { 'Idempotency-Key': crypto.randomUUID() } },
  )

  return response.data
}

export function getOrderTicketUrl(orderId, mode = 'inline') {
  const path = mode === 'download' ? 'download' : 'pdf'
  return `${ticketApi.defaults.baseURL}/api/tickets/orders/${orderId}/${path}`
}

export async function downloadOrderTicket(orderId) {
  const response = await ticketApi.get(`/api/tickets/orders/${orderId}/download`, {
    responseType: 'blob',
  })

  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `orden-${orderId}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
