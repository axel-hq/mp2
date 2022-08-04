setlocal
@set SSH_TARGET=root@api.axelapi.xyz
@set DEST=/pub/mp2
@call npm install
@make
ssh %SSH_TARGET% mkdir -p %DEST%
wsl rsync -av package.json package-lock.json bin/index.js index.html %SSH_TARGET%:%DEST%
ssh %SSH_TARGET% "cd %DEST% && npm install --omit=dev"
endlocal
