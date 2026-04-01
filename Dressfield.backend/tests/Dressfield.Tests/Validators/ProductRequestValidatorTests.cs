using Dressfield.Application.DTOs;
using Dressfield.Application.Validators;
using FluentAssertions;

namespace Dressfield.Tests.Validators;

public class ProductRequestValidatorTests
{
    private readonly CreateProductRequestValidator _createValidator = new();
    private readonly UpdateProductRequestValidator _updateValidator = new();

    [Fact]
    public void CreateValidator_ShouldFail_ForInvalidSlugNameAndPrice()
    {
        var request = new CreateProductRequest(
            "",
            "Bad Slug!",
            null,
            "desc",
            -1,
            null,
            true,
            false,
            [],
            []);

        var result = _createValidator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Select(e => e.PropertyName).Should().Contain(["Name", "Slug", "BasePrice"]);
    }

    [Fact]
    public void CreateValidator_ShouldPass_ForValidPayload()
    {
        var request = new CreateProductRequest(
            "Classic Tee",
            "classic-tee",
            "short",
            "full description",
            30,
            "SKU-1",
            true,
            false,
            [new CreateProductImageRequest("https://cdn/p.png", null, 0, true)],
            []);

        var result = _createValidator.Validate(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateValidator_ShouldFail_ForInvalidPayload()
    {
        var request = new UpdateProductRequest(
            "",
            "###",
            null,
            "",
            -2,
            null,
            true,
            false,
            [],
            []);

        var result = _updateValidator.Validate(request);

        result.IsValid.Should().BeFalse();
    }
}
