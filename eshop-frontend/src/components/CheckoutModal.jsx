function CheckoutModal({ error, isOpen, isSubmitting, onClose, onConfirm, onUserNameChange, userName }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
        <div>
          <span className="modal-eyebrow">Checkout</span>
          <h2 id="checkout-title">Finalizar compra</h2>
          <p>Ingresa el usuario que quedara asociado a esta orden.</p>
        </div>

        <label>
          Usuario
          <input
            autoFocus
            value={userName}
            onChange={(event) => onUserNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onConfirm()
              }
            }}
            placeholder="Ej. cesar"
          />
        </label>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Confirmar orden'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default CheckoutModal
