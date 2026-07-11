@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Carnacar - degisiklikler yayinlaniyor...
echo.
git add -A
git commit -m "site guncellemesi: %date% %time%"
git push
echo.
if %errorlevel%==0 (
  echo  Tamam! Cloudflare Pages 1-2 dakika icinde siteyi gunceller.
) else (
  echo  Bir sorun olustu. Ust satirlardaki hataya bak.
)
echo.
pause
