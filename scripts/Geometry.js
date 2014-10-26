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
