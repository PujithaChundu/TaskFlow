@SETLOCAL
@IF NOT DEFINED NODE_PATH (
  @SET "NODE_PATH=C:\Users\chundu.pujitha\Downloads\taskflow\taskflow\node_modules\.pnpm\vite@6.4.1_@types+node@22.1_af23399f85b13f59e511c7ea0ed23996\node_modules\vite\node_modules;C:\Users\chundu.pujitha\Downloads\taskflow\taskflow\node_modules\.pnpm\vite@6.4.1_@types+node@22.1_af23399f85b13f59e511c7ea0ed23996\node_modules;C:\Users\chundu.pujitha\Downloads\taskflow\taskflow\node_modules\.pnpm\node_modules"
) ELSE (
  @SET "NODE_PATH=C:\Users\chundu.pujitha\Downloads\taskflow\taskflow\node_modules\.pnpm\vite@6.4.1_@types+node@22.1_af23399f85b13f59e511c7ea0ed23996\node_modules\vite\node_modules;C:\Users\chundu.pujitha\Downloads\taskflow\taskflow\node_modules\.pnpm\vite@6.4.1_@types+node@22.1_af23399f85b13f59e511c7ea0ed23996\node_modules;C:\Users\chundu.pujitha\Downloads\taskflow\taskflow\node_modules\.pnpm\node_modules;%NODE_PATH%"
)
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\vite\bin\vite.js" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\vite\bin\vite.js" %*
)
