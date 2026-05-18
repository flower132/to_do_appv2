/*
  router.js
  用途：负责最简单的页面切换。
  用户点击左侧按钮后，这个文件会更新主内容区域。
*/

const pageContent = document.querySelector("#page-content");
const navButtons = document.querySelectorAll(".nav-button");

/*
  renderPage：根据页面名称渲染主内容区域。
*/
function renderPage(pageName) {
  const page = pages[pageName];

  if (page === undefined) {
    return;
  }

  if (pageName === "todo") {
    todoPage.render();
    updateActiveNavButton(pageName);
    return;
  }

  pageContent.innerHTML = createPageHtml(page);
  pageContent.focus();
  updateActiveNavButton(pageName);
}

/*
  createPageHtml：创建非 Todo 页面的占位内容 HTML。
*/
function createPageHtml(page) {
  const listItems = page.items
    .map(function (item) {
      return "<li>" + item + "</li>";
    })
    .join("");

  return (
    '<section class="page-panel">' +
      '<header class="page-header">' +
        "<h2>" + page.title + "</h2>" +
        "<p>" + page.description + "</p>" +
      "</header>" +
      '<ul class="placeholder-list">' +
        listItems +
      "</ul>" +
    "</section>"
  );
}

/*
  updateActiveNavButton：更新左侧导航按钮的选中状态。
*/
function updateActiveNavButton(pageName) {
  for (const button of navButtons) {
    const isCurrentPage = button.dataset.page === pageName;
    button.classList.toggle("is-active", isCurrentPage);
  }
}

/*
  setupNavigation：给左侧导航按钮绑定页面切换事件。
*/
function setupNavigation() {
  for (const button of navButtons) {
    button.addEventListener("click", function () {
      renderPage(button.dataset.page);
    });
  }
}
