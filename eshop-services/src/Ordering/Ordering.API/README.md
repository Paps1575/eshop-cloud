# Ordering.API

Microservicio de ordenes de compra construido con ASP.NET Core Minimal API y MongoDB Atlas.

## Endpoints

- `POST /api/orders` crea una orden desde una cesta existente. Requiere header `Idempotency-Key`.
- `GET /api/orders/{id}` consulta una orden por identificador.
- `GET /api/orders/customer/{customerId}` lista ordenes por cliente.
- `PATCH /api/orders/{id}/status` cambia estado validando transiciones.
- `GET /health` verifica disponibilidad del servicio.
- `/swagger` muestra documentacion OpenAPI.

## Variables de entorno

- `ConnectionStrings__Mongo`: connection string de MongoDB Atlas.
- `Mongo__DatabaseName`: nombre de la base, por ejemplo `OrderingDb`.
- `Mongo__OrdersCollection`: nombre de la coleccion, por ejemplo `orders`.
- `Services__BasketUrl`: URL publica o interna de Basket.API.
- `Cors__AllowedOrigins__0`: URL del frontend en Netlify.
- `Ordering__TaxRate`: impuesto aplicado, por defecto `0.16`.

## Estados

- `Pending`
- `Confirmed`
- `Cancelled`

Transiciones validas: `Pending -> Confirmed` y `Pending -> Cancelled`.
