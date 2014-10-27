/**
 * Scene
 */
ij.Scene = (function(){
	// Constants
	var VIEWPORT_MOVE_SPEED = 25;

	// Set to true to show grid coordinates
	var SHOW_GRID_COORD = true;

	// DEBUG: status line
	var debugStatusLine = null;

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

	// List of object to be added/deleted from the scene during update cycle
	var objectsToAdd = [];
	var objectsToDelete = [];
	var inUpdateCycle = false;

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
		if(debugStatusLine) {
			var spent = (new Date().getTime()) - lastUpdate;
			var statusText = "delta=" + delta + "ms, spent=" + spent + "ms (" + 
				Math.round(spent / delta * 100) + "%)";
			iterate(function(obj) {
				if(obj.getDebugInfo) {
					statusText += '<br/>' + obj.getDebugInfo();
				}
			});
			
			debugStatusLine.innerHTML = statusText;
		}

		requestAnimationFrame(update);
	}

	/** Draw the background */
	function drawBackground() {
		var cellSize = ij.ImageLoader.getCellSize();
		bgCtx.clearRect(0, 0, vpWidth, vpHeight);
		var left = vpX - vpCWidth2;
		var top = vpY - vpCHeight2;
		var minX = Math.floor(left);
		var maxX = Math.ceil(vpX + vpCWidth2);
		var minY = Math.floor(top);
		var maxY = Math.ceil(vpY + vpCHeight2);

		bgCtx.save();
		bgCtx.translate(-left * cellSize, -top * cellSize);

		if(SHOW_GRID_COORD) {
			bgCtx.font = '10px Verdana';
		}

		var x, y;
		for(y = minY; y <= maxY; ++ y) {
			for(x = minX; x <= maxX; ++ x) {
				var bgSpriteId = ij.GameModel.getBackgroundSpriteId(x, y);
				if(bgSpriteId) {
					ij.ImageLoader.drawSprite(bgSpriteId, bgCtx, x, y);
				}

				if(SHOW_GRID_COORD) {
					bgCtx.fillText(x + ',' + y, (x - 0.3) * cellSize, y * cellSize);
				}
			}
		}

		bgCtx.restore();
	}

	/** Draw objects */
	function drawObjects(delta) {
		var cellSize = ij.ImageLoader.getCellSize();
		// Each object has methods update(delay) which returns an object rectangle and draw(context) which draws the object on the context

		// The idea is to update all objects according their zOrder and put objects which need to be drawn (using rect and checking
		// current viewport position) into the list, after that clean invalid rectangles on canvas and draw objects from the list
		inUpdateCycle = true;
		iterate(function(obj) {
			obj.update && obj.update(delta);
		});
		inUpdateCycle = false;

		objectsToDelete.forEach(function(obj) {
			ij.Scene.removeObject(obj);
		});

		objectCtx.clearRect(0, 0, vpWidth, vpHeight);
		var vpRect = new ij.Rect(new ij.Point(vpX - vpCWidth2, vpY - vpCHeight2), new ij.Dimension(vpCWidth2 * 2, vpCHeight2 * 2));
		objectCtx.save();
		objectCtx.translate(-vpRect.point.x * cellSize, -vpRect.point.y * cellSize);

		iterate(function(obj) {
			if(obj.draw && vpRect.intersects(obj.rect)) {
				obj.draw(objectCtx);
			}
		});

		objectCtx.restore();

		// Add new objects after all
		objectsToAdd.forEach(function(obj) {
			ij.Scene.addObject(obj);
		});
		objectsToAdd = [];
		objectsToDelete = [];
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
		/** Initialize the scene */
		init: function() {
			// Get elements
			sceneWrapper = document.getElementById('sceneWrapper');
			bgCanvas = document.getElementById('bgCanvas');
			objectCanvas = document.getElementById('objectCanvas');

			// Create contexts
			if(!bgCanvas.getContext) {
				ij.App.log.error("Canvas doesn't have getContext method - try different browser!");
				return false;
			}
			bgCtx = bgCanvas.getContext('2d');
			objectCtx = objectCanvas.getContext('2d');

			// Resize canvas
			bgCanvas.width = objectCanvas.width = vpWidth = sceneWrapper.clientWidth;
			bgCanvas.height = objectCanvas.height = vpHeight = sceneWrapper.clientHeight;

			// Setup debug line
			debugStatusLine = document.getElementById('debugStatusLine');

			return true;
		},

		/** Get/set scene dimensions */
		getSceneWidth: function() {
			return sceneWidth;
		},
		getSceneHeight: function() {
			return sceneHeight;
		},
		setDimensions: function(width, height) {
			if(width.height) {
				// Dimension object was passed as first param
				sceneWidth = width.width;
				sceneHeight = width.height;
			} else {
				sceneWidth = width;
				sceneHeight = height;
			}

			// Calculate the viewport size in cells
			var cellSize = ij.ImageLoader.getCellSize();
			vpCWidth2 = vpWidth / cellSize / 2;
			vpCHeight2 = vpHeight / cellSize / 2;
		},

		/** Get current scene position */
		getPositionX: function() {
			return vpX;
		},
		getPositionY: function() {
			return vpY;
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
				vpMoveAnimation = new ij.PositionAnimation(vpX, vpY, x, y, moveTime);
			} else {
				vpX = x;
				vpY = y;
			}

			updateBackground = true;
		},

		/** Get viewport dimension in cells */
		getViewportWidth: function() {
			return vpCWidth2 * 2;
		},
		getViewportHeight: function() {
			return vpCHeight2 * 2;
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
			if(inUpdateCycle) {
				objectsToAdd.push(obj);
			} else {
				if(!sceneObjects[obj.ZORDER]) {
					sceneObjects[obj.ZORDER] = [];
				}
				sceneObjects[obj.ZORDER].push(obj);
				ij.App.log.debug('Object added: ' + obj);
			}
		},

		/** Remove object from the scene */
		removeObject: function(obj) {
			// Deferred delete if in the update cycle
			if(inUpdateCycle) {
				objectsToDelete.push(obj);
			} else {
				iterate(function(item, index) {
					if(item === obj) {
						sceneObjects[obj.ZORDER].splice(index, 1);
						return false;
					}
				}, obj.ZORDER);
				ij.App.log.debug('Object removed: ' + obj);
			}
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
