using CoreService.DTOs.Requests;
using FluentValidation;

namespace CoreService.Validators;

public sealed class CreateAccountRequestValidator : AbstractValidator<CreateAccountRequest>
{
    public CreateAccountRequestValidator()
    {
        RuleFor(x => x.InitialDeposit).GreaterThanOrEqualTo(0);
    }
}
