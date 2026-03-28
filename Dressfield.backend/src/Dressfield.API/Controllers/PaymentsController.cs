using Dressfield.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Dressfield.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IOrderService _orders;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IOrderService orders, ILogger<PaymentsController> logger)
    {
        _orders = orders;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/payments/callback?order_id={bogOrderId}
    /// BOG iPay calls this endpoint when the payment status changes.
    /// Must return 200 OK for BOG to consider the callback delivered.
    /// </summary>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery(Name = "order_id")] string? orderId)
    {
        if (string.IsNullOrWhiteSpace(orderId))
        {
            _logger.LogWarning("BOG callback received with missing order_id.");
            return Ok(); // still return 200 so BOG does not retry endlessly
        }

        _logger.LogInformation("BOG callback received for order {BogOrderId}", orderId);

        try
        {
            await _orders.HandlePaymentCallbackAsync(orderId);
        }
        catch (Exception ex)
        {
            // Log but swallow — BOG must receive 200 or it retries
            _logger.LogError(ex, "Error handling BOG callback for {BogOrderId}", orderId);
        }

        return Ok();
    }
}
