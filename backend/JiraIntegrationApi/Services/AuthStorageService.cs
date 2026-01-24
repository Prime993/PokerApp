namespace JiraIntegrationApi.Services
{
    public class AuthStorageService
    {
        private readonly AuthCryptoService _crypto;
        private readonly string _filePath;
        private readonly object _sync = new();

        public AuthStorageService(AuthCryptoService crypto)
        {
            _crypto = crypto;
            _filePath = Path.Combine(AppContext.BaseDirectory, "AppData", "jira-auth.json");
            Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
        }

        public bool HasCredentials()
        {
            lock (_sync)
                return File.Exists(_filePath);
        }

        public void Save(string email, string apiToken)
        {
            var encrypted = _crypto.EncryptCredentials(email, apiToken);

            lock (_sync)
            {
                var tmp = _filePath + ".tmp";
                File.WriteAllText(tmp, encrypted);

                if (File.Exists(_filePath))
                    File.Replace(tmp, _filePath, null);
                else
                    File.Move(tmp, _filePath);
            }
        }

        public bool TryLoad(out string email, out string apiToken)
        {
            email = "";
            apiToken = "";

            if (!HasCredentials()) return false;

            try
            {
                var encrypted = File.ReadAllText(_filePath);
                var data = _crypto.DecryptCredentials(encrypted);
                email = data.Email;
                apiToken = data.ApiToken;
                return true;
            }
            catch
            {
                return false;
            }
        }



        public void Clear()
        {
            lock (_sync)
            {
                if (File.Exists(_filePath))
                {
                    try { File.Delete(_filePath); }
                    catch {  }
                }
            }
        }
    }
}
