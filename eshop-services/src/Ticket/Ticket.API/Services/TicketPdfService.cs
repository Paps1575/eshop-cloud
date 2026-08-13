using System.Globalization;
using System.Text;
using Ticket.API.Models;

namespace Ticket.API.Services;

public sealed class TicketPdfService
{
    private static readonly CultureInfo MoneyCulture = CultureInfo.GetCultureInfo("es-MX");

    public byte[] CreateOrderTicket(OrderDto order)
    {
        var lines = BuildLines(order);
        var content = BuildPageContent(lines);
        return BuildPdf(content);
    }

    private static List<string> BuildLines(OrderDto order)
    {
        var lines = new List<string>
        {
            "eShop Cloud",
            "Ticket de compra",
            $"Orden: {order.Id}",
            $"Cliente: {order.CustomerId}",
            $"Estado: {order.Status}",
            $"Fecha: {order.CreatedAt.ToLocalTime():dd/MM/yyyy HH:mm}",
            "",
            "Productos"
        };

        foreach (var item in order.Items)
        {
            lines.Add(TrimForPdf(item.ProductName, 74));
            lines.Add($"  Cantidad: {item.Quantity}  Unitario: {FormatMoney(item.UnitPrice)}  Importe: {FormatMoney(item.LineTotal)}");
        }

        lines.Add("");
        lines.Add($"Subtotal: {FormatMoney(order.Subtotal)}");
        lines.Add($"Impuesto: {FormatMoney(order.Tax)}");
        lines.Add($"Total: {FormatMoney(order.Total)}");
        lines.Add("");
        lines.Add("Gracias por tu compra.");

        return lines;
    }

    private static string BuildPageContent(List<string> lines)
    {
        var builder = new StringBuilder();
        builder.AppendLine("BT");
        builder.AppendLine("/F1 12 Tf");
        builder.AppendLine("14 TL");
        builder.AppendLine("50 790 Td");

        foreach (var line in lines)
        {
            builder.Append('(').Append(EscapePdfText(line)).AppendLine(") Tj");
            builder.AppendLine("T*");
        }

        builder.AppendLine("ET");
        return builder.ToString();
    }

    private static byte[] BuildPdf(string content)
    {
        var objects = new List<string>
        {
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
            "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        };

        var contentBytes = Encoding.UTF8.GetBytes(content);
        objects.Add($"5 0 obj\n<< /Length {contentBytes.Length} >>\nstream\n{content}\nendstream\nendobj\n");

        using var stream = new MemoryStream();
        WriteAscii(stream, "%PDF-1.4\n");

        var offsets = new List<long> { 0 };
        foreach (var pdfObject in objects)
        {
            offsets.Add(stream.Position);
            WriteAscii(stream, pdfObject);
        }

        var xrefOffset = stream.Position;
        WriteAscii(stream, $"xref\n0 {objects.Count + 1}\n");
        WriteAscii(stream, "0000000000 65535 f \n");

        for (var index = 1; index < offsets.Count; index++)
        {
            WriteAscii(stream, $"{offsets[index]:D10} 00000 n \n");
        }

        WriteAscii(stream, $"trailer\n<< /Size {objects.Count + 1} /Root 1 0 R >>\nstartxref\n{xrefOffset}\n%%EOF");
        return stream.ToArray();
    }

    private static string EscapePdfText(string value) =>
        value.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");

    private static string FormatMoney(decimal value) => value.ToString("C", MoneyCulture);

    private static string TrimForPdf(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];

    private static void WriteAscii(Stream stream, string value)
    {
        var bytes = Encoding.ASCII.GetBytes(value);
        stream.Write(bytes, 0, bytes.Length);
    }
}
