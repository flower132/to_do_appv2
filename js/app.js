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
  renderPage(getSettings().behavior.defaultPage);
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

startApp();
