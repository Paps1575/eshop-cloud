import { useState } from 'react'
import { createProduct } from '../services/api'

const initialForm = {
  name: '',
  description: '',
  category: '',
  imageFile: '',
  price: '',
}

function ProductForm({ onCreated, onStatus }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(initialForm)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const price = Number(form.price)
    const categories = form.category
      .split(',')
      .map((category) => category.trim())
      .filter(Boolean)

    if (!form.name.trim() || !form.description.trim() || categories.length === 0 || !Number.isFinite(price) || price <= 0) {
      onStatus('Completa nombre, descripción, al menos una categoría y un precio mayor a cero.', 'error')
      return
    }

    setIsSaving(true)

    try {
      const product = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: categories,
        imageFile: form.imageFile.trim(),
        price,
      }

      const created = await createProduct(product)
      setForm(initialForm)
      setIsOpen(false)
      onStatus(`Producto creado correctamente. ID ${created.id}.`, 'success')
      onCreated()
    } catch {
      onStatus('No se pudo crear el producto. Revisa los datos e intenta nuevamente.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="panel product-form-panel">
      <div className="form-header">
        <div className="section-heading">
          <span>Administración</span>
          <h2>Productos</h2>
        </div>
        <button className="secondary" type="button" onClick={() => setIsOpen((current) => !current)}>
          {isOpen ? 'Cerrar' : 'Nuevo producto'}
        </button>
      </div>

      {isOpen && (
        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input name="name" value={form.name} onChange={handleChange} placeholder="Casco Touring Pro" />
          </label>

          <label>
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción corta del producto"
              rows="3"
            />
          </label>

          <div className="form-row">
            <label>
              Categorías
              <input name="category" value={form.category} onChange={handleChange} placeholder="Motos, Accesorios" />
            </label>
            <label>
              Precio
              <input min="0" name="price" step="0.01" type="number" value={form.price} onChange={handleChange} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Imagen URL
              <input name="imageFile" value={form.imageFile} onChange={handleChange} placeholder="https://..." />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Creando...' : 'Crear producto'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ProductForm
