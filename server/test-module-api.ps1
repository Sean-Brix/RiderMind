# Module API Quick Test Script

Write-Host "`n🚀 RiderMind Module API - Quick Test" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

Write-Host "📋 Testing Module API Endpoints...`n" -ForegroundColor Yellow

# Test 1: Get All Modules
Write-Host "1️⃣  GET /api/modules" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/modules" -Method GET
    Write-Host "   ✅ Success! Found $($response.count) modules" -ForegroundColor Green
    if ($response.data.Count -gt 0) {
        Write-Host "   📦 First module: $($response.data[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get Module by ID
Write-Host "2️⃣  GET /api/modules/1" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/modules/1" -Method GET
    Write-Host "   ✅ Success! Module: $($response.data.title)" -ForegroundColor Green
    Write-Host "   📊 Objectives: $($response.data.objectives.Count)" -ForegroundColor Gray
    Write-Host "   📄 Slides: $($response.data.slides.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get with Query Params
Write-Host "3️⃣  GET /api/modules?isActive=true&includeObjectives=true" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/modules?isActive=true&includeObjectives=true" -Method GET
    Write-Host "   ✅ Success! Found $($response.count) active modules" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Slide Image (if exists)
Write-Host "4️⃣  GET /api/modules/slides/2/image" -ForegroundColor Green
try {
    $headers = @{}
    Invoke-WebRequest -Uri "$baseUrl/api/modules/slides/2/image" -Method GET -Headers $headers -OutFile "test-image.jpg" -ErrorAction Stop
    $fileSize = (Get-Item "test-image.jpg").Length
    Write-Host "   ✅ Success! Downloaded image ($fileSize bytes)" -ForegroundColor Green
    Remove-Item "test-image.jpg" -ErrorAction SilentlyContinue
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: Stream Video (HEAD request to check)
Write-Host "5️⃣  HEAD /api/modules/slides/1/video" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/modules/slides/1/video" -Method HEAD -ErrorAction Stop
    Write-Host "   ✅ Success! Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Green
    if ($response.Headers.'Content-Length') {
        $sizeMB = [math]::Round($response.Headers.'Content-Length' / 1MB, 2)
        Write-Host "   📹 Video size: $sizeMB MB" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Basic GET tests complete!`n" -ForegroundColor Cyan

# Admin tests require token
Write-Host "🔐 To test ADMIN endpoints (POST/PUT/DELETE):" -ForegroundColor Yellow
Write-Host "   1. Login via: POST /api/auth/login" -ForegroundColor Gray
Write-Host "   2. Copy your admin JWT token" -ForegroundColor Gray
Write-Host "   3. Use in Authorization header: Bearer <token>`n" -ForegroundColor Gray

Write-Host "📚 Full API Documentation:" -ForegroundColor Cyan
Write-Host "   Documentation/Module_API_Documentation.md`n" -ForegroundColor Gray

Write-Host "🧪 Postman Testing Guide:" -ForegroundColor Cyan
Write-Host "   Documentation/Postman_Module_API.md`n" -ForegroundColor Gray
