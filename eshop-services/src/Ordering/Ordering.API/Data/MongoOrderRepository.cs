using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Ordering.API.Models;

namespace Ordering.API.Data;

public class MongoOrderRepository : IOrderRepository
{
    private readonly IMongoCollection<Order> _orders;

    public MongoOrderRepository(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _orders = database.GetCollection<Order>(settings.Value.OrdersCollection);
    }

    public async Task<Order?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        await _orders.Find(order => order.Id == id).FirstOrDefaultAsync(cancellationToken);

    public async Task<Order?> GetByIdempotencyKeyAsync(string idempotencyKey, CancellationToken cancellationToken) =>
        await _orders.Find(order => order.IdempotencyKey == idempotencyKey).FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyCollection<Order>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken) =>
        await _orders.Find(order => order.CustomerId == customerId)
            .SortByDescending(order => order.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task CreateAsync(Order order, CancellationToken cancellationToken) =>
        await _orders.InsertOneAsync(order, cancellationToken: cancellationToken);

    public async Task UpdateAsync(Order order, CancellationToken cancellationToken) =>
        await _orders.ReplaceOneAsync(existing => existing.Id == order.Id, order, cancellationToken: cancellationToken);
}
