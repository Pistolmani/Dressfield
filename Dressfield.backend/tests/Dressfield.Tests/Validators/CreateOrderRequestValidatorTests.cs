using Dressfield.Application.DTOs;
using Dressfield.Application.Validators;
using FluentAssertions;

namespace Dressfield.Tests.Validators;

public class CreateOrderRequestValidatorTests
{
    private readonly CreateOrderRequestValidator _validator = new();

    [Fact]
    public void Validate_ShouldFail_WhenItemsEmpty()
    {
        var request = new CreateOrderRequest(
            "Nika Beridze",
            "+995599123456",
            "nika@example.com",
            "Tbilisi",
            "Rustaveli 1",
            null,
            null,
            null,
            Array.Empty<CartItemRequest>());

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Select(e => e.PropertyName).Should().Contain("Items");
    }

    [Fact]
    public void Validate_ShouldPass_ForValidCart()
    {
        var request = new CreateOrderRequest(
            "Nika Beridze",
            "+995599123456",
            "nika@example.com",
            "Tbilisi",
            "Rustaveli 1",
            null,
            null,
            null,
            [new CartItemRequest(1, null, 2)]);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_ShouldFail_ForFieldLimits()
    {
        var request = new CreateOrderRequest(
            new string('a', 101),
            new string('5', 31),
            "invalid-email",
            new string('b', 101),
            new string('c', 201),
            null,
            null,
            null,
            [new CartItemRequest(1, null, 0)]);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
    }
}
