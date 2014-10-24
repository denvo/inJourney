/**
 * Hero object
 */
function HeroObject(data) {
	MotileObject.call(this, this.TYPE, data.position.x, data.position.y, 1, 1, this.ZORDER);
}

(function() {
	var SCENE_MOVE_THRESHOLD = 3;

	/** Start movement in specific direction */
	function tryMoveBy(shiftX, shiftY) {
		var newX = this.getX() + shiftX, newY = this.getY() + shiftY;
		if(GameModel.isWall(newX, newY)) {
			return false;
		}

		this.startMovement(newX, newY, this.MOVE_DURATION, this.TURN_DURATION);

		return true;
	}	

	// Public methods
	extend(HeroObject.prototype, MotileObject.prototype, {
		// This type should be used in game level files
		TYPE: 'hero',

		ZORDER: 1,

		MOVE_DURATION: 250,

		TURN_DURATION: 100, 

		afterMovement: function() {
			// Move is completed
			if(!this.moveAnimation && !this.rotateAnimation) {
				// Shift the scene, if necessary
				var heroVPShiftX = Scene.getViewportWidth() / 2 - Math.abs(this.getX() - Scene.getPositionX());
				var heroVPShiftY = Scene.getViewportHeight() / 2 - Math.abs(this.getY() - Scene.getPositionY());
				if(heroVPShiftX < SCENE_MOVE_THRESHOLD || heroVPShiftY < SCENE_MOVE_THRESHOLD) {
					var newSceneX = (heroVPShiftX < SCENE_MOVE_THRESHOLD) ? this.getX() : Scene.getPositionX();
					var newSceneY = (heroVPShiftY < SCENE_MOVE_THRESHOLD) ? this.getY() : Scene.getPositionY();
					Scene.setPosition(newSceneX, newSceneY, true);
				}

				// Check if the goal is achieved
				if(GameModel.getCellType(this.getX(), this.getY()) == '*') {
					GameModel.levelCompleted();
				}

				// Check the controls
				(App.isKeyPressed(37) && tryMoveBy.call(this, -1, 0))
					|| (App.isKeyPressed(39) && tryMoveBy.call(this, 1, 0))
					|| (App.isKeyPressed(38) && tryMoveBy.call(this, 0, -1))
					|| (App.isKeyPressed(40) && tryMoveBy.call(this, 0, 1));
			}

		},

		draw: function(ctx) {
			ImageLoader.drawSprite('hero', ctx, this.getX(), this.getY(), this.direction);
		},
		
	})

	// Register constructor of this type
	GameModel.registerObjectType(HeroObject.prototype.TYPE, HeroObject);

})();
