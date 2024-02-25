(function($) {

var renderDetached = $.renderDetached;
var tests = [];

function createTest(test) {
	tests.push(test);
}

function runTest(test, pass, fail, assert) {
	renderDetached(function(unmount) {
		try {
			var result = test(typeof assert === "function" ? assert(test) : function(condition) {
				if (!condition) {
					throw new Error(test.name ? "Assertion failed in " + test.name : "Assertion failed");
				}
			});
			
			if (result && typeof result.then === "function") {
				result.then(function(value) {
					unmount();
					pass(value);
				}, function(error) {
					try {
						unmount();
						fail(error);
					} catch (unmountError) {
						fail(unmountError);
					}
				});
			} else {
				unmount();
				pass(result);
			}
		} catch (error) {
			fail(error);
		}
	});
}

function displayResults(errors) {
	var m = errors.length;
	
	if (m === 0) {
		console.log("All tests passed.");
	} else {
		for (var i = 0; i < m; ++i) {
			console.error(errors[i]);
		}
		
		console.log(m === 1 ? "1 test failed." : m + " tests failed.");
		throw errors[0];
	}
}

function displayAsyncTests(testCount) {
	console.log(testCount === 1 ? "1 async test is still running." : testCount + " async tests are still running.");
}

function runTests(params) {
	if (!params) {
		params = {};
	}
	
	var assert = params.assert;
	var complete = params.complete || displayResults;
	var asyncTests = params.asyncTests || displayAsyncTests;
	var timeout = params.timeout || 0;
	var n = tests.length;
	var errors = [];
	var testCount = n;
	
	function pass(value) {
		if (--testCount === 0 && typeof complete === "function") {
			complete(errors.splice(0, errors.length));
		}
	}
	
	function fail(error) {
		errors.push(error);
		
		if (--testCount === 0 && typeof complete === "function") {
			complete(errors.splice(0, errors.length));
		}
	}
	
	for (var i = 0; i < n; ++i) {
		runTest(tests[i], pass, fail, assert);
	}
	
	if (asyncTests) {
		setTimeout(function() {
			if (testCount > 0) {
				asyncTests(testCount);
			}
		}, timeout);
	}
}

$.test = createTest;
$.runTests = runTests;

})($);
