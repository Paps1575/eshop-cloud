import { useState } from 'react'
import Basket from './components/Basket'
import ProductList from './components/ProductList'

function App() {
  const [userName, setUserName] = useState('cesar')
  const [status, setStatus] = useState('')
  const [cart, setCart] = useState({
    userName: 'cesar',
    items: [],
  })

  function handleAddToBasket(product) {
    setStatus('')
    setCart((currentCart) => {
      const existingItem = currentCart.items.find((item) => item.productId === product.id)

      if (existingItem) {
        return {
          ...currentCart,
          userName,
          items: currentCart.items.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }

      return {
        ...currentCart,
        userName,
        items: [
          ...currentCart.items,
          {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1,
            color: 'Default',
          },
        ],
      }
    })
  }

  function handleQuantityChange(productId, quantity) {
    const safeQuantity = Math.max(1, quantity || 1)

    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQuantity } : item,
      ),
    }))
  }

  function handleClearBasket() {
    setStatus('')
    setCart({ userName, items: [] })
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">React + Catalog.API + Basket.API</span>
          <h1>eShop Frontend</h1>
          <p>
            Flujo simple para el video: cargar productos, agregarlos a la cesta y guardar la cesta.
          </p>
        </div>
        <label className="user-box">
          Usuario de la cesta
          <input
            value={userName}
            onChange={(event) => {
              setUserName(event.target.value)
              setCart((currentCart) => ({ ...currentCart, userName: event.target.value }))
            }}
          />
        </label>
      </header>

      {status && <p className="message success">{status}</p>}

      <div className="content-grid">
        <ProductList onAddToBasket={handleAddToBasket} />
        <Basket
          cart={{ ...cart, userName }}
          userName={userName}
          onQuantityChange={handleQuantityChange}
          onClearBasket={handleClearBasket}
          onSaved={setStatus}
        />
      </div>
    </main>
  )
}

export default App
