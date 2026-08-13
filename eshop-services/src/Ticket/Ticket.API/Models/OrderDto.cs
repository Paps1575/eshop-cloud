namespace Ticket.API.Models;

public sealed record OrderDto(
    string Id,
    string CustomerId,
    string BasketId,
    DateTime CreatedAt,
    string Status,
    List<OrderItemDto> Items,
    decimal Subtotal,
    decimal Tax,
    decimal Total);

public sealed record OrderItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);
