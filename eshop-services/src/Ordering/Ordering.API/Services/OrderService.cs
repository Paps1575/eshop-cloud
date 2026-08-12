using Microsoft.Extensions.Options;
using Ordering.API.Clients;
using Ordering.API.Data;
using Ordering.API.Models;

namespace Ordering.API.Services;

public class OrderService(
    IBasketClient basketClient,
    IOrderRepository repository,
    IOptions<OrderingSettings> settings)
{
    public async Task<Order> CreateOrderAsync(
        CreateOrderRequest request,
        string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerId))
            throw new BadHttpRequestException("CustomerId is required.");

        if (string.IsNullOrWhiteSpace(request.BasketId))
            throw new BadHttpRequestException("BasketId is required.");

        if (string.IsNullOrWhiteSpace(idempotencyKey))
            throw new BadHttpRequestException("Idempotency-Key header is required.");

        var existingOrder = await repository.GetByIdempotencyKeyAsync(idempotencyKey, cancellationToken);
        if (existingOrder is not null)
            return existingOrder;

        var basket = await basketClient.GetBasketAsync(request.BasketId, cancellationToken);
        if (basket is null || basket.Items.Count == 0)
            throw new BadHttpRequestException("Basket must contain at least one item.");

        var items = basket.Items.Select(item =>
        {
            if (item.Quantity <= 0)
                throw new BadHttpRequestException("Item quantity must be greater than zero.");

            if (item.Price <= 0)
                throw new BadHttpRequestException("Item price must be greater than zero.");

            if (item.ProductId == Guid.Empty || string.IsNullOrWhiteSpace(item.ProductName))
                throw new BadHttpRequestException("Basket contains invalid product data.");

            return new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.Price,
                LineTotal = item.Price * item.Quantity
            };
        }).ToList();

        var subtotal = items.Sum(item => item.LineTotal);
        var tax = Math.Round(subtotal * settings.Value.TaxRate, 2);

        var order = new Order
        {
            CustomerId = request.CustomerId,
            BasketId = request.BasketId,
            CreatedAt = DateTime.UtcNow,
            Status = OrderStatuses.Pending,
            Items = items,
            Subtotal = subtotal,
            Tax = tax,
            Total = subtotal + tax,
            IdempotencyKey = idempotencyKey
        };

        await repository.CreateAsync(order, cancellationToken);
        return order;
    }

    public async Task<Order?> UpdateStatusAsync(string id, string status, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(status) || !OrderStatuses.All.Contains(status))
            throw new BadHttpRequestException("Invalid order status.");

        var order = await repository.GetByIdAsync(id, cancellationToken);
        if (order is null)
            return null;

        if (order.Status == OrderStatuses.Cancelled)
            throw new InvalidOperationException("Cancelled orders cannot change status.");

        if (order.Status == OrderStatuses.Confirmed && status != OrderStatuses.Confirmed)
            throw new InvalidOperationException("Confirmed orders cannot be moved to another status.");

        if (order.Status == OrderStatuses.Pending && status is not (OrderStatuses.Confirmed or OrderStatuses.Cancelled or OrderStatuses.Pending))
            throw new InvalidOperationException("Invalid status transition.");

        order.Status = status;
        await repository.UpdateAsync(order, cancellationToken);
        return order;
    }
}
