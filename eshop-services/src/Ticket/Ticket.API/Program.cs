using Ticket.API.Clients;
using Ticket.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<TicketPdfService>();

builder.Services.AddHttpClient<IOrderingClient, OrderingClient>(client =>
{
    var orderingUrl = builder.Configuration["Services:OrderingUrl"];
    if (string.IsNullOrWhiteSpace(orderingUrl))
        throw new InvalidOperationException("Ordering service URL is not configured.");

    client.BaseAddress = new Uri(orderingUrl);
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

var tickets = app.MapGroup("/api/tickets").WithTags("Tickets");

tickets.MapGet("/orders/{orderId}/pdf", async (
    string orderId,
    IOrderingClient orderingClient,
    TicketPdfService pdfService,
    CancellationToken cancellationToken) =>
{
    var order = await orderingClient.GetOrderAsync(orderId, cancellationToken);
    if (order is null)
        return Results.NotFound(new { title = "NotFound", detail = "Order was not found." });

    var pdf = pdfService.CreateOrderTicket(order);
    return Results.File(pdf, "application/pdf", enableRangeProcessing: true);
})
.WithName("ViewOrderTicketPdf")
.WithSummary("Generate an inline PDF ticket for an order")
.Produces(StatusCodes.Status200OK, contentType: "application/pdf")
.Produces(StatusCodes.Status404NotFound);

tickets.MapGet("/orders/{orderId}/download", async (
    string orderId,
    IOrderingClient orderingClient,
    TicketPdfService pdfService,
    CancellationToken cancellationToken) =>
{
    var order = await orderingClient.GetOrderAsync(orderId, cancellationToken);
    if (order is null)
        return Results.NotFound(new { title = "NotFound", detail = "Order was not found." });

    var pdf = pdfService.CreateOrderTicket(order);
    var result = Results.File(pdf, "application/pdf", $"orden-{order.Id}.pdf");
    return result;
})
.WithName("DownloadOrderTicketPdf")
.WithSummary("Download a PDF ticket for an order")
.Produces(StatusCodes.Status200OK, contentType: "application/pdf")
.Produces(StatusCodes.Status404NotFound);

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" })).WithTags("Health");

app.Run();
