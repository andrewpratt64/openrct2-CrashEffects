// Andrew Pratt 2022

/// <reference path="../lib/openrct2.d.ts" />
/// <reference path="./TrackElemType.ts" />
/// <reference path="./ESurfaceStyles.ts" />


namespace CrashEffects
{
	// The value of 2π
	const PI2: number = Math.PI * 2;
	
	// Max value of strength for damage to be considered minor
	const DMG_MINOR: number = 0.334;
	// Max value of strength for damage to NOT be considered major
	const DMG_MEDIUM: number = 0.667;
	
	// The amount to penalize the park rating for every peep that was killed by a ride crashing
	// who was not actually on a ride. For reference, 25 points are penalized when a peep drowns
	// and 200 points are penalized when a ride train crashes with one or more peeps inside of it
	const OUT_OF_RIDE_CASUALTY_PENALTY: number = 150;
	
	// Each peep that was killed by a ride crashing who was not actually on a ride will penalize
	// the park score so that to total casualty penalty does not exceed this number. For reference,
	// a peep drowning will not raise the penalty higher than 1000 points and a ride train crashing
	// with one or more peeps inside of it will only penalize if less than 500 points have already
	// been penalized
	const OUT_OF_RIDE_CASUALTY_MAX_TOTAL_PENALTY = 700;
	
	// Amount of time in milliseconds to wait after a vehicle crashes to post a message to the user.
	// if another vehicle crashes before the delay has expired then the delay will reset.
	//const OUT_OF_RIDE_CASUALTY_MSG_DELAY = 4250;
	
	
	// The number of peeps that were killed by a ride crashing who were not actually on a ride who have yet to be
	// reported in an out-of-ride casualty message
	let casualtyCount: number = 0;
	
	// The name of the first peep who was killed by a ride crashing who was not actually on a ride and has yet to be reported
	// in an out-of-ride casualty message or null if no casualties have occurred
	let firstCasualtyName: null | string = null;
	
	// Handle to the timer handling the delay for the out-of-ride casualty message.
	// Will be null if no delay is currently active
	let outOfRideCasualtyMessageDelayHandle: null | number = null;
	
	// The time the delay for the out-of-ride casualty message last (re)started. Will become null after the
	// delay expires
	let outOfRideCasualtyMessageDelayStartTime: null | number = null;
	
	
	/**
	 * Subtract two 3-component vectors
	 * @param minuend Value to subtract from
	 * @param subtrahend Value to subtract from the minuend
	 * @return The difference; the result of minuend - subtrahend
	 */
	function vec3Subtract(minuend: CoordsXYZ, subtrahend: CoordsXYZ)
	{
		return {
			x: minuend.x - subtrahend.x,
			y: minuend.y - subtrahend.y,
			z: minuend.z - subtrahend.z
		};
	}


	/**
	 * Get the squared, scalar distance between two positions
	 * @param from Position to get squared distance, from this parameter to the "to" parameter
	 * @param to Position to get squared distance, from the "from" parameter to this parameter
	 * @return Squared, scalar distance from where "from" is to where "to" is
	 */
	function vec3DistSqr(from: CoordsXYZ, to: CoordsXYZ): number
	{
		let dx: number = to.x - from.x;
		let dy: number = to.y - from.y;
		let dz: number = to.z - from.z;

		return dx*dx + dy*dy + dz*dz;
	}

	/**
	 * Get the distance between two positions
	 * @param from Position to get distance, from this parameter to the "to" parameter
	 * @param to Position to get distance, from the "from" parameter to this parameter
	 * @detail Slower than vec3DistSqr
	 * @return Scalar distance from where "from" is to where "to" is
	 */
	function vec3Dist(from: CoordsXYZ, to: CoordsXYZ): number
	{
		return Math.sqrt(vec3DistSqr(from, to));
	}


	/**
	 * Displays a message to the user via an in-game "award"
	 * @param msg Message to display
	 */
	function easyMsg(msg: string): void
	{
		park.postMessage({
			type: "award",
			text: msg
		});
	}


