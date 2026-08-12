namespace Ordering.API.Models;

public class MongoSettings
{
    public string DatabaseName { get; set; } = "OrderingDb";
    public string OrdersCollection { get; set; } = "orders";
}

public class OrderingSettings
{
    public decimal TaxRate { get; set; } = 0.16m;
}
