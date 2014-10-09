/**
 * Scene
 */
var Scene = (function(){
	// Wrapper
	var sceneWrapper;
	// Dimensions
	var sceneWidth, sceneHeight;
	// Canvas
	var bgCanvas, objectCanvas;
	// Contexts
	var bgCtx, objectCtx;

	return {
		init: function() {
			// Get elements
			sceneWrapper = document.getElementById('sceneWrapper');
			bgCanvas = document.getElementById('bgCanvas');
			objectCanvas = document.getElementById('objectCanvas');

			// Create contexts
			if(!bgCanvas.getContext) {
				App.log.error("Canvas doesn't have getContext method - try different browser!");
				return false;
			}
			bgCtx = bgCanvas.getContext('2d');
			objectCtx = objectCanvas.getContext('2d');

			// Resize canvas
			bgCanvas.height = objectCanvas.height = sceneHeight = sceneWrapper.clientHeight;
			bgCanvas.width = objectCanvas.width = sceneWidth = sceneWrapper.clientWidth;

			return true;
		}
	};
	
})();
