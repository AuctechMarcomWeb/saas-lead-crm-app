@echo off
echo ========================================
echo Cleaning and Rebuilding Android App
echo ========================================
echo.

cd android
echo [1/4] Cleaning Android build...
call gradlew.bat clean
cd ..

echo.
echo [2/4] Clearing Metro cache...
npx react-native start --reset-cache &
timeout /t 3 /nobreak > nul
taskkill /F /IM node.exe /T 2>nul

echo.
echo [3/4] Clearing watchman...
watchman watch-del-all 2>nul

echo.
echo [4/4] Building and running Android app...
npm run android

echo.
echo ========================================
echo Build Complete!
echo ========================================
