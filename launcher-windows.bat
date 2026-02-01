@echo off
REM La Unidad Launcher - Windows Version
REM ====================================
REM Crea túnel SSH y abre OpenClaw en Brave

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   🚀 LA UNIDAD LAUNCHER                                   ║
echo ║                                                           ║
echo ║   Conecta con OpenClaw y abre el dashboard automáticamente║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

set HOST=pi@192.168.1.31
set LOCAL_PORT=18789
set REMOTE_PORT=18789
set URL=http://localhost:%LOCAL_PORT%/chat?session=agent%3Amain%3Amain

echo [1/3] Verificando tunnel SSH existente...
netstat -an | findstr :%LOCAL_PORT% > nul
if %errorlevel% equ 0 (
    echo ✅ Tunnel ya activo!
) else (
    echo [2/3] Creando tunnel SSH...
    start /B ssh -N -L %LOCAL_PORT%:127.0.0.1:%REMOTE_PORT% %HOST%
    timeout /t 3 /nobreak > nul
    echo ✅ Tunnel creado!
)

echo [3/3] Abriendo dashboard en Brave...
start brave %URL%

echo.
echo ✅ ¡Listo! El dashboard debe estar abriendo.
echo.
echo Si no abre, visita: %URL%
echo.
pause
