var chai = require('chai'); 
var expect = chai.expect;
var assert = chai.assert;
var q = require('q');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

function extractSpecialData(obj) {
	var specialdata = [];

	if(!obj || typeof obj !== "object") {
		return specialdata;
	}

	for(var prop in obj) {

		if(obj.hasOwnProperty(prop) && prop.indexOf('eg_') > -1 ) {
			specialdata.push( {name:prop.split('eg_')[1], value:obj[prop]} );
		}

	}

	return specialdata;

}

/*
Todo:
Write tests.

How does one write mocha test to test a mocha test creating service? 
How does one test that the test of a test is correct?

Do you know? 🤔🤔
*/

//extract params
//todo: Handle mapped params
/*
Todo: How do we determine how to assert special case values?
Idea I:
id:{ required:true, eg:"89", eg_invalid:"ab", eg_alreadyexists:{value:"20", throw:false} }
throw set to false means, if we use special value 20 for id, we expect call to service function not to throw an error.
*/
function extractParamsFromSpec(spec) {

	var all_params           = { };
	var required_params      = { };
	var required_params_list = [];
	var not_required_params      = { };
	var not_required_params_list = [];
	var special_cases = []

	for(var param in spec)
	{
		var spec_param = spec[param];
		all_params[param] = spec_param.eg;
		special_cases.push({param:param, values:extractSpecialData(spec_param)});
		if(spec_param.required == "true" || spec_param.required === true)
		{
			required_params[param] = spec_param.eg;
			required_params_list.push(param);
		}
		else
		{
			not_required_params[param] = spec_param.eg;
			not_required_params_list.push(param);
		}
	}


	 
	return {
		all_params:all_params,
		required_params:required_params,
		required_params_list:required_params_list,
		not_required_params_list:not_required_params_list,
		not_required_params:not_required_params,
		special_cases:special_cases
	};
}


//Sample config stuff
(
{
	doRequiredTest:true,
	doValueTest:true,
	doInvalidValueTest:true,
	serviceUsesPromises:false,
	serviceUsesCallbacks:true
}
)
function describeThis(serviceSpec, serviceMethod, config, raw_callback) {

	function errTestDelegate(data) {

		return function errTest(){
			serviceMethod(data);
		};

	}


	function errTestPromiseDelegate(data, done, message) {

		return serviceMethod(data)
		.then(function(new_user) { 
			 expect(new_user).to.be.rejectedWith(message);
			
		})
	

}

	//Run validation test
	var opData = extractParamsFromSpec(serviceSpec);
	config.run_only = config.run_only || "both";
	describe(config.TestName, function (){

		if(~['both', 'morx'].indexOf(config.run_only)){
		var reqParams  = opData.required_params_list;
		var nreqParams = opData.not_required_params_list;
		var special_cases = opData.special_cases

		//Test for required value errors
		reqParams.forEach( p => {

			var data = JSON.parse( JSON.stringify(opData.all_params) );
			delete data[p];
			it("should throw error " + p +" is required error", function (){

				if(config.IsPromiseMethod){  
					return expect(serviceMethod(data)).to.be.rejected;
				}
				else{
					expect(errTestDelegate(data)).to.throw();
				}

			});
		});

		//Test for each non-required param
		nreqParams.forEach( (p) => {

			it("should run successfully for non-required param " + p, function (){
				if(config.timeout){
					this.timeout(config.timeout);
				}
				var data =  JSON.parse( JSON.stringify(opData.required_params) );
				data[p] = opData.not_required_params[p];
				if(config.IsPromiseMethod){ 
				 return expect(serviceMethod(data)).to.not.be.rejected;
				}
				else
				{
					expect(errTestDelegate(data)).to.not.throw;
				}

			});


		});


		//Test for only required params
		it("should run successfully for required params", function (){
			if(config.timeout){
				this.timeout(config.timeout);
			}
			var data = opData.required_params;
			if(config.IsPromiseMethod){ 
			 return expect(serviceMethod(data)).to.not.be.rejected;
			}
			else
			{
				expect(errTestDelegate(data)).to.not.throw();
			}

		});

		if(nreqParams.length > 0){

			//Test for all params (if there are required params)
			it("should run successfully for all params", function (){
				if(config.timeout){
					this.timeout(config.timeout);
				}
				var data = opData.all_params;
				if(config.IsPromiseMethod){ 
				 return expect(serviceMethod(data)).to.not.be.rejected;
				}
				else
				{
					expect(serviceMethod(data)).to.equal("success");
				}

			});

		}}



		//Test for each non-required param
		//var data = JSON.parse( JSON.stringify(opData.all_params) );
		var special_case_values = [];
		special_cases.forEach( (special_case) => {

			special_case
			.values
			.forEach( (value) => {

				value.param = special_case.param;
				special_case_values.push(value);

			});


		});


		special_case_values.forEach( (value) => {

			it("special case: "+ value.param +" "+ value.name +" param "+ value.value, function (){
				if(config.timeout){
					this.timeout(config.timeout);
				}

				var data =  JSON.parse( JSON.stringify(opData.required_params) );
				data[value.param] =  value.value; 

				if(config.IsPromiseMethod){ 
					//for now special egs will work with rejection until logic to decide further action is implemented. Same for throw below
				 	return expect(serviceMethod(data)).to.be.rejected;
				}
				else
				{
					expect(errTestDelegate(data)).to.throw();
				}

			});

		});




		if(~['both', 'extension'].indexOf(config.run_only)){
		if(raw_callback){
			var r_data = extractParamsFromSpec(serviceSpec);
			raw_callback(it, expect, assert, q, r_data, config.timeout)
		}}


	});



	


}

module.exports = {describeThis: describeThis}; 

/*
In your test file, say user.tes.ts .. All you need do is
var service = require('../service');
var morxcha = require('morxcha');
morxcha.describeThis(service.spec, service.newUser, {TestName:'New User Test'})
*/
/*
console.log( extractParamsFromSpec(serviceSpec) );*/
/*
morxcha.raw( function(expect, assert, q) {
		


})
*/
/*
will need a way for people to add what assert messages should be
How do we specify what fail conditions and all should be?
*/


