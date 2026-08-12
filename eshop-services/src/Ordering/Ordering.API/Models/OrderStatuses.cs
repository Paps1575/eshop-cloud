namespace Ordering.API.Models;

public static class OrderStatuses
{
    public const string Pending = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All = [Pending, Confirmed, Cancelled];
}
