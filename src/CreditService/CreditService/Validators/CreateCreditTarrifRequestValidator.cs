using CreditService.Domain.Models;
using FluentValidation;

namespace CreditService.Validators;

public sealed class CreateCreditTarrifRequestValidator : AbstractValidator<CreateCreditTarrifRequest>
{
    public CreateCreditTarrifRequestValidator()
    {
        RuleFor(x => x.name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.interestRate).GreaterThan(0);
        RuleFor(x => x.minAmount).GreaterThan(0);
        RuleFor(x => x.maxAmount).GreaterThan(x => x.minAmount);
        RuleFor(x => x.minTerm).GreaterThan(0);
        RuleFor(x => x.maxTerm).GreaterThanOrEqualTo(x => x.minTerm);
    }
}
