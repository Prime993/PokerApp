using System.Net.Http.Headers;
using System.Text;
using JiraIntegrationApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace JiraIntegrationApi.Services;

public class JiraService
{
    private readonly HttpClient _http;
    private readonly JiraSessionService _session;

    public JiraService(HttpClient http, JiraSessionService session)
    {
        _http = http;
        _session = session;
    }

    private async Task<HttpRequestMessage> CreateRequestAsync(HttpMethod method, string relativeUrl)
    {
        var creds = await _session.GetCredentialsAsync();
        if (creds is null || string.IsNullOrWhiteSpace(creds.Email) || string.IsNullOrWhiteSpace(creds.ApiToken))
            throw new UnauthorizedAccessException("Not authenticated (missing credentials in session).");

        var raw = $"{creds.Email}:{creds.ApiToken}";
        var encoded = Convert.ToBase64String(Encoding.ASCII.GetBytes(raw));

        var req = new HttpRequestMessage(method, relativeUrl);
        req.Headers.Authorization = new AuthenticationHeaderValue("Basic", encoded);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return req;
    }

    public async Task<List<JiraProject>> GetProjectsAsync()
    {
        var req = await CreateRequestAsync(HttpMethod.Get, "project");
        var res = await _http.SendAsync(req);
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"Jira API error ({res.StatusCode}): {content}");

        var projects = JsonConvert.DeserializeObject<List<JiraProject>>(content) ?? new List<JiraProject>();
        return projects;
    }

    public async Task<bool> HasStoryPointsAsync(string projectId)
    {
        if (string.IsNullOrWhiteSpace(projectId))
            throw new ArgumentException("projectId is required", nameof(projectId));

        var url =
            $"field/search?projectIds={Uri.EscapeDataString(projectId)}&query={Uri.EscapeDataString("Story Points")}&maxResults=50";

        var req = await CreateRequestAsync(HttpMethod.Get, url);
        var res = await _http.SendAsync(req);
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"Jira API error ({res.StatusCode}): {content}");

        var obj = JObject.Parse(content);
        var values = (JArray?)obj["values"] ?? new JArray();

        if (values.Count == 0)
            return false;

        return values.Any(x =>
            string.Equals((string?)x["id"], "customfield_10035", StringComparison.OrdinalIgnoreCase) &&
            string.Equals((string?)x["name"], "Story Points", StringComparison.OrdinalIgnoreCase)
        );
    }


    public async Task<bool> HasEffortEstimationAsync(string projectId)
    {
        if (string.IsNullOrWhiteSpace(projectId))
            throw new ArgumentException("projectId is required", nameof(projectId));

        var url =
            $"field/search?projectIds={Uri.EscapeDataString(projectId)}&query={Uri.EscapeDataString("Effort Estimation")}&maxResults=50";

        var req = await CreateRequestAsync(HttpMethod.Get, url);
        var res = await _http.SendAsync(req);
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"Jira API error ({res.StatusCode}): {content}");

        var obj = JObject.Parse(content);
        var values = (JArray?)obj["values"] ?? new JArray();

        if (values.Count == 0)
            return false;

        return values.Any(x =>
            string.Equals((string?)x["id"], "customfield_12345", StringComparison.OrdinalIgnoreCase) &&
            string.Equals((string?)x["name"], "Effort Estimation", StringComparison.OrdinalIgnoreCase)
        );
    }

    public async Task<List<JiraIssue>> GetIssuesAsync(
            string projectIdOrKey,
            int? value,
            bool useEffortEstimation,
            int maxResults = 10)
    {
        var projectClause = projectIdOrKey.All(char.IsDigit)
            ? $"project = {projectIdOrKey}"
            : $"project = \"{projectIdOrKey}\"";

        var jqlFieldName = useEffortEstimation ? $"\"Effort Estimation\"" : $"\"Story Points\"";
        var jql = projectClause;

        if (value.HasValue)
        {
            jql += $" AND {jqlFieldName} = {value.Value}";
        }

        jql += " AND statusCategory = Done";
        jql += " ORDER BY created DESC";

        var fields = new List<string>
        {
            "summary", "status", "assignee", "project", "created", "updated"
        };

        fields.Add(useEffortEstimation ? "customfield_12345" : "customfield_10035");

        var body = new
        {
            jql,
            maxResults,
            fields = fields.ToArray()
        };

        var req = await CreateRequestAsync(HttpMethod.Post, "search/jql");
        req.Content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");

        var res = await _http.SendAsync(req);
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"Jira API error ({res.StatusCode}): {content}");

        var obj = JObject.Parse(content);
        var issues = obj["issues"]?.ToObject<List<JiraIssue>>() ?? new List<JiraIssue>();
        return issues;
    }
}
