/*
  app.js
  用途：应用入口文件。
  页面加载完成后，从这里启动 App Shell。
*/

/*
  startApp：初始化导航，并渲染默认 Todo 页面。
*/
function startApp() {
  setupNavigation();
  renderPage("todo");
}

startApp();
