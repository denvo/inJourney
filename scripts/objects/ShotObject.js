/** General class for any type of shot (bullet, missle etc) */
(function() {
	// Private static members

	ij.registerClass('ShotObject', 'MotileObject', {
		onCreate: function(startX, startY, direction, offset) {
			if(offset) {
				// Shoft the start point according direction and offset
				if(typeof offset.x != 'undefined') {
					// vector
					startX += direction.transformX(offset.x, offset.y);
					startY += direction.transformY(offset.x, offset.y);
				} else {
					// scalar - distance from the center in the shot direction 
					startX += direction.dx * offset;
					startY += direction.dy * offset;
				}
			}
			ij.MotileObject.prototype.onCreate.call(this, startX, startY, this.WIDTH, this.HEIGHT);
			this.shotDirection = direction;

			// Find the end point where this object hits a wall
			// Assume that the shot object height (cross-section) is less than one cell
			var line1, line2, duration,
				endX = startX,
				endY = startY;
			if(direction.dy) {
				// Vertical movement
				line1 = Math.round(startX);
				if(startX - (line1 - 0.5) < this.HEIGHT / 2) {
					line2 = line1 - 1;
				} else if((line1 + 0.5) - startX < this.HEIGHT / 2) {
					line2 = line1 + 1;
				} 

				var y, sceneHeight = ij.Scene.getSceneHeight();
				for(y = Math.floor(startY); y >= 0 && y < sceneHeight; y += direction.dy) {
					if(ij.GameModel.isWall(line1, y) || (typeof line2 != 'undefined' && ij.GameModel.isWall(line2, y))) {
						break;
					}
				}
				endY = y - (this.WIDTH - 0.75) * direction.dy;
				duration = (endY - startY) * direction.dy / this.SPEED;

			} else {
				// Horizontal movement
				line1 = Math.round(startY);
				if(startY - (line1 - 0.5) < this.HEIGHT / 2) {
					line2 = line1 - 1;
				} else if((line1 + 0.5) - startY < this.HEIGHT / 2) {
					line2 = line1 + 1;
				}

				var x, sceneWidth = ij.Scene.getSceneWidth();
				for(x = Math.floor(startX); x >= 0 && x < sceneWidth; x += direction.dx) {
					if(ij.GameModel.isWall(x, line1) || (typeof line2 != 'undefined' && ij.GameModel.isWall(x, line2))) {
						break;
					}
				}
				endX = x - (this.WIDTH - 0.75) * direction.dx;
				duration = (endX - startX) * direction.dx / this.SPEED;

			}

			if(duration > 0) {
				// Create the animation
				this.moveAnimation = new ij.PositionAnimation(startX, startY, endX, endY, duration);
				this.spriteAnimation = ij.ImageLoader.getAnimation(this.MOVE_ANIMATION_ID);
				this.state = 'move';
			} else {
				// walls are too close, blast immediately
				this.moveAnimation = null;
				this.spriteAnimation = ij.ImageLoader.getAnimation(this.HIT_WALL_ANIMATION_ID || this.BLAST_ANIMATION_ID);
				this.state = 'blast';
				this.moveTo(startX, startY);
			}
		},

		update: function(delta) {
			this.spriteAnimation.update(delta);
			ij.MotileObject.prototype.update.call(this, delta);
		},

		draw: function(ctx) {
			this.spriteAnimation.draw(ctx, this.getX(), this.getY(), this.shotDirection.angle);
		},

		// Check if target is reached or the movement is finished
		afterMovement: function() {
			if(this.state == 'move') {
				if(this.moveAnimation) {
					// In motion, check if we hit something
					var target = this.checkTarget();
					if(target) {
						// Hit the target
						taget.gotDamage(this);
						this.state = 'blast';
						this.moveAnimation = null;
						this.spriteAnimation = ij.ImageLoader.getAnimation(this.BLAST_ANIMATION_ID);
					}
				} else {
					// Hit the wall
					this.state = 'blast';
					this.spriteAnimation = ij.ImageLoader.getAnimation(this.HIT_WALL_ANIMATION_ID || this.BLAST_ANIMATION_ID);
					this.moveTo(this.getX() + this.WIDTH * this.shotDirection.dx * 0.375, this.getY() + this.WIDTH * this.shotDirection.dy * 0.375);
				}
			} else if(this.state == 'blast') {
				if(this.spriteAnimation.isDone) {
					this.state = '';
					// Remove this object
					ij.Scene.removeObject(this);
				}
			}
		},

		checkTarget: function() {
			var x = this.moveAnimation.getX(), 
				y = this.moveAnimation.getY();
			// Find the object of specific type(s) which intersects with this one
			return null;
		},

		getDebugInfo: function() {
			return this.TYPE + ' x=' + this.getX() + ', y=' + this.getY();
		}
	})

})();
