/*
  router.js
  用途：负责最简单的页面切换。
  用户点击左侧按钮后，这个文件会更新主内容区域。
*/

const pageContent = document.querySelector("#page-content");
const navButtons = document.querySelectorAll(".nav-button");
let currentPageName = "";

/*
  renderPage：根据页面名称渲染主内容区域。
*/
function renderPage(pageName) {
  const page = pages[pageName];

  if (page === undefined) {
    return;
  }

  currentPageName = pageName;
  updateMobileHeader(pageName);

  if (pageName === "todo") {
    todoPage.render();
    updateActiveNavButton(pageName);
    return;
  }

  if (pageName === "history") {
    historyPage.render();
    updateActiveNavButton(pageName);
    return;
  }

  if (pageName === "calendar") {
    calendarPage.render();
    updateActiveNavButton(pageName);
    return;
  }

  if (pageName === "settings") {
    settingsPage.render();
    updateActiveNavButton(pageName);
    return;
  }

  pageContent.innerHTML = createPageHtml(page);
  pageContent.focus();
  updateActiveNavButton(pageName);
}

/*
  navigateToPage：带轻量动画的页面切换，用于移动端导航。
*/
function navigateToPage(pageName) {
  if (pageName === currentPageName) {
    return;
  }

  if (window.innerWidth > 768) {
    renderPage(pageName);
    return;
  }

  pageContent.classList.add("page-transition-out");
  setTimeout(function () {
    renderPage(pageName);
    pageContent.classList.remove("page-transition-out");
    pageContent.classList.add("page-transition-in");
    requestAnimationFrame(function () {
      pageContent.classList.add("is-visible");
      setTimeout(function () {
        pageContent.classList.remove("page-transition-in", "is-visible");
      }, 220);
    });
  }, 180);
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
  updateActiveNavButton：更新左侧导航按钮和底部 Tab 的选中状态。
*/
function updateActiveNavButton(pageName) {
  for (const button of navButtons) {
    const isCurrentPage = button.dataset.page === pageName;
    button.classList.toggle("is-active", isCurrentPage);
  }

  const mobileTabs = document.querySelectorAll(".mobile-tab[data-page]");
  for (const tab of mobileTabs) {
    const isCurrentPage = tab.dataset.page === pageName;
    tab.classList.toggle("is-active", isCurrentPage);
  }
}

/*
  updateMobileHeader：更新移动端顶部标题栏的页面标题。
*/
function updateMobileHeader(pageName) {
  const titleEl = document.querySelector(".mobile-header__title");
  if (titleEl) {
    titleEl.textContent = t("page." + pageName);
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
