using CoreService.DTOs.Requests;
using FluentValidation;

namespace CoreService.Validators;

public sealed class TransferRequestValidator : AbstractValidator<TransferRequest>
{
    public TransferRequestValidator()
    {
        RuleFor(x => x.amountMoney).GreaterThan(0);
    }
}
