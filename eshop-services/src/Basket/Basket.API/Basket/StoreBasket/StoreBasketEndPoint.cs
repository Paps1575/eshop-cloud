using Basket.API.Models;
using Mapster;

namespace Basket.API.Basket.StoreBasket
{
    public class StoreBasketEndPoint
    {
        public record StoreBasketRequest(ShoppingCart Cart);

        public record StoreBasketResponse(string UserName);

        public class StoreBasketEndpoint : ICarterModule
        {
            public void AddRoutes(IEndpointRouteBuilder app)
            {
                app.MapPost("/basket", async (StoreBasketRequest request, ISender sender) =>
                {
                    var command = request.Adapt<StoreBasketCommand>();
                    var result = await sender.Send(command);
                    var response = result.Adapt<StoreBasketResponse>();
                    return Results.Created($"/basket/{response.UserName}", response);
                })
                .WithName("StoreBasket")
                .Produces<StoreBasketResponse>(StatusCodes.Status201Created)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .WithSummary("Crear o actualizar cesta")
                .WithDescription("Crea una nueva cesta o actualiza la cesta existente para el usuario indicado.");
            }
        }
    }
}
