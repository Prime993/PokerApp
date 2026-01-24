using JiraIntegrationApi.Services;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(
        Path.Combine(AppContext.BaseDirectory, "AppData", "dp-keys")))
    .SetApplicationName("JiraIntegrationApi");

builder.Services.AddHttpClient<JiraService>(client =>
{
    client.BaseAddress = new Uri("https://seavision.atlassian.net/rest/api/3/");
});

builder.Services.AddHttpClient<JiraSessionService>(client =>
{
    client.BaseAddress = new Uri("https://seavision.atlassian.net/rest/api/3/");
});


builder.Services.AddSingleton<AuthCryptoService>();
builder.Services.AddSingleton<AuthStorageService>();

builder.Services.AddCors(o =>
{
    o.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.MapControllers();

app.Run();
