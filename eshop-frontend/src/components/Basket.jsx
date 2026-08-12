import { createOrder, saveBasket } from '../services/api'

function Basket({ cart, userName, onQuantityChange, onClearBasket, onSaved }) {
  const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)

  async function handleSaveBasket() {
    if (!userName.trim()) {
      onSaved('Ingresa un usuario antes de guardar la cesta.')
      return
    }

    if (cart.items.length === 0) {
      onSaved('Agrega al menos un producto antes de guardar la cesta.')
      return
    }

    try {
      await saveBasket({ ...cart, userName })
      onSaved('Cesta guardada correctamente.')
    } catch {
      onSaved('No se pudo guardar la cesta. Intenta nuevamente en unos minutos.')
    }
  }

  async function handleCheckout() {
    if (!userName.trim()) {
      onSaved('Ingresa un usuario antes de realizar la compra.')
      return
    }

    if (cart.items.length === 0) {
      onSaved('Agrega al menos un producto antes de realizar la compra.')
      return
    }

    try {
      await saveBasket({ ...cart, userName })
      const order = await createOrder(userName, userName)
      onSaved(`Compra confirmada. Orden ${order.id} por $${Number(order.total).toFixed(2)}.`)
    } catch {
      onSaved('No se pudo generar la compra. Intenta nuevamente en unos minutos.')
    }
  }

  return (
    <aside className="panel basket-panel">
      <div className="section-heading">
        <span>Resumen</span>
        <h2>Cesta</h2>
      </div>

      {cart.items.length === 0 ? (
        <p className="message">Todavia no hay productos agregados.</p>
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
            </div>
          ))}
        </div>
      )}

      <div className="basket-total">
        <span>Total</span>
        <strong>${totalPrice.toFixed(2)}</strong>
      </div>

      <div className="basket-actions">
        <button type="button" onClick={handleSaveBasket}>
          Guardar cesta
        </button>
        <button type="button" onClick={handleCheckout}>
          Realizar compra
        </button>
        <button className="secondary" type="button" onClick={onClearBasket}>
          Vaciar
        </button>
      </div>
    </aside>
  )
}

export default Basket