	/**
	 * Kills a peep
	 * @param peep The peep to kill
	 */
	function killPeep(peep: (Guest | Staff))
	{
		// TODO: Test if peep is on ride
		try
		{
			// Remove the peep entity
			peep.remove();
		}
		catch (err)
		{}
	}

	/**
	 * Convert a non-tile coordinate to a tile coordinate
	 * @param v Value of coordinate to convert
	 * @return Tile coordinate
	 */
	function asTileCoord(v: CoordsXYZ): CoordsXYZ
	{
		return {
			// The ratio of non-tile coords to tile coords is 32:1,
			//	therefore each vector component should be divided by 32.
			// For any real number n, n/32 = n*0.03125
			x: v.x * 0.03125,
			y: v.y * 0.03125,
			z: v.z * 0.03125
		};
	}
	
	/**
	 * Convert a tile coordinate to a non-tile coordinate
	 * @param v Value of tile coordinate to convert
	 * @return Non-tile coordinate
	 */
	function asNonTileCoord(v: CoordsXYZ): CoordsXYZ
	{
		return {
			x: v.x * 32,
			y: v.y * 32,
			z: v.z * 32
		};
	}


	/**
	 * Get a position offset by a 2D polar coordinate
	 * @param pos Position to get offset from
	 * @param r Polar radius; the scalar distance to offset from pos
	 * @param theta Angle in radians to rotate offset by
	 * @return Position offset; an absolute position relative to pos offset by a 2-dimensional polar coordinate value along the XY coordinate plane
	 */
	function offsetBy2DPolar(pos: CoordsXYZ, r: number, theta: number): CoordsXYZ
	{
		return {
			x: pos.x + r * Math.cos(theta),
			y: pos.y + r * Math.sin(theta),
			z: pos.z
		};
	}


	/**
	 * Get the position of an entity
	 * @param ent Entity to get position from
	 * @return Entity's position as a CoordsXYZ object
	 */
	function getEntPos(ent: Entity): CoordsXYZ
	{
		return {
			x: ent.x,
			y: ent.y,
			z: ent.z
		};
	}


	/**
	 * Test if a given tile position is within the game map's bounds
	 * @param pos Tile position to test
	 * @return True if tile position is inside the map, false otherwise
	 */
	function isTilePosInsideMap(pos: CoordsXY): boolean
	{
		// Test if (0 < x <= mapWidth) and (0 < y <= mapHeight)
		return pos.x > 0 && pos.x <= map.size.x
		&& pos.y > 0 && pos.y <= map.size.y;
	}


	/**
	 * Test if a given track type occupies a 1x1 area
	 * @param trackType The track type to test
	 * @return True if a track tile element with a type of trackType occupies a 1x1 area, false otherwise
	 * @detail NOTE: The waterfall track type returns true since it's close enough to being 1x1
	 */
	function trackTypeIs1x1(trackType: number): boolean
	{
		return trackType >= 0
			&& trackType < TrackElemType.Count
			&& (
				trackType <= TrackElemType.Down25ToFlat
				|| (
					trackType >= TrackElemType.FlatToLeftBank
					&& trackType <= TrackElemType.RightBankToFlat
				)
				|| (
					trackType >= TrackElemType.LeftBankToUp25
					&& trackType <= TrackElemType.RightBank
				)
				|| (
					trackType >= TrackElemType.LeftQuarterTurn1Tile
					&& trackType <= TrackElemType.RightQuarterTurn1Tile
				)
				|| (
					trackType >= TrackElemType.FlatToUp60
					&& trackType <= TrackElemType.Down60ToFlat
				)
				|| (
					trackType >= TrackElemType.LeftQuarterTurn1TileUp60
					&& trackType <= TrackElemType.Maze
				)
				|| (
					trackType >= TrackElemType.Up25LeftBanked
					&& trackType <= TrackElemType.Down25RightBanked
				)
				|| (
					trackType >= TrackElemType.FlatToUp60LongBase
					&& trackType <= TrackElemType.FlatToDown60LongBase
				)
				|| (
					trackType >= TrackElemType.Up90
					&& trackType <= TrackElemType.BrakeForDrop
				)
				|| (
					trackType >= TrackElemType.LogFlumeReverser
					&& trackType <= TrackElemType.SpinningTunnel
				)
				|| (
					trackType >= TrackElemType.Up25ToLeftBankedUp25
					&& trackType <= TrackElemType.RightQuarterTurn1TileDown90
				)
				|| (
					trackType >= TrackElemType.Up25ToLeftBankedUp25
					&& trackType <= TrackElemType.RightQuarterTurn1TileDown90
				)
				|| trackType == TrackElemType.RotationControlToggle
				|| trackType == TrackElemType.FlatTrack1x1A
				|| trackType == TrackElemType.FlatTrack1x1B
				|| trackType == TrackElemType.FlatTrack1x1A_Alias
				|| trackType == TrackElemType.FlatTrack1x1B_Alias
			);
	}


