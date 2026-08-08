@echo off
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8889') do (
    echo Killing process %%a on port 8889...
    taskkill /F /PID %%a
)
