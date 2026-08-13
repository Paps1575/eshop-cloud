FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/Ticket/Ticket.API/Ticket.API.csproj", "src/Ticket/Ticket.API/"]
RUN dotnet restore "src/Ticket/Ticket.API/Ticket.API.csproj"
COPY . .
RUN dotnet publish "src/Ticket/Ticket.API/Ticket.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Ticket.API.dll"]
