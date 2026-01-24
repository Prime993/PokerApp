using Microsoft.AspNetCore.DataProtection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class AuthCryptoService
{
    private readonly IDataProtector _protector;

    public AuthCryptoService(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("JiraCredentials");
    }

    public string EncryptCredentials(string email, string apiToken)
    {
        var json = JsonConvert.SerializeObject(new { email, apiToken });
        return _protector.Protect(json);
    }

    public (string Email, string ApiToken) DecryptCredentials(string encrypted)
    {
        var json = _protector.Unprotect(encrypted);
        var data = JObject.Parse(json);
        return (data["email"]!.ToString(), data["apiToken"]!.ToString());
    }
}
