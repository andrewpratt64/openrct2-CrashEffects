// Andrew Pratt 2021

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
	 * Creates rubble at a given position
	 * @param pos Position to create rubble at
	 * @param affectRadius Maximum distance from pos to create rubble
	 */
	function createRubbleAt(pos: CoordsXYZ, affectRadius: number): void
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
				
				// Create rubble at this tile, as long as it's inside the map
				if (isTilePosInsideMap(tilePos))
					createRubbleAtTile(tilePos, pos, affectRadius);
			}
		}
	}


	/**
	 * Called on vehicle crash
	 * @param e Event args
	 */
	function onCrash(e: VehicleCrashArgs): void
	{
		// Create rubble at the crash
		createRubbleAt(asTileCoord(getEntPos(map.getEntity(e.id))), 3);
	}


	/**
	 * Called on plugin start
	 */
	function init(): void
	{
		// Context subscribe(s)
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