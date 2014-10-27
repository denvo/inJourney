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

	function processSpriteGrids(spriteGrids) {
		for(var spriteGridId in spriteGrids) {
			if(!spriteGrids[spriteGridId]) {
				continue;
			}
			var col, row,
				index = 0, 
				grid = spriteGrids[spriteGridId];
			for(row = 0; row < grid.rows; ++ row) {
				for(col = 0; col < grid.cols; ++ col) {
					spriteId = spriteGridId + '.' + index;
					SPRITES[spriteId] = {
						fileName: grid.fileName,
						x: grid.x + grid.cellWidth * col,
						y: grid.y + grid.cellHeight * row,
						width: grid.cellWidth,
						height: grid.cellHeight
					};
					++ index;
				}
			}
		}
	}

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
					// Process sprite grids
					json.spriteGrids && processSpriteGrids(json.spriteGrids);
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

	/**
	 * Private class AnimatedSprite used to support animation 
	 * Created by ImageLoader
	 * Data format (simple mode, same frame duration, linear flow):
	 * { frameDuration: frame_duration_ms, loop: true_or_false, sprites: [ sprite1_id, ... ] }
	 * Data format (advanced mode):
	 * { frameDuration: default_frame_duration_ms, loop: true_or_false, frames: [ frame1_description, ... ] }
	 * where frame_description: { 
	 *	sprite: sprite_id, duration: frame_duration_ms, nextFrame: next_frame_index
	 * }
	 * all fields except for sprite can be omitted
	*/
	function AnimatedSprite(data) {
		this.data = data;
		this.setCurrentFrame(0);
		this.isDone = false;
	}

	ij.Util.extend(AnimatedSprite.prototype, {
		/** Call this function in each frame update method to update the animation */
		update: function(delta) {
			while(!this.isDone && delta > 0) {
				if(this.timeRemaining > delta) {
					this.timeRemaining -= delta;
					delta = 0;
				} else {
					// Switch to the next frame
					delta -= this.timeRemaining;
					if(this.data.frames && typeof this.data.frames[this.frameIndex].nextFrame !== 'undefined') {
						this.setCurrentFrame(this.data.frames[this.frameIndex].nextFrame);
					} else if(this.frameIndex + 1 < (this.data.frames || this.data.sprites).length) {
						this.setCurrentFrame(this.frameIndex + 1);
					} else if(this.data.loop) {
						this.setCurrentFrame(0);
					} else {
						this.isDone = true;
					}
				}
			}
		},

		/** Call this function to draw the sprite */
		draw: function(ctx, x, y, angle) {
			var spriteId = this.data.frames ? this.data.frames[this.frameIndex].sprite : this.data.sprites[this.frameIndex];
			ij.ImageLoader.drawSprite(spriteId, ctx, x, y, angle);
		},

		/** Set new current frame */
		setCurrentFrame: function(frameIndex) {
			this.frameIndex = frameIndex;
			this.timeRemaining = this.data.frameDuration || 0;
			if(this.data.frames) {
				this.timeRemaining = this.data.frames[this.frameIndex].duration || this.timeRemaining;
			}
			if(!this.timeRemaining) {
				throw new Error('Frame duration is zero, frame ' + this.frameIndex);
			}
		}
	});

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
			return new AnimatedSprite(ANIMATIONS[animationId]);
		},

		getCellSize: function() {
			return cellSize;
		},

		/** Draws sprite with give @spriteId on context @ctx at position @x, @y (cell coordinates) with rotation at @angle (rad) */
		drawSprite: function(spriteId, ctx, x, y, angle) {
			if(initialized && SPRITES[spriteId] && imageCache[SPRITES[spriteId].fileName]) {
				if(angle) {
					ctx.save();
					ctx.translate(x * cellSize, y * cellSize);
					ctx.rotate(angle);
					x = y = 0;
				}
				ctx.drawImage(imageCache[SPRITES[spriteId].fileName],
					SPRITES[spriteId].x, SPRITES[spriteId].y,
					SPRITES[spriteId].width, SPRITES[spriteId].height,
					x * cellSize - SPRITES[spriteId].width / 2, y * cellSize - SPRITES[spriteId].height / 2,
					SPRITES[spriteId].width, SPRITES[spriteId].height);
				if(angle) {
					ctx.restore();
				}
			}
		}	
	}
	
})();

