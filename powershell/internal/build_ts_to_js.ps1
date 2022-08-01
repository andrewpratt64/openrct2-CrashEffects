# Andrew Pratt 2022
# build_ts_to_js: Compiles typescript in the src folder to tmp/CrashEffects.js

$StartLocation = Get-Location
try
{
	Set-Location ../src
	npx tsc
	
}
finally
{
	Set-Location $StartLocation
}