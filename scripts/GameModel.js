/**
 * Game model
 */
ij.GameModel = (function() {
	/** Location and name of level description files */
	var LEVEL_FILE_PREFIX = "assets/json/";
	var LEVEL_FILES = {
		"1": "level01.json",
		"2": "level02.json"
	};

	/** Background elements sprite table */
	var BACKGROUND_SPRITES = {
		" ": "road",
		"*": "goal",
		"x": "wall_center",
		"c": "wall_lt",
		"l": "wall_l",
		"e": "wall_lb",
		"b": "wall_b",
		"f": "wall_rb",
		"r": "wall_r",
		"d": "wall_rt",
		"t": "wall_t",
		"p": "wall_lo",
		"q": "wall_ro",
		"u": "wall_to",
		"w": "wall_bo",
		"v": "vall_v",
		"h": "wall_h",
		"o": "wall_single"
	};

	/** Table to calculate the type of background wall cell based on existence of walls in adjacent cells */
	var BG_CONVERT_TABLE = "opqhufebwdctvrlx";

	/** The current level data */
	var currentLevel = null;

	/** Object constructor */
	var objectConstructors = {};

	var isLevelCompleted = false;
	
	/** Load specified level form server and set it up */
	function loadLevel(levelId, callback) {
		var levelFileName = LEVEL_FILES[levelId];
		if(!levelFileName) {
			callback('Invalid level id ' + levelId);
			return;
		}
		ij.Util.ajax(LEVEL_FILE_PREFIX + levelFileName, function (err, json) {
			if(err) {
				callback(err);
			} else {
				currentLevel = json;
				currentLevel.id = levelId;
				
				if(!prepareLevelData()) {
					callback('Bad level data');
					currentLevel = null;
					return;
				}

				if(!setupScene()) {
					callback('Cannot setup scene');
					currentLevel = null;
					return;
				}

				ij.App.log.info('Level loaded: ' + levelId);
				callback(null);
			}
		}, {
			json: true
		});
	}

	/** Prepare level object after loading */
	function prepareLevelData() {
		// Check level data integrity
		var error = false;
		var width = currentLevel.dimension.width;
		var height = currentLevel.dimension.height;

		// Calculate specific type of background depending on cells around
		var x, y, row, newRow, cell, newCell, left, right, top, bottom;
		for(y = 0; y < height; ++ y) {
			if(!currentLevel.background[y]) {
				ij.App.log.error('No background data string for y=' + y);
				error = true;
			} else {
				row = currentLevel.background[y];
				newRow = '';
				for(x = 0; x < width; ++ x) {
					cell = row[x];
					if(!cell) {
						ij.App.log.error('No background data character for x=' + x + ', y=' + y);
						error = true;
					} else if(cell == 'x') {
						left = ij.GameModel.isWall(x - 1, y) ? 1 : 0;
						right = ij.GameModel.isWall(x +1, y) ? 2 : 0;
						top = ij.GameModel.isWall(x, y - 1) ? 4 : 0;
						bottom = ij.GameModel.isWall(x, y + 1) ? 8 : 0;

						newCell = BG_CONVERT_TABLE[left + right + top + bottom];
						newRow += newCell;
					} else {
						newRow += cell;
					}
				}
				currentLevel.background[y] = newRow;
			}
		}

		return !error;
	}

	/** Set up scene, set dimensions and place objects */
	function setupScene() {
		var heroFound = false;
		
		ij.Scene.setDimensions(currentLevel.dimension);
		ij.Scene.removeAllObjects();

		if(!currentLevel.objects || !currentLevel.objects.length) {
			return false;
		}

		var n;
		for(n = 0; n < currentLevel.objects.length; ++ n) {
			var objectData = currentLevel.objects[n];
			if(objectData.type == ij.HeroObject.prototype.TYPE) {
				heroFound = true;
				ij.Scene.setPosition(objectData.position);
			}
			var objectConstructor = objectConstructors[objectData.type];
			if(!objectConstructor) {
				ij.App.log.error('Cannot find constructor for type ' + objectData.type);
				return false;
			}
			var object = new objectConstructor(objectData);
			ij.Scene.addObject(object);
		}

		isLevelCompleted = false;

		if(!heroFound) {
			ij.App.log.error('No hero object was found in the level');
		}
		return heroFound;
	}


	function getCellBackground(x, y) {
		if(!currentLevel) {
			return null;
		}
		if(x < 0 || y < 0 || x >= currentLevel.dimension.width || y >= currentLevel.dimension.height) {
			return null;
		}
		return currentLevel.background[y] && currentLevel.background[y][x];
	}

	/** Public interface */
	return {
		/** Initialize game mode, loads all data, notify through the @cb callback */
		init: function(callback) {
			loadLevel('1', callback);
		},

		getCellType: function(x, y) {
			return getCellBackground(x,y);
		},

		/** Return sprite id for the background cell at specific point */
		getBackgroundSpriteId: function(x, y) {
			var bgType = getCellBackground(x, y);
			return bgType && BACKGROUND_SPRITES[bgType];
		},

		isWall: function(x, y) {
			var bgType = getCellBackground(x, y);
			return !bgType || bgType.match(/[a-z]/);
		},

		levelCompleted: function() {
			if(!isLevelCompleted) {
				isLevelCompleted = true;
				alert('You won!');
			}
		},

		registerObjectType: function(objectType, objectConstructor) {
			if(objectConstructors[objectType]) {
				ij.App.log.error('Type ' + objectType + ' was already registered');
			} else {
				objectConstructors[objectType] = objectConstructor;
			}
		}
	};

})();