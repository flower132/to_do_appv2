/*
  appState.js
  轻量全局应用状态中心（发布订阅模式）。
  单一状态源，Settings 驱动全 App UI 自动变化。
  不依赖任何第三方库。
*/

const appState = (function () {
  var _state = {
    settings: null,
    theme: "light",
    locale: "zh-CN",
    page: ""
  };

  var _subscribers = [];

  function _getEffectiveTheme(s) {
    if (!s || !s.appearance) return "light";
    var theme = s.appearance.theme;
    if (theme === "system") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    }
    return theme;
  }

  function getState() {
    return _state;
  }

  function setState(partial) {
    var changed = false;
    for (var key in partial) {
      if (partial.hasOwnProperty(key)) {
        if (_state[key] !== partial[key]) {
          _state[key] = partial[key];
          changed = true;
        }
      }
    }
    if (changed) {
      _notify();
    }
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    _subscribers.push(fn);
    fn(_state);
    return function unsubscribe() {
      var idx = _subscribers.indexOf(fn);
      if (idx !== -1) _subscribers.splice(idx, 1);
    };
  }

  function _notify() {
    for (var i = 0; i < _subscribers.length; i++) {
      try {
        _subscribers[i](_state);
      } catch (e) {}
    }
  }

  function sync() {
    var s = (typeof getSettings === "function") ? getSettings() : {};
    var newTheme = _getEffectiveTheme(s);
    var newLocale = (s.language && s.language.locale) ? s.language.locale : "zh-CN";
    setState({
      settings: s,
      theme: newTheme,
      locale: newLocale
    });
  }

  function init() {
    sync();
  }

  return {
    getState: getState,
    setState: setState,
    subscribe: subscribe,
    sync: sync,
    init: init
  };
})();
