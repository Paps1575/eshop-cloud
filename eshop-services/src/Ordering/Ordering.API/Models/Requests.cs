namespace Ordering.API.Models;

public record CreateOrderRequest(string CustomerId, string BasketId);

public record UpdateOrderStatusRequest(string Status);

public record OrderResponse(
    string Id,
    string CustomerId,
    string BasketId,
    DateTime CreatedAt,
    string Status,
    IReadOnlyCollection<OrderItem> Items,
    decimal Subtotal,
    decimal Tax,
    decimal Total)
{
    public static OrderResponse From(Order order) => new(
        order.Id,
        order.CustomerId,
        order.BasketId,
        order.CreatedAt,
        order.Status,
        order.Items,
        order.Subtotal,
        order.Tax,
        order.Total);
}
