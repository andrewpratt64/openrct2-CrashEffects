// Andrew Pratt 2021


//	== CONSTANTS ==

// Pi * 2
const PI2 = Math.PI * 2;
// Max value of strength for damage to be considered minor
const DMG_MINOR = 0.334;
// Max value of strength for damage to NOT be considered major
const DMG_MEDIUM = 0.667;


	

// Enum for all different surface styles
const ESURFACE_STYLES = {
	GRASS: 0,
	SAND: 1,
	DIRT: 2,
	ROCK: 3,
	MARTIAN: 4,
	CHECKERBOARD: 5,
	GRASS_CLUMPS: 6,
	ICE: 7,
	GRID_RED: 8,
	GRID_YELLOW: 9,
	GRID_PURPLE: 10,
	GRID_GREEN: 11,
	SAND_RED: 12,
	SAND_BROWN: 13
};

// Enum for all track types
// See namespace TrackElemType in: https://github.com/OpenRCT2/OpenRCT2/blob/develop/src/openrct2/ride/Track.h
const ETRACK_TYPES = {
	Flat: 0,
	EndStation: 1,
	BeginStation: 2,
	MiddleStation: 3,
	Up25: 4,
	Up60: 5,
	FlatToUp25: 6,
	Up25ToUp60: 7,
	Up60ToUp25: 8,
	Up25ToFlat: 9,
	Down25: 10,
	Down60: 11,
	FlatToDown25: 12,
	Down25ToDown60: 13,
	Down60ToDown25: 14,
	Down25ToFlat: 15,
	LeftQuarterTurn5Tiles: 16,
	RightQuarterTurn5Tiles: 17,
	FlatToLeftBank: 18,
	FlatToRightBank: 19,
	LeftBankToFlat: 20,
	RightBankToFlat: 21,
	BankedLeftQuarterTurn5Tiles: 22,
	BankedRightQuarterTurn5Tiles: 23,
	LeftBankToUp25: 24,
	RightBankToUp25: 25,
	Up25ToLeftBank: 26,
	Up25ToRightBank: 27,
	LeftBankToDown25: 28,
	RightBankToDown25: 29,
	Down25ToLeftBank: 30,
	Down25ToRightBank: 31,
	LeftBank: 32,
	RightBank: 33,
	LeftQuarterTurn5TilesUp25: 34,
	RightQuarterTurn5TilesUp25: 35,
	LeftQuarterTurn5TilesDown25: 36,
	RightQuarterTurn5TilesDown25: 37,
	SBendLeft: 38,
	SBendRight: 39,
	LeftVerticalLoop: 40,
	RightVerticalLoop: 41,
	LeftQuarterTurn3Tiles: 42,
	RightQuarterTurn3Tiles: 43,
	LeftBankedQuarterTurn3Tiles: 44,
	RightBankedQuarterTurn3Tiles: 45,
	LeftQuarterTurn3TilesUp25: 46,
	RightQuarterTurn3TilesUp25: 47,
	LeftQuarterTurn3TilesDown25: 48,
	RightQuarterTurn3TilesDown25: 49,
	LeftQuarterTurn1Tile: 50,
	RightQuarterTurn1Tile: 51,
	LeftTwistDownToUp: 52,
	RightTwistDownToUp: 53,
	LeftTwistUpToDown: 54,
	RightTwistUpToDown: 55,
	HalfLoopUp: 56,
	HalfLoopDown: 57,
	LeftCorkscrewUp: 58,
	RightCorkscrewUp: 59,
	LeftCorkscrewDown: 60,
	RightCorkscrewDown: 61,
	FlatToUp60: 62,
	Up60ToFlat: 63,
	FlatToDown60: 64,
	Down60ToFlat: 65,
	TowerBase: 66,
	TowerSection: 67,
	FlatCovered: 68,
	Up25Covered: 69,
	Up60Covered: 70,
	FlatToUp25Covered: 71,
	Up25ToUp60Covered: 72,
	Up60ToUp25Covered: 73,
	Up25ToFlatCovered: 74,
	Down25Covered: 75,
	Down60Covered: 76,
	FlatToDown25Covered: 77,
	Down25ToDown60Covered: 78,
	Down60ToDown25Covered: 79,
	Down25ToFlatCovered: 80,
	LeftQuarterTurn5TilesCovered: 81,
	RightQuarterTurn5TilesCovered: 82,
	SBendLeftCovered: 83,
	SBendRightCovered: 84,
	LeftQuarterTurn3TilesCovered: 85,
	RightQuarterTurn3TilesCovered: 86,
	LeftHalfBankedHelixUpSmall: 87,
	RightHalfBankedHelixUpSmall: 88,
	LeftHalfBankedHelixDownSmall: 89,
	RightHalfBankedHelixDownSmall: 90,
	LeftHalfBankedHelixUpLarge: 91,
	RightHalfBankedHelixUpLarge: 92,
	LeftHalfBankedHelixDownLarge: 93,
	RightHalfBankedHelixDownLarge: 94,
	LeftQuarterTurn1TileUp60: 95,
	RightQuarterTurn1TileUp60: 96,
	LeftQuarterTurn1TileDown60: 97,
	RightQuarterTurn1TileDown60: 98,
	Brakes: 99,
	RotationControlToggleAlias: 100,
	Booster: 100,
	Maze: 101,
	// Used by the multi-dimension coaster, as TD6 cannot handle index 255.
	InvertedUp90ToFlatQuarterLoopAlias: 101,
	LeftQuarterBankedHelixLargeUp: 102,
	RightQuarterBankedHelixLargeUp: 103,
	LeftQuarterBankedHelixLargeDown: 104,
	RightQuarterBankedHelixLargeDown: 105,
	LeftQuarterHelixLargeUp: 106,
	RightQuarterHelixLargeUp: 107,
	LeftQuarterHelixLargeDown: 108,
	RightQuarterHelixLargeDown: 109,
	Up25LeftBanked: 110,
	Up25RightBanked: 111,
	Waterfall: 112,
	Rapids: 113,
	OnRidePhoto: 114,
	Down25LeftBanked: 115,
	Down25RightBanked: 116,
	Watersplash: 117,
	FlatToUp60LongBase: 118,
	Up60ToFlatLongBase: 119,
	Whirlpool: 120,
	Down60ToFlatLongBase: 121,
	FlatToDown60LongBase: 122,
	CableLiftHill: 123,
	ReverseFreefallSlope: 124,
	ReverseFreefallVertical: 125,
	Up90: 126,
	Down90: 127,
	Up60ToUp90: 128,
	Down90ToDown60: 129,
	Up90ToUp60: 130,
	Down60ToDown90: 131,
	BrakeForDrop: 132,
	LeftEighthToDiag: 133,
	RightEighthToDiag: 134,
	LeftEighthToOrthogonal: 135,
	RightEighthToOrthogonal: 136,
	LeftEighthBankToDiag: 137,
	RightEighthBankToDiag: 138,
	LeftEighthBankToOrthogonal: 139,
	RightEighthBankToOrthogonal: 140,
	DiagFlat: 141,
	DiagUp25: 142,
	DiagUp60: 143,
	DiagFlatToUp25: 144,
	DiagUp25ToUp60: 145,
	DiagUp60ToUp25: 146,
	DiagUp25ToFlat: 147,
	DiagDown25: 148,
	DiagDown60: 149,
	DiagFlatToDown25: 150,
	DiagDown25ToDown60: 151,
	DiagDown60ToDown25: 152,
	DiagDown25ToFlat: 153,
	DiagFlatToUp60: 154,
	DiagUp60ToFlat: 155,
	DiagFlatToDown60: 156,
	DiagDown60ToFlat: 157,
	DiagFlatToLeftBank: 158,
	DiagFlatToRightBank: 159,
	DiagLeftBankToFlat: 160,
	DiagRightBankToFlat: 161,
	DiagLeftBankToUp25: 162,
	DiagRightBankToUp25: 163,
	DiagUp25ToLeftBank: 164,
	DiagUp25ToRightBank: 165,
	DiagLeftBankToDown25: 166,
	DiagRightBankToDown25: 167,
	DiagDown25ToLeftBank: 168,
	DiagDown25ToRightBank: 169,
	DiagLeftBank: 170,
	DiagRightBank: 171,
	LogFlumeReverser: 172,
	SpinningTunnel: 173,
	LeftBarrelRollUpToDown: 174,
	RightBarrelRollUpToDown: 175,
	LeftBarrelRollDownToUp: 176,
	RightBarrelRollDownToUp: 177,
	LeftBankToLeftQuarterTurn3TilesUp25: 178,
	RightBankToRightQuarterTurn3TilesUp25: 179,
	LeftQuarterTurn3TilesDown25ToLeftBank: 180,
	RightQuarterTurn3TilesDown25ToRightBank: 181,
	PoweredLift: 182,
	LeftLargeHalfLoopUp: 183,
	RightLargeHalfLoopUp: 184,
	RightLargeHalfLoopDown: 185,
	LeftLargeHalfLoopDown: 186,
	LeftFlyerTwistUp: 187,
	RightFlyerTwistUp: 188,
	LeftFlyerTwistDown: 189,
	RightFlyerTwistDown: 190,
	FlyerHalfLoopUp: 191,
	FlyerHalfLoopDown: 192,
	LeftFlyerCorkscrewUp: 193,
	RightFlyerCorkscrewUp: 194,
	LeftFlyerCorkscrewDown: 195,
	RightFlyerCorkscrewDown: 196,
	HeartLineTransferUp: 197,
	HeartLineTransferDown: 198,
	LeftHeartLineRoll: 199,
	RightHeartLineRoll: 200,
	MinigolfHoleA: 201,
	MinigolfHoleB: 202,
	MinigolfHoleC: 203,
	MinigolfHoleD: 204,
	MinigolfHoleE: 205,
	MultiDimInvertedFlatToDown90QuarterLoop: 206,
	Up90ToInvertedFlatQuarterLoop: 207,
	InvertedFlatToDown90QuarterLoop: 208,
	LeftCurvedLiftHill: 209,
	RightCurvedLiftHill: 210,
	LeftReverser: 211,
	RightReverser: 212,
	AirThrustTopCap: 213,
	AirThrustVerticalDown: 214,
	AirThrustVerticalDownToLevel: 215,
	BlockBrakes: 216,
	LeftBankedQuarterTurn3TileUp25: 217,
	RightBankedQuarterTurn3TileUp25: 218,
	LeftBankedQuarterTurn3TileDown25: 219,
	RightBankedQuarterTurn3TileDown25: 220,
	LeftBankedQuarterTurn5TileUp25: 221,
	RightBankedQuarterTurn5TileUp25: 222,
	LeftBankedQuarterTurn5TileDown25: 223,
	RightBankedQuarterTurn5TileDown25: 224,
	Up25ToLeftBankedUp25: 225,
	Up25ToRightBankedUp25: 226,
	LeftBankedUp25ToUp25: 227,
	RightBankedUp25ToUp25: 228,
	Down25ToLeftBankedDown25: 229,
	Down25ToRightBankedDown25: 230,
	LeftBankedDown25ToDown25: 231,
	RightBankedDown25ToDown25: 232,
	LeftBankedFlatToLeftBankedUp25: 233,
	RightBankedFlatToRightBankedUp25: 234,
	LeftBankedUp25ToLeftBankedFlat: 235,
	RightBankedUp25ToRightBankedFlat: 236,
	LeftBankedFlatToLeftBankedDown25: 237,
	RightBankedFlatToRightBankedDown25: 238,
	LeftBankedDown25ToLeftBankedFlat: 239,
	RightBankedDown25ToRightBankedFlat: 240,
	FlatToLeftBankedUp25: 241,
	FlatToRightBankedUp25: 242,
	LeftBankedUp25ToFlat: 243,
	RightBankedUp25ToFlat: 244,
	FlatToLeftBankedDown25: 245,
	FlatToRightBankedDown25: 246,
	LeftBankedDown25ToFlat: 247,
	RightBankedDown25ToFlat: 248,
	LeftQuarterTurn1TileUp90: 249,
	RightQuarterTurn1TileUp90: 250,
	LeftQuarterTurn1TileDown90: 251,
	RightQuarterTurn1TileDown90: 252,
	MultiDimUp90ToInvertedFlatQuarterLoop: 253,
	MultiDimFlatToDown90QuarterLoop: 254,
	MultiDimInvertedUp90ToFlatQuarterLoop: 255,
	RotationControlToggle: 256,
	FlatTrack1x4A: 257,
	FlatTrack2x2: 258,
	FlatTrack4x4: 259,
	FlatTrack2x4: 260,
	FlatTrack1x5: 261,
	FlatTrack1x1A: 262,
	FlatTrack1x4B: 263,
	FlatTrack1x1B: 264,
	FlatTrack1x4C: 265,
	FlatTrack3x3: 266,
	Count: 267,
	None: 65535,
	FlatTrack1x4A_Alias: 95,
	FlatTrack2x2_Alias: 110,
	FlatTrack4x4_Alias: 111,
	FlatTrack2x4_Alias: 115,
	FlatTrack1x5_Alias: 116,
	FlatTrack1x1A_Alias: 118,
	FlatTrack1x4B_Alias: 119,
	FlatTrack1x1B_Alias: 121,
	FlatTrack1x4C_Alias: 122,
	FlatTrack3x3_Alias: 123
};


