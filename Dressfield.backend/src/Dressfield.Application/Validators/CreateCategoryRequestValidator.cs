using Dressfield.Application.DTOs;
using FluentValidation;

namespace Dressfield.Application.Validators;

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("კატეგორიის სახელი აუცილებელია")
            .MaximumLength(100).WithMessage("კატეგორიის სახელი მაქსიმუმ 100 სიმბოლოა");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug აუცილებელია")
            .MaximumLength(120).WithMessage("Slug მაქსიმუმ 120 სიმბოლოა")
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug უნდა შეიცავდეს მხოლოდ პატარა ლათინურ ასოებს, ციფრებს და ტირეებს");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("აღწერა მაქსიმუმ 500 სიმბოლოა");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("დალაგების რიგი ვერ იქნება უარყოფითი");
    }
}
