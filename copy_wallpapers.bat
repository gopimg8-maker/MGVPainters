@echo off
powershell -ExecutionPolicy Bypass -File .\copy_interior.ps1
powershell -ExecutionPolicy Bypass -File .\copy_exterior.ps1
