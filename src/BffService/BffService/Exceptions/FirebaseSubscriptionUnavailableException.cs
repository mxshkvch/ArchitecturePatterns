namespace BffService.Exceptions;

public sealed class FirebaseSubscriptionUnavailableException : Exception
{
    public FirebaseSubscriptionUnavailableException(string message)
        : base(message)
    {
    }

    public FirebaseSubscriptionUnavailableException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
