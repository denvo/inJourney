/**
 * Animation
 */


/**
 * Value animation animates value from @start to @end during @duration ms
 * @example 
 * var a = new ValueAnimation(start, end, duration);
 * a.update(delta);	// Call this in update loop
 * a.getValue();    // gets current value
 * a.isDone();		// returns true if animation is done
 */
function ValueAnimation(start, end, duration) {
	this.timeRemaining = duration;
	this.currentValue = start;
	this.targetValue = end;
}

extend(ValueAnimation.prototype, {
	update: function(delta) {
		if(delta >= this.timeRemaining) {
			this.currentValue = this.targetValue;
			this.timeRemaining = 0;
		} else {
			this.currentValue += delta / this.timeRemaining * (this.targetValue - this.currentValue);
			this.timeRemaining -= delta;
		}
	},

	getValue: function() {
		return this.currentValue;
	},

	isDone: function() {
		return this.timeRemaining == 0;
	}
});

/**
 * Position animation is based on value animation for 2D position value
 * @example
 * var a = new PositionAnimation(x1, y1, x2, y2, duration);
 * a.update(delta);			// Call this in update loop
 * a.getX(); a.getY();		// returns current position
 * a.isDone();				// returns true if animation is done
 */
function PositionAnimation(x1, y1, x2, y2, duration) {
	ValueAnimation.call(this, 0, 1, duration);
	this.startX = x1;
	this.startY = y1;
	this.deltaX = x2 - x1;
	this.deltaY = y2 - y1;
}

extend(PositionAnimation.prototype, {
	update: ValueAnimation.prototype.update,

	isDone: ValueAnimation.prototype.isDone,

	getX: function() {
		return this.startX + this.currentValue * this.deltaX;
	},
	
	getY: function() {
		return this.startY + this.currentValue * this.deltaY;
	}
});
