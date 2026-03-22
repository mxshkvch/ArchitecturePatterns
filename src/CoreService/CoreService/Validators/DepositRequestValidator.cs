using CoreService.DTOs.Requests;
using FluentValidation;

namespace CoreService.Validators;

public sealed class DepositRequestValidator : AbstractValidator<DepositRequest>
{
    public DepositRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Description).MaximumLength(300);
    }
}
