param(
    [string]$XamppRoot = "C:\xampp",
    [string]$DatabaseName = "interview_platform",
    [string]$DatabaseUser = "interview_app",
    [string]$DatabasePassword = "interview-local-only",
    [int]$ApachePort = 8080
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$apiRoot = Join-Path $projectRoot "platform\api"
$webRoot = Join-Path $projectRoot "platform\web"
$php = Join-Path $XamppRoot "php\php.exe"
$mysql = Join-Path $XamppRoot "mysql\bin\mysql.exe"
$apache = Join-Path $XamppRoot "apache\bin\httpd.exe"
$composer = "C:\ProgramData\ComposerSetup\bin\composer.phar"
$httpdConf = Join-Path $XamppRoot "apache\conf\httpd.conf"
$siteConf = Join-Path $XamppRoot "apache\conf\extra\interview-platform.conf"

foreach ($required in @($apiRoot, $webRoot, $php, $mysql, $apache, $composer, $httpdConf)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "Required path was not found: $required" }
}
if ($DatabaseName -notmatch '^[A-Za-z0-9_]+$' -or $DatabaseUser -notmatch '^[A-Za-z0-9_]+$') {
    throw "Database name and user may contain only letters, numbers and underscores."
}
if ($DatabasePassword.Contains("'")) { throw "DatabasePassword cannot contain a single quote." }

$sql = @"
CREATE DATABASE IF NOT EXISTS ``$DatabaseName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DatabaseUser'@'localhost' IDENTIFIED BY '$DatabasePassword';
ALTER USER '$DatabaseUser'@'localhost' IDENTIFIED BY '$DatabasePassword';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES ON ``$DatabaseName``.* TO '$DatabaseUser'@'localhost';
FLUSH PRIVILEGES;
"@
$sql | & $mysql --host=127.0.0.1 --port=3306 --user=root
if ($LASTEXITCODE -ne 0) { throw "Database provisioning failed. Start MySQL in XAMPP and verify the local root account." }

$envFile = Join-Path $apiRoot ".env"
if (-not (Test-Path -LiteralPath $envFile)) { Copy-Item -LiteralPath (Join-Path $apiRoot ".env.example") -Destination $envFile }
$envText = Get-Content -Raw -LiteralPath $envFile
$settings = @{
    APP_URL = "http://localhost:$ApachePort"; DB_DATABASE = $DatabaseName; DB_USERNAME = $DatabaseUser;
    DB_PASSWORD = $DatabasePassword; ASSESSMENT_SYNC_LOCAL = "true"; SANCTUM_STATEFUL_DOMAINS = "localhost:$ApachePort,localhost:8000,127.0.0.1:8000,localhost:5174,127.0.0.1:5174,localhost,127.0.0.1"
}
foreach ($entry in $settings.GetEnumerator()) {
    $escaped = [regex]::Escape($entry.Key)
    $envText = [regex]::Replace($envText, "(?m)^$escaped=.*$", "$($entry.Key)=$($entry.Value)")
}
Set-Content -LiteralPath $envFile -Value $envText -Encoding utf8

Push-Location $apiRoot
try {
    & $php -d error_reporting=8191 $composer install --prefer-source --no-interaction --no-progress
    if ($LASTEXITCODE -ne 0) { throw "Composer dependency installation failed." }
    if ($envText -match '(?m)^APP_KEY=\s*$') { & $php artisan key:generate --force }
    & $php artisan migrate --force
    if ($LASTEXITCODE -ne 0) { throw "Laravel migration failed." }
    & $php artisan db:seed --force
    if ($LASTEXITCODE -ne 0) { throw "Laravel content seed failed." }
} finally { Pop-Location }

Push-Location $projectRoot
try {
    & pnpm.cmd install --filter "@interview-platform/web..." --frozen-lockfile
    & pnpm.cmd --filter "@interview-platform/web" build
    if ($LASTEXITCODE -ne 0) { throw "React dependency installation or production build failed." }
} finally { Pop-Location }

$apiPath = ($apiRoot -replace '\\', '/')
$apacheConfig = @"
Listen $ApachePort
<VirtualHost *:$ApachePort>
    ServerName localhost
    DocumentRoot "$apiPath/public"
    <Directory "$apiPath/public">
        AllowOverride All
        Options FollowSymLinks
        Require all granted
    </Directory>
    ErrorLog "logs/interview-platform-error.log"
    CustomLog "logs/interview-platform-access.log" combined
</VirtualHost>
"@
Set-Content -LiteralPath $siteConf -Value $apacheConfig -Encoding ascii
$includeLine = 'Include conf/extra/interview-platform.conf'
if (-not (Select-String -LiteralPath $httpdConf -SimpleMatch $includeLine -Quiet)) {
    Add-Content -LiteralPath $httpdConf -Value "`r`n$includeLine"
}
& $apache -t
if ($LASTEXITCODE -ne 0) { throw "Apache configuration validation failed." }

Write-Host "Interview Platform is installed. Restart Apache in XAMPP, then open http://localhost:$ApachePort"
Write-Host "Run a queue worker in another terminal: cd '$apiRoot'; C:\xampp\php\php.exe artisan queue:work"
