/**
 * Scene object - root class
 */
(function() {
	// Private static members

	// Define public memebers
	ij.registerClass('SceneObject', null, {
		// Called from the constructor
		onCreate: function(x, y, width, height) {
			this.rect = new ij.Rect(new ij.Point(x, y), new ij.Dimension(width, height));
		},

		getX: function() {
			return this.rect.point.x;
		},

		getY: function() {
			return this.rect.point.y;
		},

		getWidth: function() {
			return this.rect.dimension.width;
		},

		getHeight: function() {
			return this.rect.dimension.height;
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
			ij.App.log.panic('Not implemented');
		},

		/**
		 * Called in the main loop to draw the object on a canvas using @ctx context
		 */
		draw: function(ctx) {
			// Inplemented in inherited class
			ij.App.log.panic('Not implemented');
		}
	});

})();
