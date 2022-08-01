# Andrew Pratt 2022
# update_openrct2_dts_from_upstream: Downloads OpenRCT2's Typescript declaration file from github, and saves it to the lib directory

$OutFilePath = Join-Path -Path Get-Location -ChildPath  ../../../lib/openrct2.d.ts
Write-Information -MessageData ("Attempting to generate file: " + $OutFilePath) -InformationAction Continue
$Response = Invoke-WebRequest -Uri https://raw.githubusercontent.com/OpenRCT2/OpenRCT2/develop/distribution/openrct2.d.ts -OutFile $OutFilePath
Write-Information -MessageData "Done" -InformationAction Continue