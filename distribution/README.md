# openrct2-CrashEffects
##### By Andrew Pratt
A plugin for OpenRCT2 that adds enhanced destruction effects to your park
![crash_effects](https://user-images.githubusercontent.com/25914377/124208027-ba547e00-dab4-11eb-9ffb-3100dd84d436.gif)


### Current Features:
- Causes coaster cars to change the surface material of the ground when they explode
- Footpaths, ride tracks, and scenery can be destroyed in explosions
- Footpath additions (benches, lamps, etc.) can be damaged and destroyed in explosions

### TODO
- Make peeps that aren't in a ride die if touching an explosion
- Update the preview gif/thumbnail to show new features
- Improve documentation for compiling


### Extra Planned Features For The Future:
- Creation of rubble scenery items

### Installation:
Copy CrashEffects.js to your OpenRCT2\plugin directory


### Building The Plugin From The Source Code:
1. Clone the git repository
2. Create a new file in the same directory as "example_local_user.cfg.txt" and title it, "local_user.cfg"
3. Populate local_user.cfg, using example_local_user.cfg.txt for reference
4. Run powershell/setup.ps1
5. *(OPTIONAL)- If you don't want the version of openrct2.d.ts in the lib directory (and have a good reason for not wanting it, i.e. make sure you know what you're doing!) Then you may overwrite lib/openrct2.d.ts with the version you want
6. Make changes to source code, in the src directory
7. To compile the plugin to a single javascript file, run powershell/build.ps1
8. To deploy the compiled plugin to your local installation of OpenRCT2 for testing, run powershell/deploy.ps1
	- Alternatively, you may also manually copy bin/CrashEffects.js to your plugins directory
	- For convenience, you may run powershell/build_and_deploy.ps1 to execute both steps 7 and 8
9. To delete compiled files, run powershell/clean.ps1
10. Place any files that should be included in the release build in the distribution directory
11. To create a compressed release build, run powershell/create_release_build.ps1
	- This MUST be done after compiling the plugin!
	- The release will be at release/CrashEffects.zip