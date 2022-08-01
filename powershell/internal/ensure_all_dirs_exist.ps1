# Andrew Pratt 2022
# ensure_all_dirs_exist: Tests if needed directories exist, and creates them if they are missing

New-Item -Path ../bin -ItemType Directory -Force
New-Item -Path ../release -ItemType Directory -Force
New-Item -Path ../distribution -ItemType Directory -Force
New-Item -Path ../lib -ItemType Directory -Force
New-Item -Path ../tmp -ItemType Directory -Force
New-Item -Path ../tmp/release -ItemType Directory -Force