	/**
	 * Test if a given track tile element occupies a 1x1 area
	 * @param elem The track tile element to test
	 * @return True if elem occupies a 1x1 area, false otherwise
	 */
	function trackElemIs1x1(elem: TrackElement): boolean
	{
		// If the track element has a non-zero value for it's sequence, then it's definetly bigger than 1x1
		if (elem.sequence != 0) return false;
		
		// If sequence is zero, return a value based on the track's numerical type
		return trackTypeIs1x1(elem.trackType);
	}
	
	
	
	
	
	/**
	 * Loads from the park file the remaining amount of time until a message is posted to the user informing them of out-of-ride casualties
	 * @return Remaining delay in milliseconds. Will be null if no delay was active when the park was last saved
	 */
	function loadOutOfRideCasualtyMessageRemainingDelay(): null | number
	{
		return context.getParkStorage().get<null | number>("CasualtyMsgDelay", null);
	}
	
	/**
	 * Saves to the park file the amount of time until a message is posted to the user informing them of out-of-ride casualties
	 * @param delay Remaining delay in milliseconds, or null if no delay is currently active
	 */
	function saveOutOfRideCasualtyMessageRemainingDelay(delay: null | number): void
	{
		context.getParkStorage().set<null | number>("CasualtyMsgDelay", delay);
	}
	
	
	/**
	 * Loads from the park file the number of peeps that were killed by a ride crashing who were not actually on a ride who have yet to be
	 * reported in an out-of-ride casualty message
	 * @return Number of killed peeps
	 */
	function loadCasualtyCount(): number
	{
		return context.getParkStorage().get<number>("CasualtyCount", 0);
	}
	
	/**
	 * Saves to the park file the number of currently registered peeps that were killed by a ride crashing who were not actually on a ride
	 * who have yet to be reported in an out-of-ride casualty message
	 * @casualtyCount Number of killed peeps
	 */
	function saveCasualtyCount(casualtyCount: number): void
	{
		context.getParkStorage().set<number>("CasualtyCount", casualtyCount);
	}
	
	
	/**
	 * Loads from the park file the name of the first peep who was killed by a ride crashing who was not actually on a ride and has yet to be reported
	 * in an out-of-ride casualty message
	 * @return The name of the peep. Will return null if no casualties have occurred
	 */
	function loadFirstCasualtyName(): null | string
	{
		return context.getParkStorage().get<null | string>("FirstCasualtyName", null);
	}
	
