@echo off
REM PowerShell 실행 정책 우회하여 스크립트 실행

echo ========================================
echo Git + CI/CD 자동 배포 설정 시작
echo ========================================
echo.

REM 현재 세션에만 실행 정책을 RemoteSigned로 설정하고 스크립트 실행
powershell.exe -ExecutionPolicy Bypass -File "%~dp0배포_시작하기.ps1"

pause
