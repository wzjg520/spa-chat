/*
routes.js - module 提供路由功能
*/

'use strict'
var
	configRoutes,
	crud        = require( './crud' ),
	chat        = require( './chat' ),
	makeMongoId = crud.makeMongoId;

configRoutes = function ( app, server) {
	app.get('/', function ( request, response) {
		response.redirect( '/spa.html' );
	});

	app.all('/:obj_type/*?', function ( request, response ) {
		response.contentType( 'json' );
		next();
	});

	app.get('/:obj_type/list', function ( request, response ) {
		crud.read(
			request.params.obj_type,
			{},{},
			function ( map_list ) { response.send( map_list ); }
		);
	});

	app.post('/:obj_type/create', function () {
		crud.create(
			request.params.obj_type,
			request.body,
			function ( result_map ) { response.send( result_map ); }
		);
	});

	app.get('/:obj_type/read/:id', function ( request, response) {
		crud.read(
			request.params.obj_type,
			{ _id: makeMongoId( request.params.id )},
			{},
			function ( map_list ) { response.send( map_list ); }
		);
	});

	app.post('/:obj_type/update/:id', function ( request,response ) {
		crud.update(
			request.params.obj_type,
			{ _id : makeMongoId( request.params.id) },
			request.body,
			function ( result_map ) { response.send(result_map); }
		);		
	});

	app.get( '/:obj_type/delete/:id' function ( request, response ) {
		crud.destroy(
			request.params.obj_type,
			{ _id : makeMongoId( request.params.id ) },
			function ( result_map ) { response.send( result_map ); }
		);
	});

	chat.connect( server );

};

module.exports = { configRoutes : configRoutes };


