/**
 * Point
 */
ij.Point = function(_x, _y) {
	this.x = _x;
	this.y = _y;
}

/**
 * Dimension
 */
ij.Dimension = function(w, h) {
	this.width = w;
	this.height = h;
}

/**
 * Rectangle
 */
ij.registerClass('Rect', null, {
	onCreate: function(p, d) {
		this.point = p;
		this.dimension = d;
	},
	
	moveTo: function(x, y) {
		if(!this.point) {
			this.point = new Point(x, y);
		} else {
			this.point.x = x;
			this.point.y = y;
		}
	},
	
	contains: function(point) {
		if(!point || !this.point || !this.dimension) {
			return false;
		}
		return point.x >= this.point.x 
			&& point.y >= this.point.y
			&& point.x < this.point.x + this.dimension.width
			&& point.y < this.point.y + this.dimension.height;
	},
	
	intersects: function(rect) {
		if(!rect || !rect.point || !rect.dimension || !this.point || !this.dimension) {
			return false;
		}
		return this.point.x + this.dimension.width >= rect.point.x
			&& rect.point.x + rect.dimension.width >= this.point.x
			&& this.point.y + this.dimension.height >= rect.point.y
			&& rect.point.y + rect.dimension.height >= this.point.y;
	}
});

/** Constants and methods to work with directions */
ij.Direction = (function() {
	// Private class constructor
	function dir(name, angle, dx, dy) {
		this.name = name;
		this.angle = angle * Math.PI / 2;
		this.dx = dx;
		this.dy = dy;
	}

	ij.Util.extend(dir.prototype, {
		transformX: function(x, y) {
			return x * this.dx - y * this.dy;
		},

		transformY: function(x, y) {
			return y * this.dx + x * this.dy;
		}
	});

	// Returns set of predefined directions
	return {
		LEFT: new dir('LEFT', 2, -1, 0),
		RIGHT: new dir('RIGHT', 0, 1, 0),
		UP: new dir('UP', -1, 0, -1),
		DOWN: new dir('DOWN', 1, 0, 1),

		/** Get the nearest direction for @angle in radians */
		nearestDirectionForAngle: function(angle) {
			angle = angle / (Math.PI / 4)
			if(Math.abs(angle) < 1) {
				return ij.Direction.RIGHT;
			} else if(Math.abs(angle) > 3) {
				return ij.Direction.LEFT;
			} else {
				return angle > 0 ? ij.Direction.DOWN : ij.Direction.UP;
			}
		}

	};

})();
