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

startApp();
