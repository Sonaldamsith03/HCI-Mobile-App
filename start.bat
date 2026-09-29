@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Starting AgriConnect Expo Development Server...
call npx expo start %*
