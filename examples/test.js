var morxcha = require('../index');
var q = require('q');
function serviceMethod(data){
	if(!data.id)
		throw new Error("id is required");
	if(!data.email)
		throw("email is required");
	if(!data.fullname)
		throw("fullname is required");
	if(!data.pubkey){
		//throw("pubkey is required");
	}

	if(data.email == "944"){
		throw new Error('invalid email');
	}

	if(data.id == "ab"){
		throw new Error('invalid id');
	}


	if(data.id == 20){
		throw new Error('invalid id');
	}

	//console.log(data.id);


	return "success";
}



function serviceMethodPromise(data){
	var d = q.defer();

	q.fcall( function (){
	if(!data.id)
		throw ("id is required");
	if(!data.email)
		throw("email is required");
	if(!data.fullname)
		throw("fullname is required");
	if(!data.pubkey){
		//throw("pubkey is required");
	}

	if(data.email == "944"){
		throw new Error('invalid email');
	}

	if(data.id == "ab"){
		throw new Error('invalid id');
	}


	if(data.id == 20){
		throw new Error('invalid id');
	}

	return data;
	})
	.then( reda => { d.resolve(reda); })
	.catch( err => { d.reject(err); } )


	return d.promise;
}

var sampleSpec = {
	id:{ required:true, eg:"89", eg_invalid:"ab", eg_alreadyexists:"20"},
	email:{ required:true, eg:"89@gmail.com", validators:"isEmail", eg_invalidemail:"944"},
	fullname:{ required:true, eg:"dewala Alao"},
	pubkey:{ required:false, eg:"SAM-993049-YEU"},
}

morxcha.describeThis(sampleSpec, serviceMethod, {TestName:"MorxCha FirstTest",IsPromiseMethod:false});

morxcha.describeThis(sampleSpec, serviceMethodPromise, {TestName:"MorxCha FirstTest Promises",IsPromiseMethod:true});