$env:Path = "C:\Program Files\nodejs;" + $env:Path
Write-Host "Starting AgriConnect Expo Development Server..." -ForegroundColor Green
npx expo start @args
