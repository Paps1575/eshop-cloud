import { useState } from 'react'
import CheckoutModal from './CheckoutModal'
import { createOrder, saveBasket } from '../services/api'

function Basket({ cart, onBackToCatalog, onQuantityChange, onRemoveItem, onClearBasket, onCheckoutSuccess, onSaved }) {
  const [pendingAction, setPendingAction] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutUserName, setCheckoutUserName] = useState('')
  const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
  const isBusy = Boolean(pendingAction)

  function handleOpenCheckout() {
    if (cart.items.length === 0) {
      onSaved('Agrega al menos un producto antes de realizar la compra.', 'error')
      return
    }

    setCheckoutError('')
    setIsCheckoutOpen(true)
  }

  async function handleConfirmCheckout() {
    const userName = checkoutUserName.trim()

    if (!userName) {
      setCheckoutError('El usuario es obligatorio para realizar la compra.')
      return
    }

    setPendingAction('checkout')

    try {
      await saveBasket({ ...cart, userName })
      const order = await createOrder(userName, userName)
      setCheckoutUserName('')
      setIsCheckoutOpen(false)
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
                {item.imageFile ? (
                  <img className="basket-item-image" src={item.imageFile} alt={item.productName} />
                ) : (
                  <div className="basket-item-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="basket-item-main">
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
              <button className="danger-link" type="button" onClick={() => onRemoveItem(item.productId)} disabled={isBusy}>
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
        <button className="checkout-button" type="button" onClick={handleOpenCheckout} disabled={isBusy}>
          Realizar compra
        </button>
        <button className="ghost" type="button" onClick={onClearBasket} disabled={isBusy}>
          Vaciar
        </button>
      </div>

      <CheckoutModal
        error={checkoutError}
        isOpen={isCheckoutOpen}
        isSubmitting={isBusy}
        onClose={() => {
          if (!isBusy) {
            setIsCheckoutOpen(false)
            setCheckoutError('')
          }
        }}
        onConfirm={handleConfirmCheckout}
        onUserNameChange={(value) => {
          setCheckoutUserName(value)
          setCheckoutError('')
        }}
        userName={checkoutUserName}
      />
    </section>
  )
}

export default Basket
