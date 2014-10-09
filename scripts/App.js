/**
 * Game App
 */

var App = (function() {


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

	/** Main run method */
	function run() {
		alert('run');
	}


	return {
		start: function() {
			// Synchronous init methods
			if(!Scene.init()) {
				App.log.error('Scene initialization failed');
				return;
			}

			// This can take some time - continue after it finishes
			ImageLoader.init(function(err) {
				if(err) {
					App.log.error(err);
				} else {
					App.log.debug('Images loaded');
					// Run the game
					run();
				}
			});
		},
		// Log object
		log: initLog()
	};
	
})();

// Initialize the app on load
window.addEventListener("load", function() {
	App.start();
});
