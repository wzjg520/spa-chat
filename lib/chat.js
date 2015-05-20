// chat.js 服务器端消息接收处理模块


'use strict';

// --------- 声明全局变量开始 ---------
var 
	emitUsedrList, signIn, signOut, chatObj,
	socket = require( 'socket.io' ),
	crud   = require( './crud' ),

	makeMongoId  = crud.makeMongoId,
	chatterMap = {};

// --------- 声明全局变量结束 ---------


// 广播全部用户列表给所有用户
emitUsedrList = function ( io ) {
	crud.read(
		'user',
		{ is_online : true },
		{},
		function ( result_list ) {
			io.of( '/chat' ).emit( 'listchange', result_list);
		}
	);	
};

//登录
signIn = function ( io, user_map, socket) {
	crud.update(
		'user',
		{ '_id' : user_map._id},
		{ is_online : true},
		function ( result_map ) {
			emitUsedrList( io );
			user_map.is_online = true;
			socket.emit( 'userupdate', user_map);
		}
	);
	chatterMap[ user_map._id ] = socket;
	socket.user_id = user_map._id;
};

//登出
signOut = function ( io, user_id) {
	crud.update(
		'user',
		{ '_id' : user_id },
		{ is_online : false },
		function ( result_list ) { emitUsedrList( io ); }
	);

	delete chatterMap[ user_id ];
};

// ------- 公共方法 -------

chatObj = {
	connect : function ( server ) {
		var io = socket.listen( server );
		//开始设置
		io.set( 'blacklist', [] )
			.of( '/chat' )
			.on('connection', function ( socket ) {
				//创建新用户
				socket.on('adduser', function ( user_map ) {
					crud.read(
						'user',
						{ name : user_map.name},
						{},
						function ( result_list ) {
							var
								result_map,
								cid = user_map.cid;

							delete user_map.cid;
							if ( result_list.length > 0 ) {
								result_map = result_list[ 0 ];
								result_map.cid = cid;
								signIn( io, result_map, socket );
							}
							else {
								//创建新用户
								user_map.is_online = true;
								crud.construct(
									'user',
									user_map,
									function ( result_list ) {
										result_map = result_list.ops[ 0 ];
										result_map.cid = cid;
										chatterMap[ result_map._id ] = socket;
										socket.user_id = result_map._id;
										socket.emit( 'userupdate', result_map );
										emitUsedrList( io );
									}
								);
							}							
						}
					);
				});

				//接收消息
				socket.on('updatechat', function ( chat_map ) {
					if (chatterMap.hasOwnProperty( chat_map.dest_id ) ) {	//接收者存在
						chatterMap[ chat_map.dest_id ]
							.emit( 'updatechat', chat_map );
					}
					else {	//接收者不存在
						var date = new Date();
						socket.emit('updatechat', {
							sender_id : chat_map.sender_id,
							msg_text : chat_map.dest_name + ' 已经下线了。',
							date : date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + '   ' + date.getHours() + ':' + date.getMinutes()
						});
					}
				});

				//用户下线
				socket.on('leavechat', function () {
					console.log( '** %s 下线 **', socket.user_id );
					signOut( io, socket.user_id );
				});

				//断线
				socket.on('disconnect', function () {
					console.log(
						'** %s断线 **',
						socket.user_id
					);
					signOut( io, socket.user_id );
				});

				//更新头像
				socket.on('updateavatar', function ( avatar_map ) {
					crud.update(
						'user',
						{ '_id' : makeMongoId( avatar_map.person_id ) },
						{ css_map : avatar_map.css_map },
						function ( result_list ) { emitUsedrList( io ); }
					);
				});
			});

			return io;	
	} 
};

module.exports = chatObj;

