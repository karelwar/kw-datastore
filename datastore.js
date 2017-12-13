/*jshint esversion: 6*/
//load database
var Datastore = require('nedb');
var path = require("path");
let DATASTORE_ROOT =  __dirname + "/datastore/";
let DATASTORE_EXT = ".db";
console.log("datastore root path: " +DATASTORE_ROOT);

var exec = require('child_process').exec;
var fs = require('fs');

var dbs = [];

var DS_OKAY = {code:1, msg:"Okay" ,data:[]};
var DS_DB_NOT_EXISTS = {code:2, msg:"Database doesn't exists!" ,data:[]};
var DS_DB_CREATED = {code:3, msg:"Database created" ,data:[]};
var DS_DB_REMOVED = {code:4, msg:"Database removed" ,data:[]};
var DS_DB_EXISTS = {code:5, msg:"Database already exists!" ,data:[]};
var DS_GEN_ERROR = {code:6, msg:"General error!" ,data:[]};

exports.routes={
	"new_db" : "/new_db/:name",
	"delete_db" : "/delete_db/:name",
	"list_kvs" : "/list_kvs/:db",
	"add_kv" : "/add_kv/:db/:key/:value",
	"get_kv" : "/get_kv/:db/:key",
	"update_kv" : "/update_kv/:db/:id/:key/:value",
	"remove_kv" : "/remove_kv/:db/:id"
};

exports.new_db = function(name,callback){
	let dbFilename = DATASTORE_ROOT + name + DATASTORE_EXT;
	if (fs.existsSync(dbFilename)){
		let ret = DS_DB_EXISTS;
		ret.data=[];
		callback(ret);
	} else {
		dbs[name] = new Datastore({filename: dbFilename, autoload:true, timestampData: true});
		let ret = DS_OKAY;
		ret.data=[];
		callback(ret);
	}
}

exports.delete_db = function(name,callback){
	let dbFilename = DATASTORE_ROOT + name + DATASTORE_EXT;
	if (fs.existsSync(dbFilename)){
		fs.unlink(dbFilename,function(err){
			if(err != undefined){
				let ret = DS_GEN_ERROR;
				ret.data = err;
				callback(ret);
			} else {
				let ret = DS_OKAY;
				ret.data=[];
				callback(ret);
			}
		});		
	} else {
		callback(DS_DB_NOT_EXISTS);
	}
}

myStore = function(key,value){
    var data = {};
    data.key = key;
    data.value = value;
    return data;
}

exports.add_kv = function(db,key, value,callback){
	if(dbs[db] != undefined ){
		var tab = myStore(key,value);
		tab.created = new Date().valueOf();
		dbs[db].insert(tab);
		let ret = DS_OKAY;
		ret.data = [];
		callback(ret);
	} else {
		let ret = DS_DB_NOT_EXISTS;
		ret.data = [];
		callback(ret);
	}
}

exports.update_kv = function(db,id,key,value,callback){
	if(dbs[db] != undefined ){	
		dbs[db].update({_id: id}, myStore(key, value));
		let ret = DS_OKAY;
		ret.data = [];
		callback(ret);
	} else {
		let ret = DS_DB_NOT_EXISTS;
		ret.data = [];
		callback(ret);
	}
};

exports.remove_kv = function(db,_id,callback){
	if(dbs[db] != undefined ){	
		dbs[db].remove({_id: _id}, {});
		let ret = DS_OKAY;
		ret.data = [];
		callback(ret);		
	} else {
		let ret = DS_DB_NOT_EXISTS;
		ret.data = [];
		callback(ret);
	}
};

// Iterates through all the KV entries in the db and calls the callback with the entries
exports.list_kvs = function(db, callback){
	if(dbs[db] != undefined ){	
		dbs[db].find({}).sort({ created: -1 }).exec(function(err, docs){
			let ret = DS_OKAY;
			ret.data = docs;
			callback(ret);
		});
	} else {
		let ret = DS_DB_NOT_EXISTS;
		ret.data = [];
		callback(ret);
	}
};

exports.get_kv = function(db,key, callback) {
	if(dbs[db] != undefined ){	
		dbs[db].find({key: key}).exec(function(err,docs){
			let ret = DS_OKAY;
			ret.data = docs;
			callback(ret);
		});
	}else{
		let ret = DS_DB_NOT_EXISTS;
		ret.data = [];
		callback(ret);
	}
};

exports.get_all = function(callback){
	db.find({}).exec(function(err,docs){
		callback(err,docs);
	});
};

// exports.get_backup_names = function(){
// 	var backups = [];
// 	fs.readdirSync(__dirname + '/crontabs').forEach(function(file){
// 		// file name begins with backup
// 		if(file.indexOf("backup") === 0){
// 			backups.push(file);
// 		}
// 	});

// 	// Sort by date. Newest on top
// 	for(var i=0; i<backups.length; i++){
// 		var Ti = backups[i].split("backup")[1];
// 		Ti = new Date(Ti.substring(0, Ti.length-3)).valueOf();
// 		for(var j=0; j<i; j++){
// 			var Tj = backups[j].split("backup")[1];
// 			Tj = new Date(Tj.substring(0, Tj.length-3)).valueOf();
// 			if(Ti > Tj){
// 				var temp = backups[i];
// 				backups[i] = backups[j];
// 				backups[j] = temp;
// 			}
// 		}
// 	}

// 	return backups;
// };

// exports.backup = function(){
// 	//TODO check if it failed
// 	fs.createReadStream( __dirname + '/datastore/datastore.db').pipe(fs.createWriteStream( __dirname + '/datastore/backup ' + (new Date()).toString().replace("+", " ") + '.db'));
// };

// exports.restore = function(db_name){
// 	fs.createReadStream( __dirname + '/datastore/' + db_name).pipe(fs.createWriteStream( __dirname + '/datastore/datastore.db'));
// 	db.loadDatabase(); // reload the database
// };


exports.reload_dbs = function(){
	fs.readdirSync(DATASTORE_ROOT).forEach(function(file){
		if(file.indexOf(".db")>0){
			let dbName = file.split(".db")[0];
			console.log("- loading datastore "+dbName+" ("+DATASTORE_ROOT+"/"+file+")");
			dbs[dbName] = new Datastore({ filename: DATASTORE_ROOT+"/"+file, autoload:true, timestampData: true });
		}		
		// file name begins with backup
	});
};

exports.get_env = function(){
	if (fs.existsSync(exports.env_file)) {
		return fs.readFileSync(exports.env_file , 'utf8').replace("\n", "\n");
	}
	return "";
};

exports.reload_dbs();