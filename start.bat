@echo off
echo 正在启动 GameTrust 平台...
echo.

echo 启动后端 API 服务器...
start "Backend Server" cmd /k "cd /d api && node server.js"

timeout /t 3 /nobreak >nul

echo 启动前端开发服务器...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 服务器启动完成！
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3005
echo.
pause