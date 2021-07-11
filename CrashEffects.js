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

// Collection of key-value pairs for crashed vehicle cars already handled by this plugin
// Key is entity id
// Value is boolean; true if vehicle has crashed and exploded, false if still crashing
// Implemented as an array of "pairs" (which are just arrays with two entries,
//	where [0] is key and [1] is value) since ES5 dosen't support Map type :(
var handledCrashes = [];



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
				}
			}
		}
	}
}


// Called on every game tick
var onTick = function(e, g)
{
	//var mem = context.sharedStorage;
	
	// Iterate over all previously handled car crashes
	for (var i in handledCrashes)
	{
		// Delete the entry in the array if the car no longer exists, or if it previously crashed and is no longer crashed
		var car = map.getEntity(handledCrashes[i][0]);
		if (car == null || (handledCrashes[i][1] && car.status != "crashed"))
			delete handledCrashes[i];
	};
	
	// Iterate over all cars in the map
	var cars = map.getAllEntities("car");
	for (var i in cars)
	{
		// If the car is crashing and has NOT been handled yet, register it as crashing
		// I really want to use Map here :(
		var car = cars[i];
		if (car.status == "crashing")
		{
			var bCarNotHandled = true;
			for (var j in handledCrashes)
			{
				if (handledCrashes[j][0] == car.id)
				{
					bCarNotHandled = false;
					break;
				}
			}
			if (bCarNotHandled)
				handledCrashes.push([car.id, false]);
		}
		// Else, if the car is crashed and has started being handled, register it as crashed and create rubble
		else if (car.status == "crashed")
		{
			for (var j in handledCrashes)
			{
				if (handledCrashes[j][0] == car.id && handledCrashes[j][1] == false)
				{
					handledCrashes[j][1] = true;
					createRubbleAt(toTileCoords(getEntPosAsVec3(car)), 3);
					break;
				}
			}
		}
	}
}


// Called on plugin start
var init = function()
{
	// Context subscribe(s)
	context.subscribe("interval.tick", onTick);
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
			console.log("__MyTest.js ERROR: " + e);
		}
	}
	else
		init();
}


registerPlugin({
    name:		"Crash Effects",
    version:	"1.0",
    licence:	"https://github.com/andrewpratt64/openrct2-CrashEffects/blob/main/LICENSE.txt",
    authors:	["Andrew Pratt"],
    type:		"remote",
    main:		main
});