@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  KodGunlugu - degisiklikler yayinlaniyor...
echo.
git add -A
git commit -m "site guncellemesi: %date% %time%"
echo.
echo  Cloudflare Pages'e deploy ediliyor...
echo.
call npx -y wrangler pages deploy . --project-name kodgunlugu --branch main --commit-dirty=true
echo.
if %errorlevel%==0 (
  echo  Tamam! Siten guncellendi: https://kodgunlugu.pages.dev
) else (
  echo  Bir sorun olustu. Ust satirlardaki hataya bak.
)
echo.
pause
