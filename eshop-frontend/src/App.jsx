import { useState } from 'react'
import Basket from './components/Basket'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import { downloadOrderTicket, getOrderTicketUrl } from './services/api'
import { promptCustomerName, showAlert, showToast } from './services/alerts'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [view, setView] = useState('catalog')
  const [cart, setCart] = useState({
    userName: '',
    items: [],
  })

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  function notify(message, type = 'info') {
    if (!message) {
      return
    }

    if (type === 'success') {
      showToast(message, type)
      return
    }

    showAlert(message, type)
  }

  function handleAddToBasket(product) {
    showToast(`${product.name} agregado a la cesta.`, 'success')
    setCart((currentCart) => {
      const existingItem = currentCart.items.find((item) => item.productId === product.id)

      if (existingItem) {
        return {
          ...currentCart,
          items: currentCart.items.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }

      return {
        ...currentCart,
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

  function handleRemoveItem(productId) {
    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.filter((item) => item.productId !== productId),
    }))
  }

  function handleClearBasket() {
    setCart({ userName: '', items: [] })
    showToast('Cesta vaciada correctamente.', 'info')
  }

  async function handleCheckoutSuccess(order) {
    setCart({ userName: '', items: [] })
    setView('catalog')

    window.open(getOrderTicketUrl(order.id), '_blank', 'noopener,noreferrer')

    try {
      await downloadOrderTicket(order.id)
      showAlert('Tu orden fue generada correctamente. Abrimos el PDF en otra pestaña y tambien se descargo.', 'success', 'Compra confirmada')
    } catch {
      showAlert('Tu orden fue generada correctamente, pero no se pudo descargar el PDF automaticamente.', 'warning', 'Compra confirmada')
    }
  }

  async function handleGetCustomer() {
    const userName = await promptCustomerName()

    if (userName) {
      setCart((currentCart) => ({ ...currentCart, userName }))
    }

    return userName
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <h1>eShop Cloud</h1>
          <p>Agrega productos al carrito, revisa tu compra y genera tu ticket en PDF.</p>
        </div>
        <button className="cart-toggle" type="button" onClick={() => setView('cart')}>
          Ver carrito
          <span>{cartItemCount}</span>
        </button>
      </header>

      {view === 'catalog' ? (
        <>
          <ProductForm
            onCreated={() => setRefreshKey((currentKey) => currentKey + 1)}
            onStatus={notify}
          />
          <ProductList onAddToBasket={handleAddToBasket} refreshKey={refreshKey} />
        </>
      ) : (
        <Basket
          cart={cart}
          onBackToCatalog={() => setView('catalog')}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
          onClearBasket={handleClearBasket}
          onGetCustomer={handleGetCustomer}
          onCheckoutSuccess={handleCheckoutSuccess}
          onSaved={notify}
        />
      )}
    </main>
  )
}

export default App
