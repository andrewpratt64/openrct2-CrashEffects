# Andrew Pratt 2022
# deploy: Copies CrashEffects.js from bin directory to user's OpenRCT2 installation

$UserConfig = Get-Content -Path ../local_user.cfg | ConvertFrom-StringData

Copy-Item ../bin/CrashEffects.js -Destination ($UserConfig.OpenRCT2Path + "/plugin/" + $UserConfig.DeployFilename)