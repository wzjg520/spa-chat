/*
 * spa.shell.js
 * Shell module for huahua
 */

/*global $, spa */
spa.shell = (function() {
  'use strict';
  //---------------- 模块作用域变量start --------------
  var
    configMap = {
      anchor_schema_map: {
        chat: {
          opened: true,
          closed: true,
          hidden:true
        }
      },
      resize_interval: 200,
      main_html: String() 
                            + '<div class="spa-shell-head">' 
                                + '<div class="spa-shell-head-logo">' 
                                    + '<h1>花花聊天室</h1>' 
                                    + '<p>完全的javascript应用</p>' 
                                + '</div>' 
                                + '<div class="spa-shell-head-acct"></div>' 
                            + '</div>' 
                            + '<div class="spa-shell-main">' 
                                + '<div class="spa-shell-main-nav"></div>' 
                                + '<div class="spa-shell-main-content"></div>' 
                            + '</div>' 
                            + '<div class="spa-shell-foot"></div>' 
                            + '<div class="spa-shell-modal"></div>'
    },
    stateMap = {
      $container: undefined,
      anchor_map: {},
      resize_idto: undefined
    },
    jqueryMap = {},

    copyAnchorMap, setJqueryMap, changeAnchorPart,
    onResize, onHashchange,
    onTapAcct, onLogin, onLogout,
    setChatAnchor, initModule;
  //----------------- 模块作用域变量end ---------------

  //------------------- 私有方法start ------------------
  // 返回hash映射表
  copyAnchorMap = function() {
    return $.extend(true, {}, stateMap.anchor_map);
  };
  //-------------------- 公有方法end -------------------

  //--------------------- dom  --------------------
  setJqueryMap = function() {
    var $container = stateMap.$container;

    jqueryMap = {
      $container: $container,
      $acct: $container.find('.spa-shell-head-acct'),
      $nav: $container.find('.spa-shell-main-nav')
    };
  };

  changeAnchorPart = function(arg_map) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    KEYVAL:
      for (key_name in arg_map) {
        if (arg_map.hasOwnProperty(key_name)) {

          if (key_name.indexOf('_') === 0) {
            continue KEYVAL;
          }

          anchor_map_revise[key_name] = arg_map[key_name];

          key_name_dep = '_' + key_name;
          if (arg_map[key_name_dep]) {
            anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
          } else {
            delete anchor_map_revise[key_name_dep];
            delete anchor_map_revise['_s' + key_name_dep];
          }
        }
      }

    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }

    return bool_return;
  };

  //hash改变时触发，所有的事件都在这里调度
  onHashchange = function(event) {
    var
      _s_chat_previous, _s_chat_proposed, s_chat_proposed,
      anchor_map_proposed,
      is_ok = true,
      anchor_map_previous = copyAnchorMap();

    //获得最新的hash映射，如果失败回退之前状态 
    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch (s_chat_proposed) {
        case 'opened':
          is_ok = spa.chat.setSliderPosition('opened');
          break;
        case 'closed':
          is_ok = spa.chat.setSliderPosition('closed');
          break;
          case 'hidden':
          is_ok = spa.chat.setSliderPosition('hidden');
          break;
        default:
          spa.chat.setSliderPosition('closed');
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    // 失败后回退
    if (!is_ok) {
      if (anchor_map_previous) {
        $.uriAnchor.setAnchor(anchor_map_previous, null, true);
        stateMap.anchor_map = anchor_map_previous;
      }
      else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    return false;
  };

  onResize = function() {
    if (stateMap.resize_idto) {
      return true;
    }

    spa.chat.handleResize();
    stateMap.resize_idto = setTimeout(
      function() {
        stateMap.resize_idto = undefined;
      },
      configMap.resize_interval
    );

    return true;
  };

  onTapAcct = function(event) {
    var acct_text, user_name, user = spa.model.people.get_user();
    if (user.get_is_anon()) {
      user_name = prompt('请登录');
      spa.model.people.login(user_name);
      jqueryMap.$acct.text('... 正在登陆 ...');
    } else {
      spa.model.people.logout();
    }
    return false;
  };

  onLogin = function(event, login_user) {
    jqueryMap.$acct.text(login_user.name);
  };

  onLogout = function(event, logout_user) {
    jqueryMap.$acct.text('请登录');
  };

  setChatAnchor = function(position_type) {
    return changeAnchorPart({
      chat: position_type
    });
  };

  initModule = function($container) {
    // 缓存dom元素
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    // 配置uriAnchor插件 
    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    // 配置chat模块
    spa.chat.configModule({
      set_chat_anchor: setChatAnchor,
      chat_model: spa.model.chat,
      people_model: spa.model.people
    });
    //初始化spa.chat模块
    spa.chat.initModule(jqueryMap.$container);

    //initModul spa.rl;
    spa.rl.initModule();

    //配置头像模块
    spa.avtr.configModule({
      chat_model: spa.model.chat,
      people_model: spa.model.people
    });
    //初始化头像模块
    spa.avtr.initModule(jqueryMap.$nav);

    $(window)
      .bind('resize', onResize)
      .bind('hashchange', onHashchange)
      .trigger('hashchange');

    $.gevent.subscribe($container, 'spa-login', onLogin);
    $.gevent.subscribe($container, 'spa-logout', onLogout);

    jqueryMap.$acct
      .text('请登录')
      .bind('utap', onTapAcct);
  };

  return {
    initModule: initModule
  };
}());