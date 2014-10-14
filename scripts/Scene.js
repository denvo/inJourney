/**
 * Scene
 */
var Scene = (function(){
	// Constants
	var CELL_SIZE = 64;
	var VIEWPORT_MOVE_SPEED = 300;

	// Wrapper
	var sceneWrapper;
	// Dimensions of the canvas (viewport) in pixels
	var vpWidth, vpHeight;
	// Half-size of the canvas in cells
	var vpCWidth2, vpCHeight2;
	// Canvas
	var bgCanvas, objectCanvas;
	// Contexts
	var bgCtx, objectCtx;

	// Flags
	var isPaused = true;
	var updateBackground = false;

	// Timer
	var lastUpdate = null;
	var currentUpdate = null;

	// Position (in cells) of the center of viewport
	var vpX = 0, vpY = 0;
	// Size of scene (in cells)
	var sceneWidth, sceneHeight;

	// Viewport movement
	var vpMoveAnimation = null;

	// Scene objects - ordered by zOrder
	var sceneObjects = {};


	/** Update the scene */
	function update() {
		if(isPaused) {
			lastUpdate == null;
			return;
		}

		currentUpdate = new Date().getTime();
		var delta = lastUpdate === null ? 0 : currentUpdate - lastUpdate;

		if(vpMoveAnimation) {
			vpMoveAnimation.update(delta);
			vpX = vpMoveAnimation.getX();
			vpY = vpMoveAnimation.getY();
			if(vpMoveAnimation.isDone()) {
				vpMoveAnimation = null;
			}
			updateBackground = true;
		}

		if(updateBackground) {
			drawBackground();
			updateBackground = false;
		}

		drawObjects(delta);

		lastUpdate = currentUpdate;

		// Debug - show time spent in update method
		var profileLabel = document.getElementById("profileLabel");
		if(profileLabel) {
			var spent = (new Date().getTime()) - lastUpdate;
			profileLabel.innerHTML = "delta=" + delta + "ms, spent=" + spent + "ms (" + 
				Math.round(spent / delta * 100) + "%)";
		}

		requestAnimationFrame(update);
	}

	/** Draw the background */
	function drawBackground() {
		bgCtx.clearRect(0, 0, vpWidth, vpHeight);
		var left = vpX - vpCWidth2;
		var top = vpY - vpCHeight2;
		var minX = Math.floor(left);
		var maxX = Math.ceil(vpX + vpCWidth2);
		var minY = Math.floor(top);
		var maxY = Math.ceil(vpY + vpCHeight2);

		bgCtx.save();
		bgCtx.translate(-left * CELL_SIZE, -top * CELL_SIZE);

		var x, y;
		for(y = minY; y <= maxY; ++ y) {
			for(x = minX; x <= maxX; ++ x) {
				var bgSpriteId = GameModel.getBackgroundSpriteId(x, y);
				if(bgSpriteId) {
					ImageLoader.drawSprite(bgSpriteId, bgCtx, x, y);
				}
			}
		}

		bgCtx.restore();
	}

	/** Draw objects */
	function drawObjects(delta) {
		// Each object has methods update(delay) which returns an object rectangle and draw(context) which draws the object on the context

		// The idea is to update all objects according their zOrder and put objects which need to be drawn (using rect and checking
		// current viewport position) into the list, after that clean invalid rectangles on canvas and draw objects from the list
		var objectsToDelete = [];
		iterate(function(obj) {
			if(obj.update && obj.update(delta) === false) {
				objectsToDelete.push(obj);
			}
		});
		objectsToDelete.forEach(function(obj) {
			Scene.removeObject(obj);
		});

		objectCtx.clearRect(0, 0, vpWidth, vpHeight);
		var vpRect = new Rect(new Point(vpX - vpCWidth2, vpY - vpCHeight2), new Dimension(vpCWidth2 * 2, vpCHeight2 * 2));
		objectCtx.save();
		objectCtx.translate(-vpRect.point.x * CELL_SIZE, -vpRect.point.y * CELL_SIZE);

		iterate(function(obj) {
			if(obj.draw && vpRect.intersects(obj.rect)) {
				obj.draw(objectCtx);
			}
		});

		objectCtx.restore();
	}

	/** Iterate through all the objects, cb receives an object and its index and should return false to stop */
	function iterate(cb, zOrder) {
		var stop = false;
		for(var z in sceneObjects) {
			if((zOrder === undefined || zOrder == z) && sceneObjects[z] instanceof Array) {
				sceneObjects[z].some(function(item, index) {
					if(cb(item, index) === false) {
						return stop = true;
					} else {
						return false;
					}
				});
				if(stop) {
					break;
				}
			}
		}
	}

	/** 
	 * Interface
	 */
	return {
		/** cell size */
		CELL_SIZE: CELL_SIZE,

		/** Initialize the scene */
		init: function() {
			// Get elements
			sceneWrapper = document.getElementById('sceneWrapper');
			bgCanvas = document.getElementById('bgCanvas');
			objectCanvas = document.getElementById('objectCanvas');

			// Create contexts
			if(!bgCanvas.getContext) {
				App.log.error("Canvas doesn't have getContext method - try different browser!");
				return false;
			}
			bgCtx = bgCanvas.getContext('2d');
			objectCtx = objectCanvas.getContext('2d');

			// Resize canvas
			bgCanvas.width = objectCanvas.width = vpWidth = sceneWrapper.clientWidth;
			bgCanvas.height = objectCanvas.height = vpHeight = sceneWrapper.clientHeight;
			vpCWidth2 = vpWidth / CELL_SIZE / 2;
			vpCHeight2 = vpHeight / CELL_SIZE / 2;

			return true;
		},

		/** Set scene dimensions */
		setDimensions: function(width, height) {
			if(width.height) {
				// Dimension object was passed as first param
				sceneWidth = width.width;
				sceneHeight = width.height;
			} else {
				sceneWidth = width;
				sceneHeight = height;
			}
		},

		/** Set viewport position, if @animate is true, viewport will be moved smoothly */
		setPosition: function(x, y, animate) {
			// If point object is passed as first param
			if(x.y !== undefined) {
				y = x.y;
				x = x.x;
			}
			// Check limits
			x = Math.max(Math.min(x, sceneWidth - vpCWidth2), vpCWidth2);
			y = Math.max(Math.min(y, sceneHeight - vpCHeight2), vpCHeight2);

			if(animate) {
				var maxShift = Math.max(Math.abs(x - vpX), Math.abs(y - vpY));
				var moveTime = maxShift / VIEWPORT_MOVE_SPEED * 1000;
				vpMoveAnimation = new PositionAnimation(vpX, vpY, x, y, moveTime);
			} else {
				vpX = x;
				vpY = y;
			}

			updateBackground = true;
		},

		/** Set or clear pause flag to stop/resume animation */
		setPause: function(pause) {
			isPaused = pause;
			if(!isPaused) {
				requestAnimationFrame(update);
			}
		},

		/** Add an object to the scene */
		addObject: function(obj) {
			if(!sceneObjects[obj.zOrder]) {
				sceneObjects[obj.zOrder] = [];
			}
			sceneObjects[obj.zOrder].push(obj);
			App.log.debug('Object added: ' + obj);
		},

		/** Remove object from the scene */
		removeObject: function(obj) {
			iterate(function(item, index) {
				if(item === obj) {
					sceneObjects[obj.zOrder].splice(index, 1);
					return false;
				}
			}, obj.zOrder);
			App.log.debug('Object removed: ' + obj);
		},

		/** Remove all objects from the scene */
		removeAllObjects: function() {
			sceneObjects = {};
		},

		/** Find collision */
		findCollision: function(rect, firstOnly) {
			var res = [];
			iterate(function(obj) {
				if(rect.intersects(obj.rect)) {
					res.push(obj);
					return !firstOnly;
				}
			});
			return firstOnly ? res[0] : res;
		}

	};
	
})();
