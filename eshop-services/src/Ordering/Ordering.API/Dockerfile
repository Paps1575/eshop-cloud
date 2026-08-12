FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Ordering/Ordering.API/Ordering.API.csproj", "src/Ordering/Ordering.API/"]
RUN dotnet restore "src/Ordering/Ordering.API/Ordering.API.csproj"

COPY . .
RUN dotnet publish "src/Ordering/Ordering.API/Ordering.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Ordering.API.dll"]
