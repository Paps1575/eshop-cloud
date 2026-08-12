using System.Net;
using System.Text.Json;

namespace Ordering.API.Clients;

public interface IBasketClient
{
    Task<BasketDto?> GetBasketAsync(string userName, CancellationToken cancellationToken);
}

public class BasketClient(HttpClient httpClient, ILogger<BasketClient> logger) : IBasketClient
{
    public async Task<BasketDto?> GetBasketAsync(string userName, CancellationToken cancellationToken)
    {
        var response = await httpClient.GetAsync($"/basket/{Uri.EscapeDataString(userName)}", cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Basket service returned status {StatusCode}", response.StatusCode);
            throw new InvalidOperationException("Basket service is unavailable.");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var basketResponse = await JsonSerializer.DeserializeAsync<GetBasketResponseDto>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken);

        return basketResponse?.Cart;
    }
}

public record GetBasketResponseDto(BasketDto Cart);

public record BasketDto(string UserName, List<BasketItemDto> Items, decimal TotalPrice);

public record BasketItemDto(int Quantity, string Color, decimal Price, Guid ProductId, string ProductName);
