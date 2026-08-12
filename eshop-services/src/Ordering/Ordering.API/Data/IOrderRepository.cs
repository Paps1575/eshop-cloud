using Ordering.API.Models;

namespace Ordering.API.Data;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<Order?> GetByIdempotencyKeyAsync(string idempotencyKey, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<Order>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken);
    Task CreateAsync(Order order, CancellationToken cancellationToken);
    Task UpdateAsync(Order order, CancellationToken cancellationToken);
}
