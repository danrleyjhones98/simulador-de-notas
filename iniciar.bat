@echo off
setlocal

title Simulador de Notas Fiscais

:: Define o diretorio do projeto como diretorio de trabalho
if exist "%~dp0projeto\" (
    cd /d "%~dp0projeto"
) else (
    cd /d "%~dp0"
)

echo ========================================================
echo        SIMULADOR DE NOTAS FISCAIS - INICIALIZADOR
echo ========================================================
echo.

:: 1. Verificar se o Node.js ja esta no PATH
where node >nul 2>&1
if %errorlevel% equ 0 goto :node_ok

:: Verificar caminhos padroes de instalacao no Windows
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
    goto :node_ok
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm;%PATH%"
    goto :node_ok
)

:instalar_node
echo [AVISO] Node.js nao foi encontrado no sistema.
echo Tentando instalar o Node.js LTS automaticamente...
echo.

where winget >nul 2>&1
if %errorlevel% equ 0 (
    echo Instalando via winget...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
    goto :pos_instalacao
)

echo Baixando e instalando Node.js oficial via PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $dest = Join-Path $env:TEMP 'node_setup.msi'; (New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi', $dest); Start-Process msiexec.exe -ArgumentList '/i', $dest, '/qn', '/norestart' -Wait; Remove-Item $dest -Force -ErrorAction SilentlyContinue"

:pos_instalacao
set "PATH=%ProgramFiles%\nodejs;%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm;%PATH%"
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo [ERRO] Node.js instalado, mas requer reabrir o terminal.
    echo Por favor, feche esta janela e execute o arquivo novamente.
    echo Se o erro persistir, instale pelo site: https://nodejs.org/
    echo ========================================================
    pause
    exit /b 1
)
echo [SUCESSO] Node.js instalado com sucesso!
echo.

:node_ok
for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
echo Node.js detectado: %NODE_VERSION%
echo.

:: 2. Verificar dependencias (node_modules)
if exist "node_modules\" goto :iniciar_app

echo ========================================================
echo Dependencias nao encontradas. Executando npm install...
echo ========================================================
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao executar npm install.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas com sucesso!
echo.

:iniciar_app
echo Preparando abertura automatica do navegador...
start "" powershell -NoProfile -WindowStyle Hidden -Command "$a=0; while($a -lt 60){ try { $c=New-Object System.Net.Sockets.TcpClient; $c.Connect('127.0.0.1',3000); $c.Close(); Start-Process 'http://localhost:3000'; break; } catch { Start-Sleep -Milliseconds 500; $a++; } }"

echo ========================================================
echo Servidor Next.js iniciando...
echo O navegador abrira automaticamente em http://localhost:3000
echo Pressione Ctrl+C para encerrar o servidor.
echo ========================================================
echo.

call npm run dev
