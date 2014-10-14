/**
 * Hero object
 */
function HeroObject(data) {
	SceneObject.call(this, this.TYPE, data.position.x, data.position.y, 1, 1, this.ZORDER);
	this.moveAnimation = null;
	this.rotateAnimation = null;
	// Direction angle (degrees)
	this.direction = 0;
}

(function() {
	/** Start movement in specific direction */
	function startMovement(direction, shiftX, shiftY) {
		var newX = this.getX() + shiftX, newY = this.getY() + shiftY;
		if(GameModel.isWall(newX, newY)) {
			return false;
		}

		if(this.direction != direction) {
			// Update direction to make sure the shortest rotation will be used
			if(this.direction == 0 && direction == 270) {
				this.rotateAnimation = new ValueAnimation(360, 270, this.ROTATE_DURATION)
			} else if(this.direction == 270 && direction == 0) {
				this.rotateAnimation = new ValueAnimation(270, 360, this.ROTATE_DURATION)
			} else {
				this.rotateAnimation = new ValueAnimation(this.direction, direction, this.ROTATE_DURATION)
			}
		}

		this.moveAnimation = new PositionAnimation(this.getX(), this.getY(), newX, newY, this.MOVE_DURATION);
		App.log.debug('Start moving to ' + newX + ', ' + newY);

		return true;
	}	

	// Public methods
	extend(HeroObject.prototype, SceneObject.prototype, {
		// This type should be used in game level files
		TYPE: 'hero',

		ZORDER: 1,

		MOVE_DURATION: 250,

		ROTATE_DURATION: 100, 

		update: function(delta) {
			if(this.rotateAnimation) {
				this.rotateAnimation.update(delta);
				this.direction = this.rotateAnimation.getValue();
				if(this.rotateAnimation.isDone()) {
					this.rotateAnimation = null;
					// Normalize the direction in range 0-359
					this.direction = (this.direction + 360) % 360;
				}
			} else if(this.moveAnimation) {
				this.moveAnimation.update(delta);
				this.moveTo(this.moveAnimation.getX(), this.moveAnimation.getY());
				if(this.moveAnimation.isDone()) {
					this.moveAnimation = null;
				}
			} else {
				(App.isKeyPressed(37) && startMovement.call(this, 180, -1, 0))
					|| (App.isKeyPressed(39) && startMovement.call(this, 0, 1, 0))
					|| (App.isKeyPressed(38) && startMovement.call(this, 90, 0, -1))
					|| (App.isKeyPressed(40) && startMovement.call(this, 270, 0, 1));
			}
		},

		draw: function(ctx) {
			// TODO: rotation
			ImageLoader.drawSprite('hero', ctx, this.getX(), this.getY());
		},
		
	})

	// Register constructor of this type
	GameModel.registerObjectType(HeroObject.prototype.TYPE, HeroObject);

})();
