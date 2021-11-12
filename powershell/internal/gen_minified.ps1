# Andrew Pratt 2021
# gen_minified: Generates a minified version of the previously CrashEffects.js (in the tmp directory) and saves it as a new file at bin/CrashEffects.js
#	New file will be prepended with a comment for author credit/copyright

$StartLocation = Get-Location
try
{
	Set-Location ../src
	$IPath = Join-Path -Path $StartLocation -ChildPath ../tmp/CrashEffects.js
	$OPath = Join-Path -Path $StartLocation -ChildPath ../bin/CrashEffects.js
	uglifyjs $IPath -c -m --toplevel -b "beautify=false,preamble='/// Andrew Pratt 2021'" -o $OPath
	
}
finally
{
	Set-Location $StartLocation
}