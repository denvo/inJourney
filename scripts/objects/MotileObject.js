/** Motile object can move - base class for all dynamic objects */
(function() {
	// Private static members
	
	/** Move the object. @returns the unused timeframe */
	function moveObject(delta) {
		var timeRemaining = 0;
		// timeRemaining is an internal member of ValueAnimation!
		if(this.turnAnimation) {
			if(this.turnAnimation.timeRemaining < delta) {
				timeRemaining = delta - this.turnAnimation.timeRemaining;
			}
			this.turnAnimation.update(delta);
			this.direction = (this.turnAnimation.getValue() - Math.PI) % (2 * Math.PI) + Math.PI;
			if(this.turnAnimation.isDone()) {
				this.turnAnimation = null;
			}
		} else if(this.moveAnimation) {
			if(this.moveAnimation.timeRemaining < delta) {
				timeRemaining = delta - this.moveAnimation.timeRemaining;
			}
			this.moveAnimation.update(delta);
			this.moveTo(this.moveAnimation.getX(), this.moveAnimation.getY());
			if(this.moveAnimation.isDone()) {
				this.moveAnimation = null;
			}
		}
		return timeRemaining;
	}

	ij.registerClass('MotileObject', 'SceneObject', {
		onCreate: function(x, y, width, height) {
			ij.SceneObject.prototype.onCreate.call(this, x, y, width, height);
			// Movement animation
			this.moveAnimation = null;
			// Rotation animation
			this.turnAnimation = null;
			// Direction angle (-Math.PI <= direction < Math.PI rad)
			this.direction = 0;
		},

		/** This function is called in update cycle and make movement/rotation */
		update: function(delta) {
			var timeRemaining = delta;
			while(timeRemaining > 0) {
				timeRemaining = moveObject.call(this, timeRemaining);
				this.afterMovement();
			}
		},

		/** Start movement to the specific point */
		startMovement: function(newX, newY, moveDuration, turnDuration) {
			// Clean up any previous movement/rotation
			this.turnAnimation = this.moveAnimation = null;

			// Check if any movement is necessary
			if(this.getX() == newX && this.getY() == newY) {
				return;
			}

			if(typeof turnDuration != "undefined") {
				// Calculate new direction
				var shiftX = newX - this.getX(),
					shiftY = newY - this.getY();
				var direction = Math.atan2(shiftY, shiftX);
				if(this.direction != direction) {
					if(turnDuration == 0) {
						this.direction = direction;
					} else {
						var diff = direction - this.direction;
						// Update direction to make sure the shortest rotation will be used
						if(diff > Math.PI) {
							this.turnAnimation = new ij.ValueAnimation(this.direction + 2 * Math.PI, direction, turnDuration);
						} else if(diff < -Math.PI) {
							this.turnAnimation = new ij.ValueAnimation(this.direction - 2 * Math.PI, direction, turnDuration);
						} else {
							this.turnAnimation = new ij.ValueAnimation(this.direction, direction, turnDuration);
						}
					}
				}
			}

			this.moveAnimation = new ij.PositionAnimation(this.getX(), this.getY(), newX, newY, moveDuration);
			ij.App.log.debug('Start moving to ' + newX + ', ' + newY);

			return true;
		},

		getDirection: function() {
			return this.direction;
		}	
		
	});

})();
