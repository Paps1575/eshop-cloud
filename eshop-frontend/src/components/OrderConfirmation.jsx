import { downloadOrderTicket, getOrderTicketUrl } from '../services/api'
import { showAlert } from '../services/alerts'

function OrderConfirmation({ order, onClose }) {
  if (!order) {
    return null
  }

  const createdAt = new Date(order.createdAt).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  function handleOpenPdf() {
    window.open(getOrderTicketUrl(order.id), '_blank', 'noopener,noreferrer')
  }

  async function handleDownloadPdf() {
    try {
      await downloadOrderTicket(order.id)
    } catch {
      showAlert('No se pudo descargar el ticket. Intenta nuevamente en unos minutos.', 'error')
    }
  }

  return (
    <section className="order-confirmation">
      <div className="order-card">
        <div className="order-header">
          <div>
            <span className="order-eyebrow">Compra confirmada</span>
            <h2>Orden generada correctamente</h2>
            <p>{order.id}</p>
          </div>
          <button className="ghost" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="order-meta">
          <div>
            <span>Cliente</span>
            <strong>{order.customerId}</strong>
          </div>
          <div>
            <span>Estado</span>
            <strong>{order.status}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>{createdAt}</strong>
          </div>
        </div>

        <div className="order-items">
          <h3>Productos comprados</h3>
          {order.items.map((item) => (
            <div className="order-item" key={item.productId}>
              <div>
                <strong>{item.productName}</strong>
                <span>Cantidad: {item.quantity}</span>
              </div>
              <div className="order-item-price">
                <span>${Number(item.unitPrice).toFixed(2)} c/u</span>
                <strong>${Number(item.lineTotal).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="order-totals">
          <div>
            <span>Subtotal</span>
            <strong>${Number(order.subtotal).toFixed(2)}</strong>
          </div>
          <div>
            <span>Impuesto</span>
            <strong>${Number(order.tax).toFixed(2)}</strong>
          </div>
          <div className="order-grand-total">
            <span>Total</span>
            <strong>${Number(order.total).toFixed(2)}</strong>
          </div>
        </div>

        <div className="order-actions">
          <button type="button" onClick={handleOpenPdf}>
            Ver / imprimir PDF
          </button>
          <button className="secondary" type="button" onClick={handleDownloadPdf}>
            Descargar PDF
          </button>
        </div>
      </div>
    </section>
  )
}

export default OrderConfirmation
