@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo       SHELL AI EOS ^| UNIFIED PLATFORM LAUNCHER
echo ======================================================
echo.

:: Ensure we are in the correct directory
cd /d "%~dp0"
echo [1/3] Directoy set to: %cd%

:: Try to find Python
echo [2/3] Checking for Python version...
python --version >nul 2>&1
if %errorlevel% == 0 (
    set PY_CMD=python
) else (
    py --version >nul 2>&1
    if !errorlevel! == 0 (
        set PY_CMD=py
    ) else (
        python3 --version >nul 2>&1
        if !errorlevel! == 0 (
            set PY_CMD=python3
        ) else (
            echo.
            echo [ERROR] No Python found in your PATH. 
            echo Please make sure Python is installed and Added to PATH.
            pause
            exit /b
        )
    )
)

echo [3/3] Starting Platform via !PY_CMD!...
echo.
!PY_CMD! run_platform.py

echo.
echo ======================================================
echo [SYSTEM] Platform has stopped.
echo ======================================================
pause
