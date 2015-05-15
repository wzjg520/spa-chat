// 提供数据库的增删改查功能

// --------- 声明全局变量开始 ---------
'use strict';

var
	loadSchema, checkSchema, clearIsOnline,
	checkType, constructObj, readObj,
	updateObj, destroyObj,

	mongodb = require( 'mongodb' ),
	fsHandle = require( 'fs' ),
	JSV = require( 'JSV' ).JSV,
	
	mongodbServer = new mongodb.Server(
		'localhost',
		mongodb.Connection.DEFAULT_PORT
	),
	
	dbHandle = new mongodb.Db( 'spa', mongoServer, { safe : true} ),

	validator = JSV.createEnvironment(),

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

// --------- 可复用方法end --------

// --------- 公共方法start --------

clearOnline = function () {
	updateObj(


	);
};
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
	checkSchema(obj_type, set_map, function ( error_list){
		if ( error_list.length === 0 ) {

		}
	})
};

checkType = function ( obj_type ) {
	if ( ! objTypeMap[ obj_type ]) {
		return (
			{ error_msg : 'Object type "' + obj_type + '" is not supported.'}
		);
	}
	return null;
};
console.log('help')
// -------- 公共方法end ---------