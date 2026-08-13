import { useState } from 'react'
import { createOrder, saveBasket } from '../services/api'

function Basket({ cart, onBackToCatalog, onQuantityChange, onRemoveItem, onClearBasket, onGetCustomer, onCheckoutSuccess, onSaved }) {
  const [pendingAction, setPendingAction] = useState('')
  const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
  const isBusy = Boolean(pendingAction)

  async function handleCheckout() {
    if (cart.items.length === 0) {
      onSaved('Agrega al menos un producto antes de realizar la compra.', 'error')
      return
    }

    const userName = await onGetCustomer()
    if (!userName) {
      return
    }

    setPendingAction('checkout')

    try {
      await saveBasket({ ...cart, userName })
      const order = await createOrder(userName, userName)
      onCheckoutSuccess(order)
    } catch {
      onSaved('No se pudo generar la compra. Intenta nuevamente en unos minutos.', 'error')
    } finally {
      setPendingAction('')
    }
  }

  return (
    <section className="panel basket-panel cart-view">
      <div className="cart-view-header">
        <div className="section-heading">
          <span>Carrito</span>
          <h2>Tu carrito de compras</h2>
        </div>
        <button className="secondary" type="button" onClick={onBackToCatalog}>
          Volver al catálogo
        </button>
      </div>

      {cart.items.length === 0 ? (
        <p className="message info">Todavía no hay productos agregados.</p>
      ) : (
        <div className="basket-items">
          {cart.items.map((item) => (
            <div className="basket-item" key={item.productId}>
              <div>
                <h3>{item.productName}</h3>
                <p>${Number(item.price).toFixed(2)} por unidad</p>
              </div>
              <label>
                Cantidad
                <input
                  min="1"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => onQuantityChange(item.productId, Number(event.target.value))}
                />
              </label>
              <button className="ghost" type="button" onClick={() => onRemoveItem(item.productId)} disabled={isBusy}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="basket-total">
        <span>Total</span>
        <strong>${totalPrice.toFixed(2)}</strong>
      </div>

      <div className="basket-actions">
        <button className="checkout-button" type="button" onClick={handleCheckout} disabled={isBusy}>
          {pendingAction === 'checkout' ? 'Procesando...' : 'Realizar compra'}
        </button>
        <button className="ghost" type="button" onClick={onClearBasket} disabled={isBusy}>
          Vaciar
        </button>
      </div>
    </section>
  )
}

export default Basket
