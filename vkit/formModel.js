(function($) {

var getEffect = $.getEffect;
var observable = $.observable;
var onDestroy = $.onDestroy;
var readOnly = $.readOnly;
var signal = $.signal;

function not(value) {
	return !value;
}

function formModel(data) {
	var dataChange = observable();
	var submitSuccess = observable();
	var submitError = observable();
	var updateModel = observable();
	var validators = observable();
	var isFormValid = signal(true);
	var effect = getEffect(true);
	
	function validate(options) {
		updateModel();
		isFormValid.set(true);
		validators(options);
		return isFormValid.get();
	}
	
	return {
		bind: {
			onsubmit: function(e) {
				e.preventDefault();
				updateModel();
				
				if (validate({submitted: true})) {
					submitSuccess(data, this);
				} else {
					submitError(this);
				}
			}
		},
		
		control: function(getter, setter) {
			return function(input) {
				getter(input, data);
				
				onDestroy(
					dataChange.subscribe(function() {
						getter(input, data);
					})
				);
				
				onDestroy(
					updateModel.subscribe(function() {
						setter(input, data);
					})
				);
			};
		},
		
		data: data,
		invalid: isFormValid.map(not),
		onError: submitError.subscribe,
		onSubmit: submitSuccess.subscribe,
		update: dataChange,
		valid: readOnly(isFormValid),
		validate: validate,
		
		validator: function(rule, options) {
			var submitOnly = options && options.submitOnly;
			var isValid = createState(Boolean(submitOnly || rule(data)));
			
			if (!isValid.get()) {
				isFormValid.set(false);
			}
			
			if (getEffect() !== effect) {
				onDestroy(validate);
			}
			
			onDestroy(
				validators.subscribe(function(options) {
					if (rule(data)) {
						isValid.set(true);
					} else if (!submitOnly || (options && options.submitted)) {
						isFormValid.set(false);
						isValid.set(false);
					}
				})
			);
			
			return {
				invalid: isValid.map(not),
				valid: readOnly(isValid)
			};
		}
	};
}

$.formModel = formModel;

})($);
