using Catalog.API.Behaviors;
using Catalog.API.Exceptions;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);
//1
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddOpenBehavior(typeof(ValidationBehaviors<,>));
});
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddCarter();


//2
builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);
}).UseLightweightSessions();

//3
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        policy.SetIsOriginAllowed(origin =>
        {
            if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                return true;

            return
            Uri.TryCreate(origin, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
            && (uri.Host == "localhost" || uri.Host == "127.0.0.1");
        })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddExceptionHandler<CustomExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseCors("Frontend");

//utilizamos carter como parte de minimal api
app.MapCarter();
app.UseExceptionHandler(options => { });

app.Run();
