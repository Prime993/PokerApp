using JiraIntegrationApi.Models;

namespace JiraIntegrationApi.Services
{
    public class JiraSessionService
    {
        private readonly AuthStorageService _storage;
        private readonly HttpClient _httpClient;

        public JiraSessionService(AuthStorageService storage, HttpClient httpClient)
        {
            _storage = storage;
            _httpClient = httpClient;
        }

        // Ritorna le credenziali decriptate dal JSON (o null se non esistono).
        public Task<JiraLoginRequest?> GetCredentialsAsync()
        {
            if (!_storage.TryLoad(out var email, out var token))
                return Task.FromResult<JiraLoginRequest?>(null);

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
                return Task.FromResult<JiraLoginRequest?>(null);

            return Task.FromResult<JiraLoginRequest?>(new JiraLoginRequest
            {
                Email = email,
                ApiToken = token
            });
        }



        // True solo se esistono credenziali salvate e sono ancora valide su Jira.
        public async Task<bool> IsAuthenticatedAsync()
        {
            var creds = await GetCredentialsAsync();
            if (creds is null)
                return false;

            try
            {
                using var req = CreateBasicRequest(creds.Email, creds.ApiToken, "myself");
                using var res = await _httpClient.SendAsync(req);

                if (!res.IsSuccessStatusCode)
                {
                    _storage.Clear();
                    return false;
                }

                return true;
            }
            catch
            {
                _storage.Clear();
                return false;
            }
        }

        // Valida le credenziali contro Jira e se ok le salva (criptate) nel JSON.
        public async Task LoginAsync(string email, string apiToken)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(apiToken))
                throw new ArgumentException("Email e ApiToken sono obbligatori.");

            using var req = CreateBasicRequest(email, apiToken, "myself");
            using var res = await _httpClient.SendAsync(req);

            if (!res.IsSuccessStatusCode)
                throw new UnauthorizedAccessException("Invalid Jira credentials.");

            _storage.Save(email, apiToken);
        }

        public void Logout()
        {
            _storage.Clear();
        }

        private static HttpRequestMessage CreateBasicRequest(string email, string apiToken, string relativeUrl)
        {
            var raw = $"{email}:{apiToken}";
            var encoded = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes(raw));

            var req = new HttpRequestMessage(HttpMethod.Get, relativeUrl);
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", encoded);
            req.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            return req;
        }
    }
}

