import axios from 'axios'

const catalogApi = axios.create({
  baseURL: import.meta.env.VITE_CATALOG_URL,
})

const basketApi = axios.create({
  baseURL: import.meta.env.VITE_BASKET_URL || 'https://basket-api-b1ub.onrender.com',
})

export async function getProducts() {
  const response = await catalogApi.get('/products')
  return response.data.data ?? []
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
