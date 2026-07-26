import { saveBasket } from '../services/api'

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
      onSaved('Cesta guardada correctamente en Basket.API.')
    } catch {
      onSaved('No se pudo guardar la cesta. Verifica que Basket.API este en http://localhost:8082.')
    }
  }

  return (
    <aside className="panel basket-panel">
      <div className="section-heading">
        <span>Basket.API</span>
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
        <span>TotalPrice</span>
        <strong>${totalPrice.toFixed(2)}</strong>
      </div>

      <div className="basket-actions">
        <button type="button" onClick={handleSaveBasket}>
          Guardar cesta
        </button>
        <button className="secondary" type="button" onClick={onClearBasket}>
          Vaciar
        </button>
      </div>
    </aside>
  )
}

export default Basket
