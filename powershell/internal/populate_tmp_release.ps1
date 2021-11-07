# Andrew Pratt 2021
# populate_tmp_release: Populates the tmp/release directory with generated files and contents of the distribution directory

New-Item -Path ../tmp/release -ItemType Directory -Force
Copy-Item -Path ../bin/CrashEffects.js -Destination ../tmp/release/CrashEffects.js
Copy-Item -Path ../distribution/* -Destination ../tmp/release/ -Recurse