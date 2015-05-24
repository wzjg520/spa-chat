/*
 * spa.chat.js
 * Chat feature module for SPA
*/


/*global $, spa */

spa.chat = (function () {
  'use strict';
  var
    configMap = {
      main_html : String()
        + '<div class="spa-chat">'
          + '<div class="spa-chat-head">'
            + '<div class="spa-chat-head-toggle">+</div>'
            + '<div class="spa-chat-head-title">'
              + '花花专用聊天室'
            + '</div>'
          + '</div>'
          + '<div class="spa-chat-closer">x</div>'
          + '<div class="spa-chat-sizer">'
            + '<div class="spa-chat-list">'
              + '<div class="spa-chat-list-box"></div>'
            + '</div>'
            + '<div class="spa-chat-msg">'
              + '<div class="spa-chat-msg-log"></div>'
            + '</div>'
            + '<div class="spa-chat-msg-in">'  
                + '<form class="spa-chat-msg-form">'
                + '<a href="javascript:void(0);" id="rl_exp_btn" class="spa-chat-msg-face">表情<span class="face_arrow_top" style="display: none;"></span></a>'
                + '<div class="rl_exp" id="rl_bq" style="display: none;">'
                   + ' <ul class="rl_exp_tab clearfix">'
                       + ' <li><a href="javascript:void(0);" class="selected">默认</a></li>'
                        + '<li><a href="javascript:void(0);">拜年</a></li>'
                        + '<li><a href="javascript:void(0);">浪小花</a></li>'
                        + '<li><a href="javascript:void(0);">暴走漫画</a></li>'
                    + '</ul>'
                    + '<ul class="rl_exp_main clearfix rl_selected"></ul>'
                    + '<ul class="rl_exp_main clearfix" style="display:none;"></ul>'
                    + '<ul class="rl_exp_main clearfix" style="display:none;"></ul>'
                    + '<ul class="rl_exp_main clearfix" style="display:none;"></ul>'
                    + '<a href="javascript:void(0);" class="close">×</a>'
                + '</div>'
                  + '<textarea id="rl_exp_input"></textarea>'
                  + '<input type="submit" style="display:none"/>'
                  + '<div class="spa-chat-msg-send">'
                    + '发送'
                  + '</div>'
                + '</form>'
              + '</div>' 


          + '</div>'
        + '</div>',

      chatHtml : String()  + '<div class="spa-chat-msg-log"></div>',
      settable_map : {
        slider_open_time    : true,
        slider_close_time   : true,
        slider_opened_em    : true,
        slider_closed_em    : true,
        slider_opened_title : true,
        slider_closed_title : true,

        chat_model      : true,
        people_model    : true,
        set_chat_anchor : true,
      },

      slider_open_time     : 250,
      slider_close_time    : 250,
      slider_opened_em     : 40,
      slider_closed_em     : 2,
      slider_opened_title  : '关闭',
      slider_closed_title  : '打开',
      slider_opened_min_em : 20,
      window_height_min_em : 40,

      chat_model      : null,
      people_model    : null,
      set_chat_anchor : null
    },
    stateMap  = {
      $append_target   : null,
      $drag_target : null,
      drag_map : null,
      position_type    : 'closed',
      px_per_em        : 0,
      slider_hidden_px : 0,
      slider_closed_px : 0,
      slider_opened_px : 0
    },
    jqueryMap = {},

    setJqueryMap,  setPxSizes,   scrollChat,
    writeChat,     writeAlert,   clearChat,
    setSliderPosition,
    onTapToggle,   onSubmitMsg,  onTapList,
    onSetchatee,   onUpdatechat, onListchange,
    onLogin,       onLogout, onClearmsg,
    configModule,  initModule,
    removeSlider,  handleResize,
    onHeldstartMsgbox, onHeldmoveMsgbox, onHeldendMsgbox;
  //----------------- 模块作用域变量end ---------------


  //---------------------  dom --------------------
  setJqueryMap = function () {
    var
      $append_target = stateMap.$append_target,
      $slider        = $append_target.find( '.spa-chat' );

    jqueryMap = {
      $slider   : $slider,
      $head     : $slider.find( '.spa-chat-head' ),
      $toggle   : $slider.find( '.spa-chat-head-toggle' ),
      $title    : $slider.find( '.spa-chat-head-title' ),
      $sizer    : $slider.find( '.spa-chat-sizer' ),
      $list_box : $slider.find( '.spa-chat-list-box' ),
      $msg_box : $slider.find( '.spa-chat-msg' ),
      $msg_log  : $slider.find( '.spa-chat-msg-log' ),
      $msg_in   : $slider.find( '.spa-chat-msg-in' ),
      $input    : $slider.find( '.spa-chat-msg-in textarea'),
      $send     : $slider.find( '.spa-chat-msg-send' ),
      $form     : $slider.find( '.spa-chat-msg-form' ),
      $chat_hidden : $slider.find('.spa-chat-closer'),
      $window   : $(window)
    };
  };

  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;

    px_per_em = spa.util_b.getEmSize( jqueryMap.$slider.get(0) );
    window_height_em = Math.floor(
      ( jqueryMap.$window.height() / px_per_em ) + 0.5
    );

    opened_height_em
      = window_height_em >= configMap.window_height_min_em
      ? configMap.slider_opened_em
      : configMap.slider_opened_min_em;

    stateMap.px_per_em        = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = opened_height_em * px_per_em; //这里定义spa-chat的高度

    jqueryMap.$sizer.css({
 //      height : ( opened_height_em - 2 ) * px_per_em
         height : 'auto'
    });
  };

  setSliderPosition = function ( position_type, callback ) {
    var
      height_px, animate_time, slider_title, toggle_text;

    //匿名用户不允许打开聊天对话框
    if ( position_type === 'opened'
      && configMap.people_model.get_user().get_is_anon()
    ){ return false; }

    if ( stateMap.position_type === position_type ){
      if ( position_type === 'opened' ) {
        jqueryMap.$input.focus();
      }
      return true;
    }

    switch ( position_type ){
      case 'opened' :
//        height_px    = stateMap.slider_opened_px;
       

        if( $( window ).scrollTop() > 1 ) {
          height_px    = stateMap.slider_opened_px;
        }
        else {
           height_px = '100%'; //默认等于设备高度
        } 
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text  = '=';
      break;

      case 'hidden' :
        height_px    = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text  = '+';
      break;

      case 'closed' :
        height_px    = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '+';
      break;
      //未知状态
      default : return false;
    }
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      { height : height_px },
      animate_time,
      function () {
        jqueryMap.$toggle.prop( 'title', slider_title );
        jqueryMap.$toggle.text( toggle_text );
        stateMap.position_type = position_type;
        if ( callback ) { callback( jqueryMap.$slider ); }
      }
    );
    return true;
  };

  scrollChat = function() {
    var $msg_log = jqueryMap.$msg_box.find( '.spa-chat-msg-log:visible' );
    $msg_log.animate(
      { scrollTop : $msg_log.prop( 'scrollHeight' )
        - $msg_log.height()
      },
      150
    );
  };

  writeChat = function ( obj ) {
     var person_name = obj.sender_name,
        sender_id = obj.sender_id,
        dest_id = obj.dest_id,
       text = obj.text,
       is_user = obj.is_user,
       msg_date = obj.msg_date,
        msg_class = is_user
        ? 'spa-chat-msg-log-me' : 'spa-chat-msg-log-msg',
        $dest_msg_log,
        dest_selector;

      if (  is_user ) {
        //jqueryMap.$msg_box.find( '.spa-chat-msg-log' ).hide().end().find( '.spa-chat-msg-log[data-id="' + arg_map.new_chatee.id + '"]' ).hide();
        dest_selector = '.spa-chat-msg-log[data-id="' + dest_id + '"]';

      }
      else {
        // if ( jqueryMap.$msg_box.find( '.spa-chat-msg-log[data-id="' + sender_id + '"]' ).length ) {
        // }
        // else {
        //   $dest_msg_log = $( configMap.chatHtml );
        //   $dest_msg_log.attr( 'data-id', sender_id);
        //   $dest_msg_log.hide();
        //   console.log($dest_msg_log);
        //   jqueryMap.$msg_box.find( '.spa-chat-msg-log' ).eq( 0 ).after( $dest_msg_log );
        // }

        dest_selector = '.spa-chat-msg-log[data-id="' + sender_id + '"]';
      }
    jqueryMap.$msg_box.find( dest_selector ).append( 
         '<div class="' + msg_class + '">'
            + '<span class="spa-chat-msg-sender">'
            + spa.util_b.encodeHtml(person_name) 
            + '</span>'
            + '<p class="spa-chat-msg-wrap">'
            + spa.util_b.encodeHtml(text).replace(/\[(a|b|c|d)_([0-9]+)\]/g,'<img src="'+'images/face/$1/$2.gif" border="0">') .replace( /(\r\n)|\n/g, '</br>' )
            + '</p>'
        + '</div><div style="clear:both"></div>' 
    );
    scrollChat();
  };

  writeAlert = function ( alert_text, dest_id) {
    if ( arguments.length == 2 ) {
       jqueryMap.$msg_box.find('.spa-chat-msg-log[data-id="' + dest_id + '"]').append(
        '<div class="spa-chat-msg-log-alert">'
          + spa.util_b.encodeHtml(alert_text)
        + '</div>'
      );
    } 
    else {
       jqueryMap.$msg_box.find( '.xpa-chat-msg-log:visible' ).append(
        '<div class="spa-chat-msg-log-alert">'
          + spa.util_b.encodeHtml(alert_text)
        + '</div>'
      );
    }
   
    scrollChat();
  };

  clearChat = function () { jqueryMap.$msg_log.empty(); };
  //---------------------- dom ---------------------

  //------------------- 事件start -------------------
  onTapToggle = function ( event ) {
    var set_chat_anchor = configMap.set_chat_anchor;
    if ( stateMap.position_type === 'opened' ) {
      set_chat_anchor( 'closed' );
    }
    else if ( stateMap.position_type === 'closed' ){
      set_chat_anchor( 'opened' );
    }
    
    // if ( event.target == jqueryMap.$chat_hidden[ 0 ] ) {
    //     set_chat_anchor('hidden');
    // }
    return false;
  };

  onSubmitMsg = function ( event ) {
    if ( (event.type == 'keyup' && event.ctrlKey == true && event.keyCode == 13) || event.type == 'utap') {
      var msg_text = jqueryMap.$input.val();
      if ( msg_text.trim() === '' ) { return false; }
      configMap.chat_model.send_msg( msg_text );
      jqueryMap.$input.focus();
      jqueryMap.$send.addClass( 'spa-x-select' );
      setTimeout(
        function () { jqueryMap.$send.removeClass( 'spa-x-select' ); },
      1000
      );
      return false;
    }   
  };

  onTapList = function ( event ) {
    var $tapped  = $( event.elem_target ), chatee_id;
    if ( ! ( $tapped.hasClass('spa-chat-list-name') || $tapped.hasClass('spa-chat-msg-notice') ) ) { return false; }
    chatee_id = $tapped.attr( 'data-id' ) || $tapped.parent().attr( 'data-id' );
    if ( ! chatee_id ) { return false; }
    configMap.chat_model.set_chatee( chatee_id, true );
    return false;
  };

  onSetchatee = function ( event, arg_map ) {
    var
      new_chatee = arg_map.new_chatee,
      old_chatee = arg_map.old_chatee,
      is_utip = arg_map.is_utip,
      $dest_msg_log,
      new_msg_num;
    jqueryMap.$input.focus();
    if ( ! new_chatee ) {
      if ( old_chatee ) {
        writeAlert( old_chatee.name + ' 已经离开聊天室' );
      }
      else {
        writeAlert( '你的朋友已经离开聊天室' );
      }
      jqueryMap.$title.text( '花花专用聊天室');
      return false;
    }

    if ( jqueryMap.$msg_box.find( '.spa-chat-msg-log[data-id="' + arg_map.new_chatee.id + '"]' ).length ) {
        is_utip && jqueryMap.$msg_box.find( '.spa-chat-msg-log' ).hide().end().find( '.spa-chat-msg-log[data-id="' + arg_map.new_chatee.id + '"]' ).show();
    }
    else {
      $dest_msg_log = $( configMap.chatHtml );
      $dest_msg_log.attr( 'data-id', arg_map.new_chatee.id).hide();
      jqueryMap.$msg_box.find( '.spa-chat-msg-log' ).eq( 0 ).after( $dest_msg_log );
      is_utip &&  jqueryMap.$msg_box.find( '.spa-chat-msg-log' ).hide() && $dest_msg_log.show();
    }
    if ( is_utip ) {
      jqueryMap.$list_box
      .find( '.spa-chat-list-name' )
      .removeClass( 'spa-x-select' )
      .end()
      .find( '[data-id=' + arg_map.new_chatee.id + ']' )
      .addClass( 'spa-x-select' )
      .find('.spa-chat-msg-notice').empty();
      window.localStorage[ 'id_' + arg_map.new_chatee.id ] = '0';  
    }
    
      writeAlert( '现在和 ' + arg_map.new_chatee.name +' 聊天' + '---' + (new Date).toLocaleString(), arg_map.new_chatee.id );  
    jqueryMap.$title.text( '和 ' + arg_map.new_chatee.name + ' 聊天');
    return true;
  };

  onListchange = function ( event ) {
    var
      list_html = String(),
      people_db = configMap.people_model.get_db(),
      chatee    = configMap.chat_model.get_chatee();


    people_db().each( function ( person, idx ) {
      var select_class = '';

      if ( person.get_is_anon() || person.get_is_user()
      ) { return true;}

      if ( chatee && chatee.id === person.id ) {
        select_class=' spa-x-select';
      }
      list_html
        += '<div class="spa-chat-list-name'
        +  select_class + '" data-id="' + person.id + '">'
        +  spa.util_b.encodeHtml( person.name ) + '<span class="spa-chat-msg-notice"></span></div>';
    });

    if ( ! list_html ) {
      list_html = String()
        + '<div class="spa-chat-list-note">'
        + '聊天室里很冷清...<br><br>'
        + '无人在线'
        + '</div>';
      clearChat();
    }
    jqueryMap.$list_box.html( list_html );
  };

  onUpdatechat = function ( event, msg_map ) {
    var
      is_user,
      sender_id = msg_map.sender_id,
      msg_text  = msg_map.msg_text,
      msg_date = msg_map.date,
      chatee    = configMap.chat_model.get_chatee() || {},
      sender    = configMap.people_model.get_by_cid( sender_id ),
      new_msg_num;

    if ( ! sender ) {
      writeAlert( msg_text );
      return false;
    }

    is_user = sender.get_is_user();

    if ( ! ( is_user  || sender_id === chatee.id ) ) {
      configMap.chat_model.set_chatee( sender_id );
    }



  if (!is_user && jqueryMap.$msg_box.find( '[data-id=' + msg_map.sender_id + ']' ).is( ':hidden' ) ) {
      new_msg_num = parseInt( window.localStorage[ 'id_' + msg_map.sender_id ]||0 );
      new_msg_num += 1;
      jqueryMap.$list_box
        .find( '[data-id=' + msg_map.sender_id + ']' )
        .find( '.spa-chat-msg-notice' ).html(' (' + new_msg_num + ')');
      window.localStorage[ 'id_' + msg_map.sender_id ] = new_msg_num ;
    } 


    writeChat({
      sender_id : msg_map.sender_id,
      dest_id : msg_map.dest_id,
      sender_name : sender.name,
      text : msg_text,
      is_user : is_user
    });

    if ( is_user ) {
      jqueryMap.$input.val( '' );
      jqueryMap.$input.focus();
    }
  };

  onLogin = function ( event, login_user ) {
    configMap.set_chat_anchor( 'opened' );
  };

  onLogout = function ( event, logout_user ) {
    configMap.set_chat_anchor( 'closed' );
    jqueryMap.$title.text( '花花专用聊天室' );
    clearChat();
  };

  //--------------------事件end --------------------


  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };

  onHeldstartMsgbox = function ( e ) {
     var
      $target = $( e.elem_target ).closest('.spa-chat-msg-log');
      
      if ( $target.length === 0 ){ return false; }
      stateMap.$drag_target = $target;
      stateMap.drag_map = { top : -$target.scrollTop() };
  };
  onHeldmoveMsgbox = function ( e ) {
    var drag_map = stateMap.drag_map;
    if ( ! drag_map ){ return false; }

    drag_map.top  += e.px_delta_y;
    stateMap.$drag_target.scrollTop( -drag_map.top );
  };
  onHeldendMsgbox = function ( e ) {
    var $drag_target = stateMap.$drag_target;
    if ( ! $drag_target ){ return false; }
  };

  initModule = function ( $append_target ) {
    var $list_box;

    // 加载 chat slider html 和 jquery cache
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    setPxSizes();

    // 初始化chat
    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    stateMap.position_type = 'closed';

    //订阅全局事件
    $list_box = jqueryMap.$list_box;
    $.gevent.subscribe( $list_box, 'spa-listchange', onListchange );
    $.gevent.subscribe( $list_box, 'spa-setchatee',  onSetchatee  );
    $.gevent.subscribe( $list_box, 'spa-updatechat', onUpdatechat );  //更新消息
    $.gevent.subscribe( $list_box, 'spa-login',      onLogin      );
    $.gevent.subscribe( $list_box, 'spa-logout',     onLogout     );

    // 绑定个人事件
    jqueryMap.$head.bind(     'utap', onTapToggle );
    jqueryMap.$list_box.bind( 'utap', onTapList  );
    jqueryMap.$send.bind(     'utap', onSubmitMsg );
    jqueryMap.$form.bind(   'keyup', onSubmitMsg );

    //绑定滚动条事件
      jqueryMap.$msg_box
      .bind( 'udragstart', onHeldstartMsgbox )
      .bind( 'udragmove',  onHeldmoveMsgbox  )
      .bind( 'udragend',   onHeldendMsgbox   );

  };

  removeSlider = function () {

    if ( jqueryMap.$slider ) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }
    stateMap.$append_target = null;
    stateMap.position_type  = 'closed';

    configMap.chat_model      = null;
    configMap.people_model    = null;
    configMap.set_chat_anchor = null;

    return true;
  };

  handleResize = function () {
    if ( ! jqueryMap.$slider ) { return false; }
    setPxSizes();
    if ( stateMap.position_type === 'opened' ){
      jqueryMap.$slider.css({ 
        height : stateMap.slider_opened_px
 //       height :  '100%'
      });
    }
    return true;
  };

  return {
    setSliderPosition : setSliderPosition,
    configModule      : configModule,
    initModule        : initModule,
    removeSlider      : removeSlider,
    handleResize      : handleResize
  };

}());
