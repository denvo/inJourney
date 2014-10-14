/**
 * Scene object - root class
 */
function SceneObject(type, x, y, width, height, zOrder) {
	this.type = type;
	this.rect = new Rect(new Point(x, y), new Dimension(width, height));
	this.zOrder = zOrder;
}

extend(SceneObject.prototype, {
	getX: function() {
		return this.rect.point.x;
	},

	getY: function() {
		return this.rect.point.y;
	},

	moveTo: function(x, y) {
		this.rect.moveTo(x, y);
	},

	/**
	 * Called in the main loop to update an internal state of the object
	 * If returns false, the object will be deleted
	 */
	update: function(delta) {
		// Inplemented in inherited class
	},

	/**
	 * Called in the main loop to draw the object on a canvas using @ctx context
	 */
	draw: function(ctx) {
		// Inplemented in inherited class
	}
});