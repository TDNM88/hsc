@echo off
echo Setting up environment for Next.js build...

:: First run our direct patch script for the route loader
node direct-route-loader-patch.js

:: Set environment variables
set NODE_ENV=production
set NEXT_CONFIG_FILE=next.config.simple.js

:: Run Next.js build with polyfills
node -r ./direct-fix.js ./node_modules/next/dist/bin/next build

IF %ERRORLEVEL% EQU 0 (
  echo Build completed successfully!
) ELSE (
  echo Build failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)
