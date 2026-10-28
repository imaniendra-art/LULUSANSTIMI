@echo off
set PATH=%PATH%;C:\Users\Iman Prasetyo Amir\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.18.1-win-x64;C:\Program Files (x86)\cloudflared
cd /d "D:\LULUSANSTIMI"
echo Starting LULUSANSTIMI Server via PM2...
call pm2 start ecosystem.config.js
call pm2 save
echo LULUSANSTIMI Server started in background!
