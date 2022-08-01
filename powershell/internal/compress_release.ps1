# Andrew Pratt 2022
# compress_release: Creates a compressed archive from the tmp/release directory

./internal/clean_release.ps1
Compress-Archive -Path ../tmp/release/* -DestinationPath ../release/CrashEffects.zip