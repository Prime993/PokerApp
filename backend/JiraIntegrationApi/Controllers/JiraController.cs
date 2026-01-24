using JiraIntegrationApi.Models;
using JiraIntegrationApi.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/jira")]
public class JiraController : ControllerBase
{
    private readonly JiraSessionService _session;
    private readonly JiraService _jira;

    public JiraController(JiraSessionService session, JiraService jira)
    {
        _session = session;
        _jira = jira;
    }

    // =========================
    // SESSION CHECK
    // =========================
    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        return Ok(new
        {
            authenticated = await _session.IsAuthenticatedAsync()
        });
    }

    // =========================
    // LOGIN
    // =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] JiraLoginRequest req)
    {
        try
        {
            await _session.LoginAsync(req.Email, req.ApiToken);
            return Ok();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // LOGOUT
    // =========================
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        _session.Logout();
        return Ok();
    }

    // =========================
    // PROJECTS (SW-IT only)
    // =========================
    [HttpGet("projects")]
    public async Task<IActionResult> Projects()
    {
        if (!await _session.IsAuthenticatedAsync())
            return Unauthorized();

        var projects = await _jira.GetProjectsAsync();

        return Ok(
            projects.Where(p => p.ProjectCategory?.Id == "10001")
        );
    }

    // =========================
    // STORY POINTS CHECK
    // =========================
    [HttpGet("projects/{projectId}/has-story-points")]
    public async Task<IActionResult> HasStoryPoints(string projectId)
    {
        if (!await _session.IsAuthenticatedAsync())
            return Unauthorized();

        var hasSP = await _jira.HasStoryPointsAsync(projectId);
        return Ok(new { hasStoryPoints = hasSP });
    }

    // =========================
    // ISSUES BY STORY POINTS
    // =========================
    [HttpGet("issues")]
    public async Task<IActionResult> Issues(
        [FromQuery] string? projectId,
        [FromQuery] string? projectKey,
        [FromQuery] int storyPoints)
    {
        if (!await _session.IsAuthenticatedAsync())
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(projectId) && string.IsNullOrWhiteSpace(projectKey))
            return BadRequest("projectId or projectKey is required");

        var project = projectId ?? projectKey!;

        if (projectId != null)
        {
            var hasSP = await _jira.HasStoryPointsAsync(projectId);
            if (!hasSP)
                return BadRequest("Selected project does not have Story Points enabled");
        }

        var issues = await _jira.GetIssuesAsync(project, storyPoints);

        return Ok(issues);
    }
}
