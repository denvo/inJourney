/**
 * Image Loader
 */

ij.ImageLoader = (function(){
	var IMAGE_PREFIX = 'assets/img/';
	var IMAGES_JSON = 'assets/json/images.json';

 	// Sprites and animation objects
	var SPRITES = null;
	var ANIMATIONS = null;

	var imageCache = {};
	var loading = 0;
	var initialized = false;
	var img;
	var cellSize = 0;

	function loadJSON(callback) {
		ij.Util.ajax(IMAGES_JSON, function(err, json) {
			if(err) {
				callback(err);
			} else {
				if(!json || !json.sprites) {
					callback('Bad JSON data');
				} else {
					SPRITES = json.sprites;
					ANIMATIONS = json.animations;
					cellSize = json.cellSize;
					ij.App.log.info(IMAGES_JSON + ' loaded');
					callback(null);
				}
			}
		}, {
			json: true
		})
	}

	function loadImages(callback) {
		for(spriteId in SPRITES) {
			if(SPRITES[spriteId] && !imageCache[SPRITES[spriteId].fileName]) {
				img = new Image();
				img.addEventListener("load", function() {
					ij.App.log.info(this.src + ' loaded');
					if(-- loading == 0) {
						initialized = true;
						callback && callback(null);
					}
				});
				img.addEventListener("error", function() {
					callback && callback("Cannot load image " + this.src);
				});
				img.src = IMAGE_PREFIX + SPRITES[spriteId].fileName;
				imageCache[SPRITES[spriteId].fileName] = img;
				++ loading;
			}
		}
	}

	// Interface
	return interface = {
		/** Initialize ImageLoader and load images into cache */
		init: function(callback) {
			loadJSON(function(err) {
				if(err) {
					callback && callback(err);
				} else {
					loadImages(callback);
				}
			})

		},

		getAnimation: function(animationId) {
			return ANIMATIONS && ANIMATIONS[animationId];
		},

		getCellSize: function() {
			return cellSize;
		},

		/** Draws sprite with give @spriteId on context @ctx at position @x, @y (cell coordinates) with rotation at @angle (rad) */
		drawSprite: function(spriteId, ctx, x, y, angle) {
			if(initialized && SPRITES[spriteId] && imageCache[SPRITES[spriteId].fileName]) {
				if(angle) {
					ctx.save();
					ctx.translate((x + 0.5) * cellSize, (y + 0.5) * cellSize);
					ctx.rotate(angle);
					x = y = -0.5;
				}
				ctx.drawImage(imageCache[SPRITES[spriteId].fileName],
					SPRITES[spriteId].x, SPRITES[spriteId].y,
					SPRITES[spriteId].width, SPRITES[spriteId].height,
					x * cellSize, y * cellSize,
					SPRITES[spriteId].width, SPRITES[spriteId].height);
				if(angle) {
					ctx.restore();
				}
			}
		}	
	}
	
})();

