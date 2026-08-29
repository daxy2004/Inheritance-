Add-Type -Path "scripts\InheritanceIconCrest.cs" -ReferencedAssemblies "System.Drawing"

# 1. Android Launcher & Adaptive Mipmap Icons
$densities = @(
    @{ Name = "mipmap-mdpi"; LauncherSize = 48; ForegroundSize = 108 },
    @{ Name = "mipmap-hdpi"; LauncherSize = 72; ForegroundSize = 162 },
    @{ Name = "mipmap-xhdpi"; LauncherSize = 96; ForegroundSize = 216 },
    @{ Name = "mipmap-xxhdpi"; LauncherSize = 144; ForegroundSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; LauncherSize = 192; ForegroundSize = 432 }
)

$baseRes = "android\app\src\main\res"

foreach ($d in $densities) {
    $dir = Join-Path $baseRes $d.Name
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $squarePath = Join-Path $dir "ic_launcher.png"
    $roundPath  = Join-Path $dir "ic_launcher_round.png"
    $fgPath     = Join-Path $dir "ic_launcher_foreground.png"

    [InheritanceIconCrest]::Generate($squarePath, $d.LauncherSize, "square")
    [InheritanceIconCrest]::Generate($roundPath, $d.LauncherSize, "round")
    [InheritanceIconCrest]::Generate($fgPath, $d.ForegroundSize, "foreground")

    Write-Host "Generated Android icons for: $($d.Name)"
}

# 2. Public Web / PWA / Apple Touch Icons
$publicDir = "public"
[InheritanceIconCrest]::Generate((Join-Path $publicDir "favicon.png"), 64, "round")
[InheritanceIconCrest]::Generate((Join-Path $publicDir "icon-192.png"), 192, "round")
[InheritanceIconCrest]::Generate((Join-Path $publicDir "icon-512.png"), 512, "round")
[InheritanceIconCrest]::Generate((Join-Path $publicDir "apple-touch-icon.png"), 180, "square")

Write-Host "All Android & Web Heritage Tree icons regenerated successfully!"
