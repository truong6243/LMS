# PowerShell script to hash password using BCrypt
$password = "123456"

# Install BCrypt.Net-Next if not already installed
if (!(Get-Package -Name BCrypt.Net-Next -ErrorAction SilentlyContinue)) {
    Install-Package BCrypt.Net-Next -Force -Source nuget.org
}

# Load BCrypt assembly
Add-Type -Path "C:\Users\$env:USERNAME\.nuget\packages\bcrypt.net-next\4.0.3\lib\net472\BCrypt.Net-Next.dll"

# Hash password
$hash = [BCrypt.Net.BCrypt]::HashPassword($password, [BCrypt.Net.BCrypt]::GenerateSalt(10))
Write-Host "Password: $password"
Write-Host "Hash: $hash"
