@echo off
setlocal

title Simulador de Notas Fiscais - React + Vite + PostgreSQL + SEFAZ

cd /d "%~dp0"

echo ========================================================
echo   SIMULADOR DE NOTAS FISCAIS & DANFE SEFAZ (v2.0)
echo   Stack: React 18 + Vite + Coss UI + PostgreSQL 16
echo ========================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
    )
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
echo Node.js detectado: %NODE_VERSION%
echo.

if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
)

echo Inicializando banco de dados PostgreSQL se necessario...
call npm run seed >nul 2>&1

echo Preparando abertura automatica do navegador...
start "" powershell -NoProfile -WindowStyle Hidden -Command "$a=0; while($a -lt 60){ try { $c=New-Object System.Net.Sockets.TcpClient; $c.Connect('127.0.0.1',3000); $c.Close(); Start-Process 'http://localhost:3000'; break; } catch { Start-Sleep -Milliseconds 500; $a++; } }"

echo ========================================================
echo Servidor Vite + API PostgreSQL iniciando...
echo O navegador abrira automaticamente em http://localhost:3000
echo Pressione Ctrl+C para encerrar o servidor.
echo ========================================================
echo.

call npm run dev
