using Newtonsoft.Json;

namespace JiraIntegrationApi.Models
{
    public class JiraIssue
    {
        public string Id { get; set; }
        public string Key { get; set; }
        public JiraIssueFields Fields { get; set; }
    }

    public class JiraIssueFields
    {
        public string Summary { get; set; }
        public JiraIssueType Issuetype { get; set; }
        public JiraProject Project { get; set; }
        public JiraUser Assignee { get; set; }
        public JiraUser Reporter { get; set; }
        [JsonProperty("customfield_10026")]
        public double? StoryPoints { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public JiraStatus Status { get; set; }
    }

    public class JiraIssueType
    {
        public string Name { get; set; }
        public string IconUrl { get; set; }
    }

    public class JiraUser
    {
        public string AccountId { get; set; }
        public string DisplayName { get; set; }
        public bool Active { get; set; }

        [JsonProperty("emailAddress")]
        public string EmailAddress { get; set; }
    }

    public class JiraStatus
    {
        public string Self { get; set; }
        public string Description { get; set; }
        public string IconUrl { get; set; }
        public string Name { get; set; }
        public string Id { get; set; }
        public JiraStatusCategory StatusCategory { get; set; }
    }

    public class JiraStatusCategory
    {
        public string Self { get; set; }
        public int Id { get; set; }
        public string Key { get; set; }
        public string ColorName { get; set; }
        public string Name { get; set; }
    }
}


