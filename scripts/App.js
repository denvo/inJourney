/**
 * Game App
 */

var App = (function() {

	/** Keyboard state */
	var keyState = {};

	/** Create multiple-level log facility */
	function initLog() {
		var logObject = { };
		var minLogLevel = Config.logLevel || 'info';
		var levelEnabled = false;
		[ 'debug', 'info', 'error'].forEach(function(level) {
			if(level == minLogLevel) {
				levelEnabled = true;
			}
			logObject[level] = levelEnabled ? function(msg) {
				console.log(level + ": " + msg);
			} : function() {};
		});
		return logObject;
	}

	function initEventListeners() {
		document.addEventListener('keydown', function(e) {
			e = e || window.event;
			var key = e.keyCode || e.which;
			keyState[key] = true;
		});
		document.addEventListener('keyup', function(e) {
			e = e || window.event;
			var key = e.keyCode || e.which;
			keyState[key] = false;
		});
	}

	/** Main run method */
	function run() {
		// Unpause scene
		Scene.setPause(false);
	}


	return {
		start: function() {
			initEventListeners();

			// Synchronous init methods
			if(!Scene.init()) {
				App.log.error('Scene initialization failed');
				return;
			}

			// This can take some time - continue after it finishes
			chainCall(function(err) {
				if(err) {
					App.log.error(err);
				} else {
					App.log.debug('Game is ready to go!');
					// Run the game
					run();
				}
			}, ImageLoader.init, GameModel.init);
		},
		/** Log object */
		log: initLog(),

		/** Get key state */
		isKeyPressed: function(keyCode) {
			return keyState[keyCode] || false;
		}
	};
	
})();

// Initialize the app on load
window.addEventListener("load", function() {
	App.start();
});
