/*
  app.js
  用途：应用入口文件。
  页面加载完成后，从这里启动 App Shell。
*/

/*
  startApp：加载设置、应用到 DOM、初始化导航，并渲染默认页面。
*/
function startApp() {
  applySettingsToDOM();
  setupNavigation();
  setupSystemThemeListener();
  setupMobileNavigation();
  setupFAB();
  setupQuickAdd();
  setupButtonPressFeedback();
  initPWA();
  updateThemeColor();
  navigateToPage(getSettings().behavior.defaultPage);
}

/*
  setupSystemThemeListener：当主题为“跟随系统”时，监听系统主题变化。
*/
function setupSystemThemeListener() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  if (!media || !media.addEventListener) {
    return;
  }
  media.addEventListener("change", function () {
    if (getSettings().appearance.theme === "system") {
      document.documentElement.dataset.theme = getEffectiveTheme();
    }
  });
}

/*
  Toast 系统
  showToast(message, type)：在屏幕底部居中显示一条非阻塞 Toast。
  type: success | info | warning | delete
*/
function showToast(message, type) {
  var container = document.getElementById("toast-container");
  if (container === null) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  var icons = {
    success: "✔",
    info: "📌",
    warning: "⚠",
    delete: "🗑"
  };

  var toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = (icons[type] || icons.info) + " " + message;

  while (container.children.length >= 3) {
    container.removeChild(container.firstChild);
  }

  container.appendChild(toast);

  // 强制回流以触发 transition
  toast.offsetHeight;

  requestAnimationFrame(function () {
    toast.classList.add("is-visible");
  });

  setTimeout(function () {
    toast.classList.remove("is-visible");
    setTimeout(function () {
      if (toast.parentNode !== null) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

/*
  setupMobileNavigation：给移动端底部 Tab Bar 绑定页面切换事件。
*/
var tabIcons = {
  todo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  calendar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  history: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  settings: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  add: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
};

function setupMobileNavigation() {
  const mobileTabs = document.querySelectorAll(".mobile-tab[data-page]");
  for (const tab of mobileTabs) {
    var page = tab.dataset.page;
    if (!tab.querySelector('.mobile-tab__icon') && tabIcons[page]) {
      var iconWrap = document.createElement('span');
      iconWrap.className = 'mobile-tab__icon';
      iconWrap.innerHTML = tabIcons[page];
      tab.insertBefore(iconWrap, tab.firstChild);
    }
    tab.addEventListener("click", function () {
      navigateToPage(tab.dataset.page);
    });
  }

  const quickAddTabs = document.querySelectorAll(".mobile-tab[data-action='quick-add']");
  for (const tab of quickAddTabs) {
    tab.addEventListener("click", openQuickAdd);
  }
}

/*
  setupFAB：给浮动操作按钮绑定快速添加事件。
*/
function setupFAB() {
  const fab = document.querySelector(".fab-button");
  if (fab !== null) {
    fab.addEventListener("click", openQuickAdd);
  }
}

/*
  setupQuickAdd：初始化快速添加面板的打开/关闭/提交事件。
*/
function setupQuickAdd() {
  const panel = document.getElementById("quick-add-panel");
  const backdrop = document.getElementById("quick-add-backdrop");
  const closeBtn = document.getElementById("quick-add-close");
  const form = document.getElementById("quick-add-form");

  if (backdrop !== null) {
    backdrop.addEventListener("click", closeQuickAdd);
  }
  if (closeBtn !== null) {
    closeBtn.addEventListener("click", closeQuickAdd);
  }
  if (form !== null) {
    form.addEventListener("submit", handleQuickAddSubmit);
  }
}

/*
  openQuickAdd：打开快速添加面板并聚焦输入框。
*/
function openQuickAdd() {
  const panel = document.getElementById("quick-add-panel");
  if (panel !== null) {
    panel.classList.add("is-open");
    const input = panel.querySelector(".quick-add-panel__input");
    if (input !== null) {
      setTimeout(function () {
        input.focus();
      }, 100);
    }
  }
}

/*
  closeQuickAdd：关闭快速添加面板并重置表单。
*/
function closeQuickAdd() {
  const panel = document.getElementById("quick-add-panel");
  if (panel !== null) {
    panel.classList.remove("is-open");
  }
  const form = document.getElementById("quick-add-form");
  if (form !== null) {
    form.reset();
  }
}

/*
  handleQuickAddSubmit：处理快速添加表单提交，仅使用 title 快速创建 Todo。
*/
function handleQuickAddSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const input = form.elements.title;
  const title = input.value.trim();

  if (title === "") {
    return;
  }

  addTodo({
    title: title,
    quadrant: "important-not-urgent"
  });

  showToast(t("toast.addedToToday"), "success");
  closeQuickAdd();

  if (currentPageName === "todo") {
    todoPage.render();
  }
}

/*
  updateThemeColor：根据当前主题动态更新 PWA theme-color meta。
*/
function updateThemeColor() {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  var theme = getEffectiveTheme();
  meta.content = theme === 'dark' ? '#0f172a' : '#007aff';
}

/*
  setupButtonPressFeedback：给动态渲染的可点击元素统一添加 Apple 风格 press 反馈。
*/
function setupButtonPressFeedback() {
  var staticElements = document.querySelectorAll('button, .todo-item, .history-item, .calendar-cell, .calendar-selected-panel__item, .readonly-todo');
  for (var i = 0; i < staticElements.length; i++) {
    staticElements[i].classList.add('btn-press');
  }

  document.body.addEventListener('touchstart', function (e) {
    var el = e.target.closest('.todo-item, .history-item, .calendar-cell, .calendar-selected-panel__item, .readonly-todo, button');
    if (el && !el.classList.contains('btn-press')) {
      el.classList.add('btn-press');
    }
  }, { passive: true });
}

/*
  initPWA：初始化 PWA 安装引导 Banner 和状态检测。
*/
function initPWA() {
  var banner = document.getElementById('install-banner');
  var bannerText = document.getElementById('install-banner-text');
  var bannerAction = document.getElementById('install-banner-action');
  var bannerClose = document.getElementById('install-banner-close');

  if (!banner) return;

  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    banner.hidden = true;
    return;
  }

  var bannerDismissed = localStorage.getItem('pwa-install-banner-dismissed');
  if (bannerDismissed) return;

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isAndroid = /Android/.test(navigator.userAgent);
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  var text = '添加到主屏幕，获得更好体验';
  if (isIOS) {
    text = '点击分享按钮并选择"添加到主屏幕"';
  } else if (isAndroid) {
    text = '添加到主屏幕，像 App 一样使用';
  }
  bannerText.textContent = text;

  setTimeout(function () {
    banner.hidden = false;
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }, 2500);

  bannerClose.addEventListener('click', function () {
    banner.classList.remove('is-visible');
    setTimeout(function () {
      banner.hidden = true;
    }, 400);
    localStorage.setItem('pwa-install-banner-dismissed', '1');
  });

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    bannerAction.hidden = false;
  });

  bannerAction.addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        banner.classList.remove('is-visible');
        setTimeout(function () {
          banner.hidden = true;
        }, 400);
      });
    } else if (isIOS && isSafari) {
      showToast('请点击 Safari 底部分享按钮，选择"添加到主屏幕"', 'info');
    } else {
      showToast('请使用浏览器菜单将本页添加到主屏幕', 'info');
    }
  });
}

startApp();
