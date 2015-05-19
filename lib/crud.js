// 提供数据库的增删改查功能

// --------- 声明全局变量开始 ---------
'use strict';

var
	loadSchema,	checkSchema,	clearIsOnline,
	checkType,	constructObj,	readObj,
	updateObj,	destroyObj,	

	mongodb  = require( 'mongodb' ),
	fsHandle = require( 'fs' ),
	JSV      = require( 'JSV' ).JSV,
	
	mongodbServer = new mongodb.Server(
		'localhost',
		mongodb.Connection.DEFAULT_PORT
	),
	
	dbHandle   = new mongodb.Db( 'spa', mongodbServer, { safe : true } ),
	
	validator  = JSV.createEnvironment(),
	
	objTypeMap = { 'user' : {} };
// --------- 声明全局变量结束 ---------

// --------- 可复用方法start --------
loadSchema = function ( schema_name, schema_path ) {	//加载json数据验证格式
	fsHandle.readFile( schema_path, 'utf-8', function ( err, data ) {
		objTypeMap[ schema_name ] = JSON.parse( data );
	});
};


checkSchema = function ( obj_type, obj_map, callback ) {	//验证数据格式
	var
		schema_map = objTypeMap[ obj_type ],	//目前只有user一种类型
		report_map = validator.validate( obj_map, schema_map );	//obj_map是用户提交的json数据，schema_map是标准格式

	callback( report_map.errors );

};

checkType = function ( obj_type ) {
	if ( ! objTypeMap[ obj_type ] ) {
		return (
			{ error_msg : 'Object type "' + obj_type + '" is not supported.' }
		);
	}
	return null;
};

// --------- 可复用方法end --------

// --------- 公共方法start --------


//创建新用户
constructObj = function ( obj_type, obj_map, callback) {
	var type_check_map = checkType( obj_type );
	if ( type_check_map ) {
		callback( type_check_map );
		return;
	}

	checkSchema(
		obj_type,
		obj_map,
		function ( error_list ) {
			if ( error_list.length === 0 ) {
				dbHandle.collection(
					obj_type,
					function ( outer_error, collection ) {
						var options_map = { safe : true };

						collection.insert(
							obj_map,
							options_map,
							function (inner_error,result_map ) {
								callback(result_map);
							}
						);
					}
				);
			}
			else {
				callback({
					error_msg : '无效的文档输入',
					error_list : error_list
				});
			}
		} 
	)
};


//清除所有在线用户
clearIsOnline = function () {
	updateObj(
		'user',
		{ is_online : true },
		{ is_online : false},
		function ( response_map  ) {
			console.log( '所有用户已经下线', response_map);
		}
	);
};

readObj = function ( obj_type, find_map, fields_map, callback ) {
	var type_check_map = checkType( obj_type );
	if ( type_check_map ) {
		callback( type_check_map );
		return;
	}
	dbHandle.collection(
		obj_type,
		function ( outer_error, collection) {
			collection.find( find_map, fields_map ).toArray(function (inner_error, map_list) {
				callback( map_list );
			});
		}
	);
}
/*
 *obj_type 请求类型
 *find_map 查询条件
 *set_map 修改数据
 *callback 回调
**/
updateObj = function ( obj_type, find_map, set_map, callback ) {
	var type_check_map = checkType( obj_type );
	if ( type_check_map ) {
		callback( type_check_map );
		return;
	}

	//验证数据类型
	checkSchema(obj_type, set_map, function ( error_list ){
		if ( error_list.length === 0 ) {
			dbHandle.collection(obj_type, function ( outer_error, collection ) {
				collection.update(
					find_map,
					{ $set : set_map},
					{ safe : true, multi : true, upsert : false},
					function ( inner_error, update_count ) {
						callback( { update_count : update_count } )
					}
				);
				
			})
		}
		else {
			callback({
				error_msg : '输入的文档无效',
				error_list : error_list
			});
		}
	})
};

//清除某个用户
destroyObj = function ( obj_type, find_map, callback) {
	var type_check_map = checkType( obj_type );
	if ( type_check_map ) {
		callback ( type_check_map );
		return;
	}

	dbHandle.collection(
		obj_type,
		function ( outer_error, collection) {
			var options_map = { safe : true, single : true };

			collection.remove(
				find_map,
				options_map, 
				function(inner_error, delete_count){
					callback({ delete_count : delete_count })
				}
			);
		}
	);

};



module.exports = {
	makeMongoId : mongodb.ObjectId,
	checkType : checkType,
	construct : constructObj,
	read : readObj,
	update : updateObj,
	destroy : destroyObj,
};


// -------- 公共方法end ---------

// -------- 初始化模块start ---------
dbHandle.open(function(){
	console.log('****mongodb连接成功****');
	clearIsOnline();
});

(function () {
	var schema_name, schema_path;
	for ( schema_name in objTypeMap ) {
		if ( objTypeMap.hasOwnProperty( schema_name ) ) {
			schema_path = __dirname + '/' + schema_name + '.json';
			loadSchema( schema_name, schema_path );
		}
	}
}());
	


// -------- 初始化模块end -----------