// Displays a message to the user via an in-game "award"
//	msg (string): Message to display
var easyMsg = function(msg)
{
	park.postMessage({
		type: "award",
		text: msg
	});
}


// Returns the distance squared between 3D points a and b
var vec3DistSqr = function(a, b)
{
	var dx = b.x - a.x;
	var dy = b.y - a.y;
	var dz = b.z - a.z;
	
	
	return dx*dx + dy*dy + dz*dz;
}

// Returns the distance between 3D points a and b
//	Slower than vec3DistSqr
var vec3Dist = function(a, b)
{
	return Math.sqrt(vec3DistSqr(a, b));
}


// Gets a 3-component vector from an entities position
//	ent: Entity to get position from
var getEntPosAsVec3 = function(ent)
{
	return {
		x: ent.x,
		y: ent.y,
		z: ent.z
	};
}

// Converts coords to tile coords
//	pos (vec3 obj): Position to convert to tile coords
var toTileCoords = function(pos)
{
	return {
		// For any real number n, n/32 = n*0.03125
		x: pos.x * 0.03125,
		y: pos.y * 0.03125,
		z: pos.z * 0.03125
	};
}

// Converts tile coords to normal (or whatever you call it) coords
//	pos (vec3 obj): Position in tile coords to convert
var fromTileCoords = function(pos)
{
	return {
		x: pos.x * 32,
		y: pos.y * 32,
		z: pos.z * 32
	};
}


// Create an entry in an object if it dosen't already exist
//	obj (object): Object to test and possibly insert into
//	key (any): Key to test. If key dosen't exist inside obj, a value will be inserted at obj[key]
//	defaultVal: Value to insert if key dosen't exist in obj
var emplace = function(obj, key, defaultVal)
{
	if (!obj.hasOwnProperty(key))
		obj.set(key, defaultVal);
	return obj[key];
}

// Create an entry in a Configuration object (ex. context.sharedStorage) if it dosen't already exist
//	obj (Configuration object): Object to test and possibly insert into
//	key (any): Key to test, including namespace. If key dosen't exist inside obj, a value will be inserted at obj[key]
//	defaultVal: Value to insert if key dosen't exist in obj
var configurationEmplace = function(obj, key, defaultVal)
{
	if (!obj.has(key))
		obj.set(key, defaultVal);
	return obj.get(key);
}


// Returns true if a given track type occupies a 1x1 tile, false otherwise
// NOTE: The waterfall track type returns true since it's close enough to being 1x1
//	trackType (ETRACK_TYPES): The track type to test
var trackTypeIs1x1 = function(trackType)
{
	return trackType >= 0
	&& trackType < ETRACK_TYPES.Count
	&& (
		trackType <= ETRACK_TYPES.Down25ToFlat
		|| (
			trackType >= ETRACK_TYPES.FlatToLeftBank
			&& trackType <= ETRACK_TYPES.RightBankToFlat
		)
		|| (
			trackType >= ETRACK_TYPES.LeftBankToUp25
			&& trackType <= ETRACK_TYPES.RightBank
		)
		|| (
			trackType >= ETRACK_TYPES.LeftQuarterTurn1Tile
			&& trackType <= ETRACK_TYPES.RightQuarterTurn1Tile
		)
		|| (
			trackType >= ETRACK_TYPES.FlatToUp60
			&& trackType <= ETRACK_TYPES.Down60ToFlat
		)
		|| (
			trackType >= ETRACK_TYPES.LeftQuarterTurn1TileUp60
			&& trackType <= ETRACK_TYPES.Maze
		)
		|| (
			trackType >= ETRACK_TYPES.Up25LeftBanked
			&& trackType <= ETRACK_TYPES.Down25RightBanked
		)
		|| (
			trackType >= ETRACK_TYPES.FlatToUp60LongBase
			&& trackType <= ETRACK_TYPES.FlatToDown60LongBase
		)
		|| (
			trackType >= ETRACK_TYPES.Up90
			&& trackType <= ETRACK_TYPES.BrakeForDrop
		)
		|| (
			trackType >= ETRACK_TYPES.LogFlumeReverser
			&& trackType <= ETRACK_TYPES.SpinningTunnel
		)
		|| (
			trackType >= ETRACK_TYPES.Up25ToLeftBankedUp25
			&& trackType <= ETRACK_TYPES.RightQuarterTurn1TileDown90
		)
		|| (
			trackType >= ETRACK_TYPES.Up25ToLeftBankedUp25
			&& trackType <= ETRACK_TYPES.RightQuarterTurn1TileDown90
		)
		|| trackType == ETRACK_TYPES.RotationControlToggle
		|| trackType == ETRACK_TYPES.FlatTrack1x1A
		|| trackType == ETRACK_TYPES.FlatTrack1x1B
		|| trackType == ETRACK_TYPES.FlatTrack1x1A_Alias
		|| trackType == ETRACK_TYPES.FlatTrack1x1B_Alias
	);
}


// Returns true if a given track element occupies a 1x1 tile, false otherwise
//	elem (obj): The track element to test
var trackElemIs1x1 = function(elem)
{
	// If the track element has a non-zero value for it's sequence,
	// it's definetly bigger than 1x1
	if (elem.sequence != 0) return false;
	
	// If sequence is zero, return a value based on it's numerical type
	return trackTypeIs1x1(elem.trackType);
}


// Gets the top SurfaceElement at the given x and y tile coords
//	x (number): X Coord
//	y (number): Y Coord
var getSurfaceElemAt = function(x, y)
{
	// Bail if given coords aren't inside the map
	if (x < 0 || x > map.size.x || y < 0 || y > map.size.y)
		return null;
	
	// Get the tile at the coords
	var tile = map.getTile(x, y);
	
	// Iterate over all elements at the tile
	for (var i = 0; i < tile.numElements; ++i)
	{
		var elem = tile.getElement(i);
		// If this element is a surface element, return it
		if (elem.type == "surface")
			return elem;
	}
	
	// Return null if no surface element was found
	return null;
}


// Turns a given SurfaceElement into rubble
//	surfElem (SurfaceElement object): Surface element to affect
//	strength (float): Strength of damage, where 0 is no damage and 1 is very damaged
var convertSurfaceElementToRubble = function(surfElem, strength)
{
	// Bail if no damage
	if (strength <= 0)
		return;
	
	// Change surface style based on material and strength
	if (strength <= DMG_MINOR)
	{
		switch (surfElem.surfaceStyle)
		{
			case ESURFACE_STYLES.GRASS:
				surfElem.surfaceStyle = ESURFACE_STYLES.GRASS_CLUMPS;
				break;
			case ESURFACE_STYLES.SAND:
				surfElem.surfaceStyle = ESURFACE_STYLES.SAND_BROWN;
				break;
			case ESURFACE_STYLES.ICE:
				surfElem.surfaceStyle = ESURFACE_STYLES.DIRT;
				break;
		}
	}
	else if (strength <= DMG_MEDIUM)
	{
		if (surfElem.surfaceStyle != ESURFACE_STYLES.ROCK)
			surfElem.surfaceStyle = ESURFACE_STYLES.DIRT;
	}
	else
		surfElem.surfaceStyle = ESURFACE_STYLES.ROCK;
}


// Damages a given footpath
//	tile (Tile object): Tile containing footpath
//	elemIndex (int): Index of footpath to damage in tile
//	strength (float): Strength of damage, where 0 is no damage and 1 is very damaged
var breakFootpath = function(tile, elemIndex, strength)
{
	// Bail if no damage
	if (strength <= 0)
		return;
	
	// Get footpath element
	var elem = tile.getElement(elemIndex);
	
	// Both minor and medium damage break path additions
	if (strength <= DMG_MEDIUM)
	{
		if (!elem.isQueue && elem.addition != null)
			elem.isAdditionBroken = true;
	}
	// Major damage destroys footpath entirely
	else
		tile.removeElement(elemIndex);
}


// Damages a given small scenery element
//	tile (Tile object): Tile containing scenery
//	elemIndex (int): Index of scenery element to damage in tile
//	strength (float): Strength of damage, where 0 is no damage and 1 is very damaged
var breakSmallScenery = function(tile, elemIndex, strength)
{
	// Bail if no damage
	if (strength <= 0)
		return;
	
	// Get scenery element
	var elem = tile.getElement(elemIndex);
	
	// Small scenery that takes up a full tile's width isn't destroyed by minor damage,
	// everything else is
	if (elem.quadrant != 0 || strength > DMG_MINOR)
		tile.removeElement(elemIndex);
}


// Damages a given large scenery element
//	tile (Tile object): Tile containing scenery
//	elemIndex (int): Index of scenery element to damage in tile
//	strength (float): Strength of damage, where 0 is no damage and 1 is very damaged
var breakLargeScenery = function(tile, elemIndex, strength)
{
	throw "NOT IMPLEMENTED";
	
	// Bail if no damage
	if (strength <= 0)
		return;
	
	// Get scenery element
	var elem = tile.getElement(elemIndex);
	
	// Both minor and medium damage break large scenery
	if (strength <= DMG_MEDIUM)
	{
		
	}
	// Major damage destroys large scenery entirely
	else
		tile.removeElement(elemIndex);
}


// Damages a given track element
//	tile (Tile object): Tile containing track
//	elemIndex (int): Index of track element to damage in tile
//	strength (float): Strength of damage, where 0 is no damage and 1 is very damaged
var breakTrack = function(tile, elemIndex, strength)
{
	// Get track element
	var elem = tile.getElement(elemIndex);
	
	// Don't delete parts of flat rides, it looks weird
	/*if (elem.trackType == TRACK_TYPE_FLAT_RIDE)
		return;*/
	
	// Major damage destroys 1x1 track pieces
	if (strength > DMG_MEDIUM && trackElemIs1x1(elem))
		tile.removeElement(elemIndex);
}


// Damages a given wall element
//	tile (Tile object): Tile containing wall
//	elemIndex (int): Index of wall element to damage in tile
//	strength (float): Strength of damage, where 0 is no damage and 1 is very damaged
var breakWall = function(tile, elemIndex, strength)
{
	// Bail if no damage
	if (strength <= 0)
		return;
	
	// Both medium and major damage break walls
	if (strength > DMG_MINOR)
		tile.removeElement(elemIndex);
}


// Creates rubble at a given position
//	pos (vec3 object): Position to create rubble at. Should be an object with keys "x", "y", and "z"
//	affectRadius (number): Distance from pos to create rubble at
var createRubbleAt = function(pos, affectRadius)
{
	// Iterate over every map tile within the affect radius
	for (var r = 0; r < affectRadius; ++r)
	{
		// Note: This technically steps twice as many times as what's needed, but it's
		//	to prevent tiles being skipped
		thetaStep = Math.PI / Math.max(1, 4 * r);
		for (var theta = 0; theta < PI2; theta += thetaStep)
		{
			// Calculate the position of the current tile (excluding z)
			var tilePos = {
				x: pos.x + r * Math.cos(theta),
				y: pos.y + r * Math.sin(theta),
				z: pos.z
			};
			
			// Skip this tile if it's coords aren't inside the map
			if (tilePos.x < 0 || tilePos.x > map.size.x || tilePos.y < 0 || tilePos.y > map.size.y)
				continue;
			
			// Get the tile at the coords
			var tile = map.getTile(tilePos.x, tilePos.y);
			
			// Iterate over all elements at the tile
			for (var i = 0; i < tile.numElements; ++i)
			{
				// Get the next element in the tile
				var elem = tile.getElement(i);
				
				// Get the distance from pos to the element
				var dist = vec3Dist(
					{
						x: tilePos.x,
						y: tilePos.y,
						z: elem.baseHeight * 0.25
					},
					pos
				);
				
				// Skip this element if it's not within the affect radius
				if (dist > affectRadius)
					continue;
				
				// Calculate the damage strength to apply to this element
				var dmgStrength = 1 - (dist / affectRadius);
				
				// Damage the element, based on it's type
				switch (elem.type)
				{
					// Terrain Surface
					case "surface":
						// Turn the surface to rubble
						convertSurfaceElementToRubble(elem, dmgStrength);
						break;
					
					// Footpath
					case "footpath":
						breakFootpath(tile, i, dmgStrength);
						break;
						
					// Small scenery
					case "small_scenery":
						breakSmallScenery(tile, i, dmgStrength);
						break;
						
					// Track
					case "track":
						breakTrack(tile, i, dmgStrength);
						break;
						
					// Wall
					case "wall":
						breakWall(tile, i, dmgStrength);
				}
			}
		}
	}
}


// Called on vehicle crash
var onCrash = function(e)
{
	createRubbleAt(toTileCoords(getEntPosAsVec3(map.getEntity(e.id))), 3);
}


// Called on plugin start
var init = function()
{
	// Context subscribe(s)
	context.subscribe("vehicle.crash", onCrash);
}


var main = function()
{
	const USE_TRYCATCH = false;
	
	if (USE_TRYCATCH)
	{
		try
		{
			init();
		}
		catch (e)
		{
			console.log("CrashEffects.js ERROR: " + e);
		}
	}
	else
		init();
}


registerPlugin({
    name:		"Crash Effects",
    version:	"1.2",
    licence:	"https://github.com/andrewpratt64/openrct2-CrashEffects/blob/main/LICENSE.txt",
    authors:	["Andrew Pratt"],
    type:		"remote",
    main:		main
});