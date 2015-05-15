// chat.js chat模块


'use strict';

// --------- 声明全局变量开始 ---------
var 
	emitUsedrList, signIn, signOut, chatObj,
	socket = require('socket.io'),
	crud = require('./crud'),

	makeMongoId  = crud.makeMongoId,
	chatterMap = {};

// --------- 声明全局变量结束 ---------


// 广播全部用户列表给所有用户

emitUsedrList = function (io) {
	
}
