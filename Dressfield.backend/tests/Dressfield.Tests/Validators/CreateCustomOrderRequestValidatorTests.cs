using Dressfield.Application.DTOs;
using Dressfield.Application.Validators;
using FluentAssertions;

namespace Dressfield.Tests.Validators;

public class CreateCustomOrderRequestValidatorTests
{
    private readonly CreateCustomOrderRequestValidator _validator = new();

    [Fact]
    public void Validate_ShouldFail_WhenDesignsMissing()
    {
        var request = new CreateCustomOrderRequest(
            null,
            "Nika",
            "+995599123456",
            "nika@example.com",
            10,
            null,
            Array.Empty<CreateCustomOrderDesignRequest>());

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Select(e => e.PropertyName).Should().Contain("Designs");
    }

    [Fact]
    public void Validate_ShouldFail_WhenContactInfoInvalid()
    {
        var request = new CreateCustomOrderRequest(
            null,
            "",
            "",
            "not-email",
            10,
            null,
            [new CreateCustomOrderDesignRequest("https://cdn/design.png", null, null, null, null, null, null, null, 0)]);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Select(e => e.PropertyName).Should().Contain(["ContactName", "ContactPhone", "ContactEmail"]);
    }

    [Fact]
    public void Validate_ShouldPass_ForValidPayload()
    {
        var request = new CreateCustomOrderRequest(
            1,
            "Nika",
            "+995599123456",
            "nika@example.com",
            10,
            null,
            [new CreateCustomOrderDesignRequest("https://cdn/design.png", "front", "M", "#000000", 10, 10, 5, 5, 0)]);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
    }
}
