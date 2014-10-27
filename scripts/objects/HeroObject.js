/**
 * Hero object
 */
(function() {
	// Private static members
	var SCENE_MOVE_THRESHOLD = 3;
	var MOVE_DURATION = 250;
	var TURN_DURATION = 100;
	var SHOT_MISSILE_INTERVAL = 1000;
	var SHOT_OFFSET = 0.5;

	/** Start movement in specific direction */
	function tryMoveBy(shiftX, shiftY) {
		var newX = this.getX() + shiftX, newY = this.getY() + shiftY;
		if(ij.GameModel.isWall(newX, newY)) {
			return false;
		}

		this.startMovement(newX, newY, MOVE_DURATION, TURN_DURATION);

		return true;
	}

	/** Launch a missile */
	function launchMissile() {
		var dir = ij.Direction.nearestDirectionForAngle(this.getDirection());
		var missile = new ij.MissileObject(this.getX(), this.getY(), dir, SHOT_OFFSET);
		ij.Scene.addObject(missile);
		this.reloadDelay = new ij.ValueAnimation(0, 1, SHOT_MISSILE_INTERVAL);
	}	

	ij.registerClass('HeroObject', 'MotileObject', {
		// This type should be used in game level files
		TYPE: 'hero',

		ZORDER: 1,

		onCreate: function(data) {
			ij.MotileObject.prototype.onCreate.call(this, data.position.x, data.position.y, 1, 1);

			this.reloadDelay = null;
		},

		update: function(delta) {
			// Handle local animations and timeouts
			if(this.reloadDelay) {
				this.reloadDelay.update(delta);
				if(this.reloadDelay.isDone()) {
					this.reloadDelay = null;
					ij.App.log.debug('Ready to shot again!');
				}
			}
			ij.MotileObject.prototype.update.call(this, delta);
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
				ij.GameModel.checkWinCondition();

				// Check the controls
				(ij.App.isKeyPressed(37) && tryMoveBy.call(this, -1, 0))
					|| (ij.App.isKeyPressed(39) && tryMoveBy.call(this, 1, 0))
					|| (ij.App.isKeyPressed(38) && tryMoveBy.call(this, 0, -1))
					|| (ij.App.isKeyPressed(40) && tryMoveBy.call(this, 0, 1));

			}

			// Fire the missile
			if(!this.reloadDelay) {
				ij.App.isKeyPressed(32) && launchMissile.call(this);
			}
		},

		draw: function(ctx) {
			ij.ImageLoader.drawSprite('hero', ctx, this.getX(), this.getY(), this.direction);
		},

		getDebugInfo: function() {
			return 'HERO: x=' + this.getX() + ', y=' + this.getY() + ', dir=' + ij.Direction.nearestDirectionForAngle(this.getDirection()).name;
		}
		
	});

	// Register constructor of this type
	ij.GameModel.registerObjectType(ij.HeroObject.prototype.TYPE, ij.HeroObject);

})();