	/**
	 * Saves to the park file the name of the first peep who was killed by a ride crashing who was not actually on a ride and has yet to be reported
	 * in an out-of-ride casualty message
	 * @param name The name of the peep or null if no casualties have occurred
	 */
	function saveFirstCasualtyName(name: null | string): void
	{
		context.getParkStorage().set<null | string>("FirstCasualtyName", name);
	}
	
	
	/**
	 * Calculates the remaining amount of time until a message is posted to the user informing them of out-of-ride casualties
	 * @return Remaining delay in milliseconds. Will be null if no delay is active
	 */
	function getOutOfRideCasualtyMessageRemainingDelay(): null | number
	{
		// Return null if the delay isn't active
		if (outOfRideCasualtyMessageDelayStartTime == null)
			return null;
		
		// Else, return the difference between now and the time the delay started
		return Date.now() - outOfRideCasualtyMessageDelayStartTime;
	}
	
	
	/**
	 * Displays a message to the user informing them of peeps who were killed by
	 * a ride crashing who were not actually on a ride
	 */
	function displayOutOfRideCasualtyCountMessage()
	{
		// If only one peep was killed...
		if (casualtyCount == 1)
		{			
			// If the name of the peep that died is unknown, then display a message indicating one peep died
			if (firstCasualtyName == null)
			{
				park.postMessage({
					type: "blank",
					text: "1 person was indirectly killed in a ride accident"
				});
			}
			// Else display a message with the name of the peep
			else
			{
				park.postMessage({
					type: "blank",
					text: firstCasualtyName + " was indirectly killed in a ride accident"
				});
			}
		}
		// Else if two or more peeps were killed, then display a message with the number of casualties
		else if (casualtyCount > 1)
		{
			park.postMessage({
				type: "blank",
				text: casualtyCount + " people were indirectly killed in a ride accident"
			});
		}
	}
	
	
	/**
	 * Event handler that's called when the out-of-ride casualty message delay expires
	 */
	function onOutOfRideCasualtyMessageDelayExpired()
	{
		// Stop handling the delay
		stopOutOfRideCasualtyMessageDelay();
		
		// Display the out-of-ride casualty message
		displayOutOfRideCasualtyCountMessage();
		
		// Unset the first casualty name
		firstCasualtyName = null;
		
		// Set the casualty count to zero
		casualtyCount = 0;
		
		// unset the delay start time
		outOfRideCasualtyMessageDelayStartTime = null;
	}
	
	
	/**
	 * After a delay, posts a message to the user informing them of out-of-ride casualties
	 * @param The delay duration in milliseconds
	 * @warning If the delay is already counting down, this will create a second timer and the reference to the original will be lost
	 */
	function forceStartOutOfRideCasualtyMessageDelay(delay: number)
	{
		// Remember the time the delay started
		outOfRideCasualtyMessageDelayStartTime = Date.now();
		
		// Start invoking a callback function to update the delay value
		outOfRideCasualtyMessageDelayHandle = context.setTimeout(onOutOfRideCasualtyMessageDelayExpired, delay);
	}
	
	/**
	 * After a delay, posts a message to the user informing them of out-of-ride casualties
	 * @param The delay duration in milliseconds
	 */
	function startOutOfRideCasualtyMessageDelay(delay: number)
	{
		// Start invoking a callback function to update the delay value, if this isn't already being done
		if (outOfRideCasualtyMessageDelayHandle == null)
			forceStartOutOfRideCasualtyMessageDelay(delay);
	}
	
	/**
	 * Stops the delay for the out-of-ride casualty message if it's currently active
	 */
	function stopOutOfRideCasualtyMessageDelay()
	{
		// Stop invoking the delay's callback function, unless it already isn't being invoked
		if (outOfRideCasualtyMessageDelayHandle != null)
			context.clearInterval(outOfRideCasualtyMessageDelayHandle);
	}
	
	/**
	 * After a delay, posts a message to the user informing them of out-of-ride casualties
	 * @param The delay duration in milliseconds
	 * @remarks If the delay has already started, the delay will restart.
	 */
	function restartOutOfRideCasualtyMessageDelay(delay: number)
	{
		// Cancel the current countdown if one already exists
		stopOutOfRideCasualtyMessageDelay();
		
		// Start the delay
		forceStartOutOfRideCasualtyMessageDelay(delay);
	}
	
