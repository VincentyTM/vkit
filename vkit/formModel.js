(function($){

var createState = $.state;
var createObservable = $.observable;
var getComponent = $.getComponent;
var onUnmount = $.onUnmount;

function not(value){
	return !value;
}

function createFormModel(data){
	var dataChange = createObservable();
	var submitSuccess = createObservable();
	var submitError = createObservable();
	var updateModel = createObservable();
	var validators = createObservable();
	var isFormValid = createState(true);
	var component = getComponent(true);
	
	function validate(options){
		updateModel();
		isFormValid.set(true);
		validators(options);
		return isFormValid.get();
	}
	
	return {
		bind: {
			onsubmit: function(e){
				e.preventDefault();
				updateModel();
				if( validate({submitted: true}) ){
					submitSuccess(data, this);
				}else{
					submitError(this);
				}
			}
		},
		control: function(getter, setter){
			return function(input){
				getter(input, data);
				
				onUnmount(
					dataChange.subscribe(function() {
						getter(input, data);
					})
				);
				
				onUnmount(
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
		valid: isFormValid.map(),
		validate: validate,
		validator: function(rule, options){
			var submitOnly = options && options.submitOnly;
			var isValid = createState(Boolean(submitOnly || rule(data)));
			
			if(!isValid.get()){
				isFormValid.set(false);
			}
			
			if( getComponent() !== component ){
				unmount(validate);
			}
			
			onUnmount(
				validators.subscribe(function(options) {
					if (rule(data)) {
						isValid.set(true);
					}else if(!submitOnly || (options && options.submitted)){
						isFormValid.set(false);
						isValid.set(false);
					}
				})
			);
			
			return {
				invalid: isValid.map(not),
				valid: isValid.map()
			};
		}
	};
}

$.formModel = createFormModel;

})($);
