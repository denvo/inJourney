/**
 * Image Loader
 */

var ImageLoader = (function(){
	var IMAGES = {
		BACKGROUND: 'bg.png'
	};

	var IMAGE_PREFIX = 'assets/img/';
	var imageCache = {};
	var loading = 0;
	var initialized = false;
	var img;

	// Interface
	return {
		/** Initialize ImageLoader and load images into cache */
		init: function(callback) {
			for(imgId in IMAGES) {
				if(IMAGES[imgId]) {
					img = new Image();
					img.addEventListener("load", function() {
						if(-- loading == 0) {
							initialized = true;
							callback && callback(null);
						}
					});
					img.addEventListener("error", function() {
						callback && callback("Cannot load image " + this.src);
					});
					img.src = IMAGE_PREFIX + IMAGES[imgId];
					imageCache[imgId] = img;
					++ loading;
				}
			}
		},

		/** Get image from the cache */
		getImage: function(imgId) {
			return initialized ? imageCache[imgId] : null;
		}	
	}
	
})();

