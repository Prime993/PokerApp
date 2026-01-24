using Newtonsoft.Json;

namespace JiraIntegrationApi.Models
{
    public class JiraProject
    {
        public string Id { get; set; }
        public string Key { get; set; }
        public string Name { get; set; }
        public string Self { get; set; }
        public string ProjectTypeKey { get; set; }
        public string Style { get; set; }
        public bool Simplified { get; set; }
        public bool IsPrivate { get; set; }

        public JiraAvatarUrls AvatarUrls { get; set; }
        public JiraProjectCategory ProjectCategory { get; set; }
    }

    public class JiraAvatarUrls
    {
        [JsonProperty("16x16")]
        public string _16x16 { get; set; }

        [JsonProperty("24x24")]
        public string _24x24 { get; set; }

        [JsonProperty("32x32")]
        public string _32x32 { get; set; }

        [JsonProperty("48x48")]
        public string _48x48 { get; set; }
    }

    public class JiraProjectCategory
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
