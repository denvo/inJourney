/**
 * Hero object
 */
(function() {
	var SCENE_MOVE_THRESHOLD = 3;

	/** Start movement in specific direction */
	function tryMoveBy(shiftX, shiftY) {
		var newX = this.getX() + shiftX, newY = this.getY() + shiftY;
		if(ij.GameModel.isWall(newX, newY)) {
			return false;
		}

		this.startMovement(newX, newY, this.MOVE_DURATION, this.TURN_DURATION);

		return true;
	}	

	ij.registerClass('HeroObject', 'MotileObject', {
		// This type should be used in game level files
		TYPE: 'hero',

		ZORDER: 1,

		MOVE_DURATION: 250,

		TURN_DURATION: 100, 

		onCreate: function(data) {
			ij.MotileObject.prototype.onCreate.call(this, data.position.x, data.position.y, 1, 1);
		},

		afterMovement: function() {
			// Move is completed
			if(!this.moveAnimation && !this.rotateAnimation) {
				// Shift the scene, if necessary
				var sceneX = ij.Scene.getPositionX(),
					sceneY = ij.Scene.getPositionY();
				var heroVPShiftX = ij.Scene.getViewportWidth() / 2 - Math.abs(this.getX() - sceneX);
				var heroVPShiftY = ij.Scene.getViewportHeight() / 2 - Math.abs(this.getY() - sceneY);
				if(heroVPShiftX < SCENE_MOVE_THRESHOLD || heroVPShiftY < SCENE_MOVE_THRESHOLD) {
					var newSceneX = (heroVPShiftX < SCENE_MOVE_THRESHOLD) ? this.getX() : sceneX;
					var newSceneY = (heroVPShiftY < SCENE_MOVE_THRESHOLD) ? this.getY() : sceneY;
					ij.Scene.setPosition(newSceneX, newSceneY, true);
				}

				// Check if the goal is achieved
				if(ij.GameModel.getCellType(this.getX(), this.getY()) == '*') {
					ij.GameModel.levelCompleted();
				}

				// Check the controls
				(ij.App.isKeyPressed(37) && tryMoveBy.call(this, -1, 0))
					|| (ij.App.isKeyPressed(39) && tryMoveBy.call(this, 1, 0))
					|| (ij.App.isKeyPressed(38) && tryMoveBy.call(this, 0, -1))
					|| (ij.App.isKeyPressed(40) && tryMoveBy.call(this, 0, 1));
			}

		},

		draw: function(ctx) {
			ij.ImageLoader.drawSprite('hero', ctx, this.getX(), this.getY(), this.direction);
		}
		
	});

	// Register constructor of this type
	ij.GameModel.registerObjectType(ij.HeroObject.prototype.TYPE, ij.HeroObject);

})();
