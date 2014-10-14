
// Test - just draw infinite running background
function runTest() {
	var CANVAS_WIDTH = 1200;
	var CANVAS_HEIGHT = 800;
	var CELL_SIZE = 64;
	var SCROLL_SPEED = 500;

	var profileLabel = document.getElementById("profileLabel");

	var bgCanvas = document.getElementById("bgCanvas");
	if(bgCanvas.getContext) {
		var bgCtx = bgCanvas.getContext("2d");
		bgCanvas.width = CANVAS_WIDTH;
		bgCanvas.height = CANVAS_HEIGHT;

		var pos = 0;
		var time = 0;
		var img = ImageLoader.getImage("BACKGROUND");

		function update() {
			var newTime = new Date().getTime();
			var delay = time ? newTime - time : 0;
			time = newTime;

			pos = Math.floor(pos + delay * SCROLL_SPEED / 1000) % CELL_SIZE;

			// draw here

			bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			bgCtx.save();
			bgCtx.translate(-pos, 0);

			var x, y;
			for(y = 0; y < CANVAS_HEIGHT; y += CELL_SIZE) {
				for(x = 0; x < CANVAS_WIDTH + pos; x += CELL_SIZE) {
					bgCtx.drawImage(img, 0, 0, CELL_SIZE, CELL_SIZE, x, y, CELL_SIZE, CELL_SIZE);
				}
			}
			bgCtx.restore();

			var timeSpent = (new Date().getTime()) - newTime;
			if(profileLabel) {
				profileLabel.innerHTML = "Delay=" + delay + "ms, spent=" + timeSpent + "ms (" + 
					Math.round(timeSpent / delay * 100) + "%)";
			}

			requestAnimationFrame(update);
		}

		//requestAnimationFrame(update);
	}
}