	/**
	 * Resumes the delay for the out-of-ride casualty message if it was previously started
	 */
	function resumeOutOfRideCasualtyMessageDelayIfNeeded()
	{
		// Load the remaining delay
		let timeLeft: null | number = loadOutOfRideCasualtyMessageRemainingDelay();
		
		// If there is still time left...
		if (timeLeft != null)
		{
			// ...set the stored start time of the delay relative to the remaining time left
			outOfRideCasualtyMessageDelayStartTime = Date.now() - timeLeft;
			
			// Resume the delay
			startOutOfRideCasualtyMessageDelay(timeLeft);
		}
	}
	
	
	/**
	 * Registers peeps that were killed by a ride crashing who were not actually on a ride
	 * @param newCasualtyCount The number of peeps that were killed
	 */
	function registerNewOutOfRideCasualties(newCasualtyCount: number): void
	{
		
		// Add to the registered casualty count
		casualtyCount += newCasualtyCount;
		
		// Start or restart the out-of-ride casualty message delay
		restartOutOfRideCasualtyMessageDelay(OUT_OF_RIDE_CASUALTY_MSG_DELAY);
	}


	/**
	 * Turns a given surface tile element into rubble
	 * @param elem Surface tile element to convert
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function convertSurfaceElementToRubble(elem: SurfaceElement, dmgStrength: number): void
	{
		// 	=Change surface style based on material and damage strength=
		// Minor damage
		if (dmgStrength <= DMG_MINOR)
		{
			switch (elem.surfaceStyle)
			{
				// Grass -> Grass Clumps
				case ESurfaceStyles.GRASS:
					elem.surfaceStyle = ESurfaceStyles.GRASS_CLUMPS;
					break;
				// Sand -> Brown Sand
				case ESurfaceStyles.SAND:
					elem.surfaceStyle = ESurfaceStyles.SAND_BROWN;
					break;
				// Ice -> Dirt
				case ESurfaceStyles.ICE:
					elem.surfaceStyle = ESurfaceStyles.DIRT;
					break;
				// No change for all other materials
			}
		}
		// Medium damage
		else if (dmgStrength <= DMG_MEDIUM)
		{
			// Everything except rock -> dirt
			if (elem.surfaceStyle != ESurfaceStyles.ROCK)
				elem.surfaceStyle = ESurfaceStyles.DIRT;
			// No change for rock
		}
		// Major damage
		else
			// Everything -> rock
			elem.surfaceStyle = ESurfaceStyles.ROCK;
	}


	/**
	 * Damages a given surface tile element
	 * @param elem Tile element to damage
	 * @param elemIndex Index of the tile element to damage
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function damageSurfaceTileElement(elem: SurfaceElement, elemIndex: number, dmgStrength: number): void
	{
		// Turn the surface to rubble
		convertSurfaceElementToRubble(elem, dmgStrength);
	}


	/**
	 * Breaks path additions on a given footpath
	 * @param elem Footpath tile element with additions to break
	 * @detail Does nothing if elem has no additions on it
	 */
	function breakFootpathAdditions(elem: FootpathElement)
	{
		// Break the footpath's additions, if it's not a queue and actually has additions
		if (!elem.isQueue && elem.addition != null)
			elem.isAdditionBroken = true;
	}


	/**
	 * Completely destroys a given footpath
	 * @param elemIndex Index of the footpath tile element to destroy
	 * @param tile Tile containing the footpath tile element to destroy
	 */
	function destroyFootpath(elemIndex: number, tile: Tile): void
	{
		// Just remove the footpath for now
		// TODO: Add special effects or something later if it's possible
		tile.removeElement(elemIndex);
	}


