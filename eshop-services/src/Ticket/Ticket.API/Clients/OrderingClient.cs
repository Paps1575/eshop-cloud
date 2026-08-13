using System.Net;
using System.Text.Json;
using Ticket.API.Models;

namespace Ticket.API.Clients;

public interface IOrderingClient
{
    Task<OrderDto?> GetOrderAsync(string orderId, CancellationToken cancellationToken);
}

public sealed class OrderingClient(HttpClient httpClient, ILogger<OrderingClient> logger) : IOrderingClient
{
    public async Task<OrderDto?> GetOrderAsync(string orderId, CancellationToken cancellationToken)
    {
        var response = await httpClient.GetAsync($"/api/orders/{Uri.EscapeDataString(orderId)}", cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Ordering service returned status {StatusCode}", response.StatusCode);
            throw new InvalidOperationException("Ordering service is unavailable.");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonSerializer.DeserializeAsync<OrderDto>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken);
    }
}
