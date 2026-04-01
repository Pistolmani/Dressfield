using Dressfield.Application.DTOs;
using Dressfield.Application.Validators;
using FluentAssertions;

namespace Dressfield.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Validate_ShouldPass_ForValidRequest()
    {
        var request = new RegisterRequest(
            "Nika",
            "Beridze",
            "nika@example.com",
            "StrongPass1",
            "StrongPass1",
            "+995 599 123 456");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_ShouldFail_WhenRequiredFieldsMissing()
    {
        var request = new RegisterRequest(
            "",
            "",
            "",
            "",
            "",
            null);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Select(e => e.PropertyName).Should().Contain(["FirstName", "LastName", "Email", "Password"]);
    }

    [Fact]
    public void Validate_ShouldFail_WhenPasswordIsWeak()
    {
        var request = new RegisterRequest(
            "Nika",
            "Beridze",
            "nika@example.com",
            "password",
            "password",
            null);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Where(e => e.PropertyName == "Password").Should().NotBeEmpty();
    }
}