	/**
	 * Damages a given footpath tile element
	 * @param elem Footpath tile element to damage
	 * @param elemIndex Index of the footpath tile element to damage
	 * @param tile Tile containing the footpath tile element to damage
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function damageFootpath(elem: FootpathElement, elemIndex: number, tile: Tile, dmgStrength: number): void
	{
		// Both minor and medium damage break path additions
		if (dmgStrength <= DMG_MEDIUM)
			breakFootpathAdditions(elem);
		// Major damage destroys footpath entirely
		else
			destroyFootpath(elemIndex, tile);
	}


	/**
	 * Completely destroys a given small scenery tile element
	 * @param elemIndex Index of the scenery tile element to destroy
	 * @param tile Tile containing the scenery tile element to destroy
	 */
	function destroySmallScenery(elemIndex: number, tile: Tile): void
	{
		// Just remove the element for now
		// TODO: Add special effects or something later if it's possible
		tile.removeElement(elemIndex);
	}


	/**
	 * Damages a given small scenery tile element
	 * @param elem Scenery tile element to damage
	 * @param elemIndex Index of the scenery tile element to damage
	 * @param tile Tile containing the scenery tile element to damage
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function damageSmallScenery(elem: SmallSceneryElement, elemIndex: number, tile: Tile, dmgStrength: number)
	{
		// Destroy scenery if it's less than a tile large OR if it's a tile large and recieved more than minor damage
		if (elem.quadrant != 0 || dmgStrength > DMG_MINOR)
			destroySmallScenery(elemIndex, tile);
	}


	/**
	 * Completely destroys a given track tile element
	 * @param elemIndex Index of the track tile element to destroy
	 * @param tile Tile containing the track tile element to destroy
	 */
	function destroyTrackElement(elemIndex: number, tile: Tile): void
	{
		// Just remove the element for now
		// TODO: Add special effects or something later if it's possible
		tile.removeElement(elemIndex);
	}


	/**
	 * Damages a given track tile element
	 * @param elem Track tile element to damage
	 * @param elemIndex Index of the track tile element to damage
	 * @param tile Tile containing the track tile element to damage
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function damageTrack(elem: TrackElement, elemIndex: number, tile: Tile, dmgStrength: number)
	{
		// Major damage destroys 1x1 track pieces
		if (dmgStrength > DMG_MEDIUM && trackElemIs1x1(elem))
			destroyTrackElement(elemIndex, tile);
	}


	/**
	 * Completely destroys a given wall tile element
	 * @param elemIndex Index of the wall tile element to destroy
	 * @param tile Tile containing the wall tile element to destroy
	 */
	function destroyWall(elemIndex: number, tile: Tile): void
	{
		// Just remove the element for now
		// TODO: Add special effects or something later if it's possible
		tile.removeElement(elemIndex);
	}


	/**
	 * Damages a given wall tile element
	 * @param elem Wall tile element to damage
	 * @param elemIndex Index of the wall tile element to damage
	 * @param tile Tile containing the wall tile element to damage
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function damageWall(elem: WallElement, elemIndex: number, tile: Tile, dmgStrength: number): void
	{
		// Both medium and major damage destroy walls
		if (dmgStrength > DMG_MINOR)
			destroyWall(elemIndex, tile);
	}


	/**
	 * Damages a given tile element
	 * @param elem Tile element to damage
	 * @param elemIndex Index of the tile element to damage
	 * @param tile Tile containing the tile element to damage
	 * @param dmgStrength Strength of damage, where 0 is no damage and 1 is extreme damage
	 */
	function damageTileElement(elem: TileElement, elemIndex: number, tile: Tile, dmgStrength: number): void
	{
		// Damage the element, based on it's type
		// TODO: Large scenery items
		switch (elem.type)
		{
			// Terrain Surface
			case "surface":
				damageSurfaceTileElement(elem, elemIndex, dmgStrength);
				break;
			
			// Footpath
			case "footpath":
				damageFootpath(elem, elemIndex, tile, dmgStrength);
				break;
				
			// Small scenery
			case "small_scenery":
				damageSmallScenery(elem, elemIndex, tile, dmgStrength);
				break;
				
			// Track
			case "track":
				damageTrack(elem, elemIndex, tile, dmgStrength);
				break;
				
			// Wall
			case "wall":
				damageWall(elem, elemIndex, tile, dmgStrength);
			// TODO: What about "entrance" and "banner"?
		}
	}


