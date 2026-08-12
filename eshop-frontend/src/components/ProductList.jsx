import { useEffect, useState } from 'react'
import { getProducts } from '../services/api'

function ProductList({ onAddToBasket, refreshKey }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getProducts()
        setProducts(data)
      } catch {
        setError('No se pudo cargar el catálogo de productos. Intenta nuevamente en unos minutos.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [refreshKey])

  if (isLoading) {
    return <p className="message info">Cargando productos...</p>
  }

  if (error) {
    return <p className="message error">{error}</p>
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <span>Colección</span>
        <h2>Catálogo</h2>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-image">
              {product.imageFile ? (
                <img src={product.imageFile} alt={product.name} />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="categories">
                {(product.category ?? []).map((category) => (
                  <span key={category}>{category}</span>
                ))}
              </div>
              <div className="product-footer">
                <strong>${Number(product.price).toFixed(2)}</strong>
              </div>
            </div>
            <button type="button" onClick={() => onAddToBasket(product)}>
              Agregar a la cesta
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProductList
