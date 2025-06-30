# Test account data
$testUser = @{
    username = "testuser_$(Get-Random -Minimum 1000 -Maximum 9999)"
    email = "test_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
    password = "Test@1234"
    name = "Test User"
    phone = (Get-Random -Minimum 100000000 -Maximum 999999999).ToString()
} | ConvertTo-Json

# API endpoint
$url = "http://localhost:3000/api/auth/register"

# Send the request
try {
    Write-Host "Creating test account with data:" -ForegroundColor Cyan
    $testUser | ConvertFrom-Json | Format-Table | Out-String | Write-Host -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $testUser -ContentType "application/json"
    
    Write-Host "`n✅ Account created successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | Format-List | Out-String | Write-Host -ForegroundColor Green
} 
catch {
    Write-Host "`n❌ Error creating account:" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            $errorDetails | Format-List | Out-String | Write-Host -ForegroundColor Red
        } else {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`nYou can now use these credentials to log in:" -ForegroundColor Cyan
Write-Host "📧 Email: $($testUser | ConvertFrom-Json | Select-Object -ExpandProperty email)" -ForegroundColor Yellow
Write-Host "🔑 Password: $($testUser | ConvertFrom-Json | Select-Object -ExpandProperty password)" -ForegroundColor Yellow