	/**
	 * Creates rubble at a given tile element
	 * @param elemIndex Index of the tile element
	 * @param tile Tile containing the tile element
	 * @param tilePos Position of the tile containing the tile element
	 * @param rubbleCenter Central point of the rubble effect area
	 * @param affectRadius Maximum distance from rubbleCenter to create rubble
	 */
	function createRubbleAtTileElem(
		elemIndex: number,
		tile: Tile,
		tilePos: CoordsXYZ,
		rubbleCenter: CoordsXYZ,
		affectRadius: number
	): void
	{
		// Get the tile element
		let elem = tile.getElement(elemIndex);
		
		// Get the distance from the tile element to the destruction source
		let dist = vec3Dist(
			{
				x: tilePos.x,
				y: tilePos.y,
				// TODO: Why multiply the element heigh by 0.25? I forgot the specific reason it's needed
				//	^ This isn't already what baseZ is, is it?
				z: elem.baseHeight * 0.25
			},
			rubbleCenter
		);
		
		// Skip this tile element if it's not within the affect radius
		if (dist <= affectRadius)
		{
			// Calculate the damage strength to apply to this element
			let dmgStrength: number = 1 - (dist / affectRadius);
			
			// Damage the element, unless damage strength is zero
			if (dmgStrength > 0)
				damageTileElement(elem, elemIndex, tile, dmgStrength);
		}
		
		
	}


	/**
	 * Creates rubble at a given tile
	 * @param tilePos Position of the tile to create rubble at
	 * @param rubbleCenter Central point of the rubble effect area
	 * @param affectRadius Maximum distance from rubbleCenter to create rubble
	 */
	function createRubbleAtTile(tilePos: CoordsXYZ, rubbleCenter: CoordsXYZ, affectRadius: number): void
	{
		// Get the tile
		let tile: Tile = map.getTile(tilePos.x, tilePos.y)
		
		// Iterate over all (indices of) tile elements in this tile
		for (let i = 0; i < tile.numElements; ++i)
		{
			// Create rubble at this tile element
			createRubbleAtTileElem(i, tile, tilePos, rubbleCenter, affectRadius);
		}
	}
	
	
	/**
	 * Kills peeps within a given set of peeps, where a crashing ride is the cause of death
	 * @param peeps List of peeps to potentially kill
	 * @param crashPos Origin of the crash
	 * @param killRadius Maximum distance from pos to kill peeps
	 */
	function killPeepsFromCrash(peeps: (Guest | Staff)[], crashPos: CoordsXYZ, killRadius: number): void
	{
		// Define a variable to count how many peeps were killed
		let newCasualtyCount: number = 0;
		
		// Iterate over every peep
		for (let i: number = 0; i < peeps.length; ++i)
		{
			// For every peep that's close enough to the origin of the crash...
			if (vec3Dist(asTileCoord(getEntPos(peeps[i])), crashPos) <= killRadius)
			{
				// Remember the peep's name, if this is the first casualty
				if (firstCasualtyName == undefined)
					firstCasualtyName = peeps[i].name;
				
				// Kill the peep
				killPeep(peeps[i]);
				// Increase the park casualty penalty
				park.casualtyPenalty = Math.min(park.casualtyPenalty + OUT_OF_RIDE_CASUALTY_PENALTY, OUT_OF_RIDE_CASUALTY_MAX_TOTAL_PENALTY);
				// Increment the casualty counter
				++newCasualtyCount;
			}
		}
		
		// Register the new casualties, if any
		registerNewOutOfRideCasualties(newCasualtyCount);
	}
	
	
	/**
	 * Kills peeps on a given tile, where a crashing ride is the cause of death
	 * @param tilePos Position of the tile to kill peeps on
	 * @param crashPos Origin of the crash
	 * @param killRadius Maximum distance from pos to kill peeps
	 */
	function killPeepsOnTileFromCrash(tilePos: CoordsXY, crashPos: CoordsXYZ, killRadius: number): void
	{
		// Kill guests on the tile
		killPeepsFromCrash(map.getAllEntitiesOnTile("guest", tilePos), crashPos, killRadius);
		
		// Kill staff members on the tile
		killPeepsFromCrash(map.getAllEntitiesOnTile("staff", tilePos), crashPos, killRadius);
	}


