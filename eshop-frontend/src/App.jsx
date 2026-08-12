import { useState } from 'react'
import Basket from './components/Basket'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'

function App() {
  const [userName, setUserName] = useState('cesar')
  const [status, setStatus] = useState({ message: '', type: 'info' })
  const [refreshKey, setRefreshKey] = useState(0)
  const [cart, setCart] = useState({
    userName: 'cesar',
    items: [],
  })

  function showStatus(message, type = 'info') {
    setStatus({ message, type })
  }

  function handleAddToBasket(product) {
    showStatus('')
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
    showStatus('')
    setCart({ userName, items: [] })
  }

  function handleCheckoutSuccess(message) {
    showStatus(message, 'success')
    setCart({ userName, items: [] })
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <h1>eShop Cloud</h1>
          <p>Productos seleccionados con una experiencia de compra simple y segura.</p>
        </div>
        <label className="user-box">
          Cliente
          <input
            value={userName}
            onChange={(event) => {
              setUserName(event.target.value)
              setCart((currentCart) => ({ ...currentCart, userName: event.target.value }))
            }}
          />
        </label>
      </header>

      {status.message && <p className={`message ${status.type}`}>{status.message}</p>}

      <ProductForm
        onCreated={() => setRefreshKey((currentKey) => currentKey + 1)}
        onStatus={showStatus}
      />

      <div className="content-grid">
        <ProductList onAddToBasket={handleAddToBasket} refreshKey={refreshKey} />
        <Basket
          cart={{ ...cart, userName }}
          userName={userName}
          onQuantityChange={handleQuantityChange}
          onClearBasket={handleClearBasket}
          onCheckoutSuccess={handleCheckoutSuccess}
          onSaved={showStatus}
        />
      </div>
    </main>
  )
}

export default App
