/** Game namespace */
window.ij = window.ij || {};

/** Register class */
ij.registerClass = function(className, baseClassName, prototypeObject) {
	if(ij[className]) {
		throw new Error('Class ' + className + ' is already registered')
	}
	if(baseClassName && !ij[baseClassName]) {
		throw new Error('Base class ' + baseClassName + ' for class ' + className + ' is not registered');

	}
	
	// Define constructor
	ij[className] = function() {
		// Call onCreate method
		if(ij[className].prototype.onCreate) {
			ij[className].prototype.onCreate.apply(this, arguments);
		}
	};

	// Combine prototype
	if(baseClassName) {
		ij.Util.extend(ij[className].prototype, ij[baseClassName].prototype);
	}
	if(prototypeObject instanceof Object) {
		ij.Util.extend(ij[className].prototype, prototypeObject)
	}
}

/** Utility function */
ij.Util = {
	/**
	 * Run several functions one by one, each of them notify callback, when finishes
	 * @example chainCall(callback, Object1.method1, Object2.method2);
	 * Callback will receive the status from the last method or the error from the failed one
	 */
	chainCall: function(callback) {
		var list = Array.prototype.slice.call(arguments);
		var func = list.splice(1, 1)[0];
		if(list.length == 1) {
			// Directly call the last method
			func(callback);
		} else {
			// Recursion
			func(function(err) {
				if(err) {
					callback(err);
				} else {
					ij.Util.chainCall.apply(this, list);
				}
			})
		}

	},

	/**
	 * Copy the content of each argument starting from second to the first one,
	 * returns first object 
	 */
	extend: function(object) {
		var objects = Array.prototype.slice.call(arguments);
		objects.shift();
		var n;
		for(n = 0; n < objects.length; ++ n) {
			var src = objects[n];
			if(src instanceof Object) {
				for(var key in src) {
					object[key] = src[key];
				}
			}
		}
		return object;
	},

	parseJSON: function(str) {
		try {
			return JSON.parse(str + '');
		} catch(e) {
			ij.App.log.error("Cannot parse JSON, exception " + e.message);
			return null;
		}
	},

	ajax:function(url, callback, options) {
		options = ij.Util.extend({
			method: 'GET'
		}, options);
		var method = (options.method || 'GET').toLowerCase();
		if(method != 'post' && method != 'get') {
			callback && callback('Unsupported HTTP method ' + method);
		}

		if(!window.XMLHttpRequest) {
			callback && callback('AJAX requests not supported by this browser!');
			return;
		}

		try {
			var xhr = new window.XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					if(xhr.status == 200) {
						if(options.json) {
							var json = ij.Util.parseJSON(xhr.responseText);
							if(!json) {
								callback && callback('Error parsing response as JSON');
							} else {
								callback && callback(null, json);
							}
						} else {
							callback && callback(null, xhr.responseText);
						}

					} else {
						callback && callback('HTTP ERROR, code ' + xhr.status);
					}
				}
	    	};

	    	if(method == 'post') {

	    	} else {
	    		xhr.open("GET", url, true);
				xhr.send();
	    	}
		} catch(e) {
			callback && callback('Exception ' + e.message);
		}
	}
};