	/**
	 * Creates crash effects at a given position
	 * @param pos Origin of the crash
	 * @param affectRadius Maximum distance from pos to affect
	 * @param killRadius Maximum distance from pos to kill peeps
	 */
	function crashEffectsAt(pos: CoordsXYZ, affectRadius: number, killRadius: number): void
	{
		// Iterate over scalar values of radius in the range [0, affectRadius)
		for (let r = 0; r < affectRadius; ++r)
		{
			// Figure out how much to rotate every step of iteration in radians
			// Note: This technically steps twice as many times as what's needed, but it's
			//	to prevent tiles being skipped
			let thetaStep: number = Math.PI / Math.max(1, 4 * r);
			
			// Iterate over angle values in radians in the range [0, 2PI)
			for (let theta = 0; theta < PI2; theta += thetaStep)
			{
				// Calculate the position of the current tile
				//	The position is the point theta radians along the side of a circle that's centered at pos with a radius of r
				let tilePos = offsetBy2DPolar(pos, r, theta);
				
				// If the tile is inside the map...
				if (isTilePosInsideMap(tilePos))
				{// Get tilePos as a CoordsXY object
					// ...Create rubble at this tile
					createRubbleAtTile(tilePos, pos, affectRadius);
					// Kill peeps on this tile
					killPeepsOnTileFromCrash({x: Math.trunc(tilePos.x * 32), y: Math.trunc(tilePos.y * 32)}, pos, killRadius);
				}
				
				
			}
		}
	}


	/**
	 * Callback for when the game is saved
	 */
	function onMapSave(): void
	{
		// Save data for this plugin
		saveOutOfRideCasualtyMessageRemainingDelay(getOutOfRideCasualtyMessageRemainingDelay());
		saveCasualtyCount(casualtyCount);
		saveFirstCasualtyName(firstCasualtyName);
	}
	
	
	/**
	 * Callback for when a vehicle crashes
	 * @param e Event args
	 */
	function onCrash(e: VehicleCrashArgs): void
	{
		// Radius of explosion damage
		const affectRadius = 3;
		// Max radius that kills peeps
		const killRadius = 2;
		
		// Create crash effects at the crash
		crashEffectsAt(asTileCoord(getEntPos(map.getEntity(e.id))), affectRadius, killRadius);
	}


	/**
	 * Called on plugin start
	 */
	function init(): void
	{
		// Load saved data
		// (loadOutOfRideCasualtyMessageRemainingDelay() is called within resumeOutOfRideCasualtyMessageDelayIfNeeded())
		casualtyCount = loadCasualtyCount();
		firstCasualtyName = loadFirstCasualtyName();
		
		// Resume the out-of-ride message delay if it was previously running
		resumeOutOfRideCasualtyMessageDelayIfNeeded();
		
		// Subscribe to game hook(s)
		context.subscribe("map.save", onMapSave);
		context.subscribe("vehicle.crash", onCrash);
	}

	export const CrashEffectsPluginMetadata: PluginMetadata = {
	//registerPlugin({
		name:		"Crash Effects",
		version:	"1.4",
		licence:	"https://github.com/andrewpratt64/openrct2-CrashEffects/blob/main/LICENSE.txt",
		authors:	["Andrew Pratt"],
		type:		"remote",
		main:		() => { init() }
	};
}


registerPlugin(CrashEffects.CrashEffectsPluginMetadata);