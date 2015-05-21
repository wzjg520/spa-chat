/*
 * spa.data.js
 * Data module
*/

/*global $, io, spa */

spa.data = (function () {
  'use strict';
  var
    stateMap = { sio : null },
    makeSio, getSio, initModule;

  makeSio = function (){
    var socket = io.connect( '/chat' );


    return {
      emit : function ( event_name, data ) {
        socket.emit( event_name, data );
       return this;
      },
      on   : function ( event_name, callback ) {

          socket.on( event_name, function (){
            callback( arguments );
          });
          return this; 
      },
      unbind : function () {
        socket.removeAllListeners();
        return this;
      }
    };
  };

  getSio = function (){
    if ( ! stateMap.sio ) { stateMap.sio = makeSio(); }
    return stateMap.sio;
  };

  initModule = function (){};

  return {
    getSio     : getSio,
    initModule : initModule
  };
}());
