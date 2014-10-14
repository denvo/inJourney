/**
 * Image Loader
 */

 var ImageLoader = (function(){
	var IMAGE_PREFIX = 'assets/img/';
	var IMAGES_JSON = 'assets/json/images.json';

 	// Sprites and animation objects
	var SPRITES = null;
	var ANIMATIONS = null;

	var imageCache = {};
	var loading = 0;
	var initialized = false;
	var img;

	function loadJSON(callback) {
		ajax(IMAGES_JSON, function(err, json) {
			if(err) {
				callback(err);
			} else {
				if(!json || !json.sprites) {
					callback('Bad JSON data');
				} else {
					SPRITES = json.sprites;
					ANIMATIONS = json.animations;
					App.log.info(IMAGES_JSON + ' loaded');
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
					App.log.info(this.src + ' loaded');
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
	return {
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

		/** Draws sprite with give @spriteId on context @ctx at position @x, @y (cell coordinates) */
		drawSprite: function(spriteId, ctx, x, y) {
			if(initialized && SPRITES[spriteId] && imageCache[SPRITES[spriteId].fileName]) {
				ctx.drawImage(imageCache[SPRITES[spriteId].fileName],
					SPRITES[spriteId].x, SPRITES[spriteId].y,
					SPRITES[spriteId].width, SPRITES[spriteId].height,
					x * Scene.CELL_SIZE, y * Scene.CELL_SIZE,
					SPRITES[spriteId].width, SPRITES[spriteId].height);
			}
		}	
	}
	
})();

