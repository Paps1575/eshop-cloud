using MongoDB.Driver;
using Ordering.API.Clients;
using Ordering.API.Data;
using Ordering.API.Models;
using Ordering.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("Mongo"));
builder.Services.Configure<OrderingSettings>(builder.Configuration.GetSection("Ordering"));

builder.Services.AddSingleton<IMongoClient>(_ =>
{
    var connectionString = builder.Configuration.GetConnectionString("Mongo")
        ?? builder.Configuration["Mongo:ConnectionString"];

    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException("MongoDB connection string is not configured.");

    return new MongoClient(connectionString);
});

builder.Services.AddSingleton<IOrderRepository, MongoOrderRepository>();
builder.Services.AddScoped<OrderService>();

builder.Services.AddHttpClient<IBasketClient, BasketClient>(client =>
{
    var basketUrl = builder.Configuration["Services:BasketUrl"];
    if (string.IsNullOrWhiteSpace(basketUrl))
        throw new InvalidOperationException("Basket service URL is not configured.");

    client.BaseAddress = new Uri(basketUrl);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        policy.SetIsOriginAllowed(origin =>
        {
            if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                return true;

            return Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
                && (uri.Host == "localhost" || uri.Host == "127.0.0.1");
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("Frontend");
app.UseSwagger();
app.UseSwaggerUI();

var orders = app.MapGroup("/api/orders").WithTags("Orders");

orders.MapPost("/", async (
    CreateOrderRequest request,
    HttpContext httpContext,
    OrderService service,
    ILogger<Program> logger,
    CancellationToken cancellationToken) =>
{
    var idempotencyKey = httpContext.Request.Headers["Idempotency-Key"].FirstOrDefault();

    try
    {
        var order = await service.CreateOrderAsync(request, idempotencyKey, cancellationToken);
        var response = OrderResponse.From(order);
        return Results.Created($"/api/orders/{order.Id}", response);
    }
    catch (BadHttpRequestException ex)
    {
        return Results.BadRequest(new { title = "BadRequest", detail = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.Conflict(new { title = "Conflict", detail = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Unexpected error creating order");
        return Results.Problem("An unexpected error occurred while creating the order.");
    }
})
.WithName("CreateOrder")
.WithSummary("Create a purchase order from a basket")
.Produces<OrderResponse>(StatusCodes.Status201Created)
.ProducesProblem(StatusCodes.Status400BadRequest)
.ProducesProblem(StatusCodes.Status500InternalServerError);

orders.MapGet("/{id}", async (string id, IOrderRepository repository, CancellationToken cancellationToken) =>
{
    var order = await repository.GetByIdAsync(id, cancellationToken);
    return order is null ? Results.NotFound() : Results.Ok(OrderResponse.From(order));
})
.WithName("GetOrderById")
.WithSummary("Get an order by id")
.Produces<OrderResponse>()
.Produces(StatusCodes.Status404NotFound);

orders.MapGet("/customer/{customerId}", async (string customerId, IOrderRepository repository, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(customerId))
        return Results.BadRequest(new { title = "BadRequest", detail = "CustomerId is required." });

    var customerOrders = await repository.GetByCustomerIdAsync(customerId, cancellationToken);
    return Results.Ok(customerOrders.Select(OrderResponse.From));
})
.WithName("GetOrdersByCustomer")
.WithSummary("Get orders by customer id")
.Produces<IEnumerable<OrderResponse>>();

orders.MapPatch("/{id}/status", async (
    string id,
    UpdateOrderStatusRequest request,
    OrderService service,
    CancellationToken cancellationToken) =>
{
    try
    {
        var order = await service.UpdateStatusAsync(id, request.Status, cancellationToken);
        return order is null ? Results.NotFound() : Results.Ok(OrderResponse.From(order));
    }
    catch (BadHttpRequestException ex)
    {
        return Results.BadRequest(new { title = "BadRequest", detail = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Results.Conflict(new { title = "Conflict", detail = ex.Message });
    }
})
.WithName("UpdateOrderStatus")
.WithSummary("Update order status validating lifecycle transitions")
.Produces<OrderResponse>()
.ProducesProblem(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound)
.ProducesProblem(StatusCodes.Status409Conflict);

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" })).WithTags("Health");

app.Run();
