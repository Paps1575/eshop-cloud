# eShop Cloud

Solucion de microservicios con Catalog.API, Basket.API, Ordering.API, Ticket.API y frontend React.

## Servicios

- `Catalog.API`: administra el catalogo de productos con PostgreSQL y Marten.
- `Basket.API`: administra la cesta con PostgreSQL, Redis y cache distribuida.
- `Ordering.API`: genera ordenes de compra con ASP.NET Core Minimal API y MongoDB Atlas.
- `Ticket.API`: genera tickets PDF de ordenes usando una Minimal API propia.
- `eshop-frontend`: interfaz React/Vite desplegable en Netlify.

## Ordering.API

Endpoints principales:

- `POST /api/orders` crea una orden. Requiere header `Idempotency-Key`.
- `GET /api/orders/{id}` consulta una orden por id.
- `GET /api/orders/customer/{customerId}` lista ordenes por cliente.
- `PATCH /api/orders/{id}/status` cambia estado.
- `GET /health` health check.
- `/swagger` documentacion OpenAPI.

Estados soportados:

- `Pending`
- `Confirmed`
- `Cancelled`

Transiciones validas:

- `Pending -> Confirmed`
- `Pending -> Cancelled`

## Variables de entorno para Ordering.API

- `ConnectionStrings__Mongo`: connection string de MongoDB Atlas.
- `Mongo__DatabaseName`: base de datos, por ejemplo `OrderingDb`.
- `Mongo__OrdersCollection`: coleccion, por ejemplo `orders`.
- `Services__BasketUrl`: URL de Basket.API.
- `Cors__AllowedOrigins__0`: URL del frontend en Netlify.
- `Ordering__TaxRate`: impuesto, por defecto `0.16`.

## Ticket.API

Endpoints principales:

- `GET /api/tickets/orders/{orderId}/pdf` abre el ticket PDF en el navegador.
- `GET /api/tickets/orders/{orderId}/download` descarga el ticket PDF.
- `GET /health` health check.
- `/swagger` documentacion OpenAPI.

Variables de entorno:

- `Services__OrderingUrl`: URL publica de Ordering.API.
- `Cors__AllowedOrigins__0`: URL del frontend en Netlify.

## Variables de entorno del frontend

- `VITE_CATALOG_URL`: URL publica de Catalog.API.
- `VITE_BASKET_URL`: URL publica de Basket.API.
- `VITE_ORDERING_URL`: URL publica de Ordering.API.
- `VITE_TICKET_URL`: URL publica de Ticket.API.

## Ejecucion local

```powershell
cd eshop-services
docker compose up -d catalogdb basketdb redis mongodb
dotnet run --project src/Catalog.API/Catalog.API.csproj --urls "http://localhost:8080"
dotnet run --project src/Basket/Basket.API/Basket.API.csproj --urls "http://localhost:8082"
dotnet run --project src/Ordering/Ordering.API/Ordering.API.csproj --urls "http://localhost:8083"
dotnet run --project src/Ticket/Ticket.API/Ticket.API.csproj --urls "http://localhost:8084"
```

Frontend:

```powershell
cd eshop-frontend
npm install
npm run dev
```

## Pruebas minimas de Ordering.API

Crear orden valida:

```http
POST /api/orders
Idempotency-Key: demo-key-1
Content-Type: application/json

{
  "customerId": "cesar",
  "basketId": "cesar"
}
```

Cambiar estado:

```http
PATCH /api/orders/{id}/status
Content-Type: application/json

{
  "status": "Confirmed"
}
```

No se deben guardar secretos en el repositorio. Todas las cadenas sensibles se configuran en Render, Netlify, Neon, MongoDB Atlas y Upstash.
