using CreditService.Domain.Models;
using FluentValidation;

namespace CreditService.Validators;

public sealed class ApplyForCreditRequestValidator : AbstractValidator<ApplyForCreditRequest>
{
    public ApplyForCreditRequestValidator()
    {
        RuleFor(x => x.tariffId).NotEmpty();
        RuleFor(x => x.accountId).NotEmpty();
        RuleFor(x => x.amount).GreaterThan(0);
        RuleFor(x => x.term).GreaterThan(0);
    }
}
