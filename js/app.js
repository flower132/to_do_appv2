/*
  app.js
  用途：应用入口文件。
  页面加载完成后，从这里启动 App Shell。
*/

function startApp() {
  setupNavigation();
  renderPage("todo");
}

startApp();
