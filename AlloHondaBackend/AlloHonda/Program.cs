//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.DependencyInjection;
//using AlloHonda.Data;
//using AlloHanda.Models;
//using Microsoft.AspNetCore.Identity;
//using AlloHonda.Models;

//var builder = WebApplication.CreateBuilder(args);

//// Add DbContext
//builder.Services.AddDbContext<AlloHondaContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("AlloHondaContext")
//        ?? throw new InvalidOperationException("Connection string 'AlloHondaContext' not found.")));

//// Add Identity avec IdentityRole spécifié
//builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
//{
//    // Configuration des options Identity
//    options.Password.RequireDigit = false;
//    options.Password.RequiredLength = 6;
//    options.Password.RequireNonAlphanumeric = false;
//    options.Password.RequireUppercase = false;
//    options.Password.RequireLowercase = false;

//    options.SignIn.RequireConfirmedAccount = false;
//})
//.AddEntityFrameworkStores<AlloHondaContext>()
//.AddDefaultTokenProviders();

//// Add services to the container.
//builder.Services.AddControllersWithViews();


//// Ajouter CORS pour React Native - AVEC TON IP 192.168.1.7
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("ReactNative",
//        policy =>
//        {
//            policy.WithOrigins(
//                    "http://localhost:19006",       // Expo Web sur PC
//                    "http://192.168.1.7:19006",     // Ton IP réelle + port Expo
//                    "exp://192.168.1.7:19000",      // Expo Go sur téléphone
//                    "exp://192.168.1.7:8081"        // Port alternatif Expo
//                )
//                  .AllowAnyMethod()
//                  .AllowAnyHeader()
//                  .AllowCredentials(); // Si tu utilises des cookies/auth
//        });
//});

//var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (!app.Environment.IsDevelopment())
//{
//    app.UseExceptionHandler("/Home/Error");
//    app.UseHsts();
//}
//else
//{
//    app.UseDeveloperExceptionPage();
//}

//app.UseHttpsRedirection();
//app.UseStaticFiles();

//app.UseRouting();

//app.UseCors("ReactNative");
//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllers();

//// Créer les rôles au démarrage
//try
//{
//    using (var scope = app.Services.CreateScope())
//    {
//        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

//        // Créer seulement les rôles Client et Chauffeur
//        string[] roles = { "Client", "Chauffeur" };

//        foreach (var role in roles)
//        {
//            if (!await roleManager.RoleExistsAsync(role))
//            {
//                await roleManager.CreateAsync(new IdentityRole(role));
//                Console.WriteLine($"Rôle '{role}' créé avec succès.");
//            }
//        }
//    }
//}
//catch (Exception ex)
//{
//    Console.WriteLine($"Erreur lors de la création des rôles: {ex.Message}");
//}

//app.Run();





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
            // Solution 1: Sans AllowCredentials() (pour développement)
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
            // NOTE: .AllowCredentials() est supprimé car incompatible avec AllowAnyOrigin()
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
    // Pas besoin de Swagger pour le moment
}

// DÉSACTIVE la redirection HTTPS en développement
// app.UseHttpsRedirection(); // Commente cette ligne pour le dev
app.UseStaticFiles();

app.UseRouting();

// CORS doit être placé ici
app.UseCors("AllowExpo");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Créer les rôles au démarrage
try
{
    using (var scope = app.Services.CreateScope())
    {
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Créer seulement les rôles Client et Chauffeur
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
    Console.WriteLine($"Erreur lors de la création des rôles: {ex.Message}");
}


app.Run();