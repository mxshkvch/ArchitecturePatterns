using CoreService.DTOs.Requests;
using FluentValidation;

namespace CoreService.Validators;

public sealed class WithdrawalRequestValidator : AbstractValidator<WithdrawalRequest>
{
    public WithdrawalRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Description).MaximumLength(300);
    }
}
