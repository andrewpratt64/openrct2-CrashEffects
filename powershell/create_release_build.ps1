# Andrew Pratt 2021
# create_release_build: Creates a release-ready build of the plugin using the compiled plugin in the bin directory and the contents of the distribution directory

./internal/clean_tmp_release_files.ps1
./internal/populate_tmp_release.ps1
./internal/compress_release.ps1