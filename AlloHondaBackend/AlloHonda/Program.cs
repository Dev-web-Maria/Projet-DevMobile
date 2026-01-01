using Microsoft.EntityFrameworkCore;
using AlloHonda.Data;
using Microsoft.AspNetCore.Identity;
using AlloHonda.Models;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AlloHondaContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AlloHondaContext")
        ?? throw new InvalidOperationException("Connection string 'AlloHondaContext' not found.")));

// Add Identity avec IdentityRole spécifié
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Configuration des options Identity
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;

    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<AlloHondaContext>()
.AddDefaultTokenProviders();

// Add services to the container.
builder.Services.AddControllers();

// Ajouter CORS - VERSION CORRIGÉE POUR EXPO
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowExpo",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowExpo");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialisation de la base de données (Rôles et Migrations)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        
        // Appliquer les migrations
        var db = services.GetRequiredService<AlloHondaContext>();
        db.Database.Migrate();
        Console.WriteLine("Migrations appliquées avec succès.");

        // Créer les rôles
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        string[] roles = { "Client", "Chauffeur" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                Console.WriteLine($"Rôle '{role}' créé avec succès.");
            }
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Erreur lors de l'initialisation: {ex.Message}");
}

app.Run();