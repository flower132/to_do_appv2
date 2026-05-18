/*
  pages.js
  用途：保存每个页面的基础信息和 HTML 内容。
  Todo 页面负责 UI 渲染和事件绑定，数据逻辑放在 data.js。
*/

const pages = {
  todo: {
    title: "Todo",
    description: "管理当前待办事项。"
  },
  calendar: {
    title: "Calendar",
    description: "这里将放日历视图。",
    items: [
      "后续按日期查看 Todo",
      "后续显示任务截止日期"
    ]
  },
  history: {
    title: "History",
    description: "这里将放历史完成记录。",
    items: [
      "后续按完成日期分组",
      "后续查看已经完成的 Todo"
    ]
  },
  settings: {
    title: "Settings",
    description: "这里将放应用设置。",
    items: [
      "后续支持基础偏好设置",
      "后续支持清空或重置数据"
    ]
  }
};

const todoPage = (function () {
  /*
    renderTodoPage：根据 data.js 提供的 todos 重新渲染 Todo 页面。
  */
  function renderTodoPage() {
    pageContent.innerHTML = createTodoPageHtml();
    setupTodoPageEvents();
    pageContent.focus();
  }

  /*
    createTodoPageHtml：创建 Todo 页面完整 HTML 字符串。
  */
  function createTodoPageHtml() {
    return (
      '<section class="page-panel">' +
        '<header class="page-header">' +
          "<h2>" + pages.todo.title + "</h2>" +
          "<p>" + pages.todo.description + "</p>" +
        "</header>" +
        '<form class="todo-form" id="todo-form">' +
          '<label class="todo-form__label" for="todo-title">新 Todo</label>' +
          '<div class="todo-form__row">' +
            '<input class="todo-form__input" id="todo-title" name="title" type="text" placeholder="输入待办事项" autocomplete="off">' +
            '<button class="todo-form__button" type="submit">新增</button>' +
          "</div>" +
        "</form>" +
        createTodoListHtml() +
      "</section>"
    );
  }

  /*
    createTodoListHtml：根据 data.js 提供的 todos 创建列表 HTML。
  */
  function createTodoListHtml() {
    const todos = getTodos();

    if (todos.length === 0) {
      return '<p class="todo-empty">暂无 Todo，请先新增一条。</p>';
    }

    const todoItems = todos
      .map(function (todo) {
        return createTodoItemHtml(todo);
      })
      .join("");

    return '<ul class="todo-list">' + todoItems + "</ul>";
  }

  /*
    createTodoItemHtml：根据单个 Todo 对象创建列表项 HTML。
  */
  function createTodoItemHtml(todo) {
    const completedClass = todo.isCompleted ? " is-completed" : "";
    const checkedText = todo.isCompleted ? "checked" : "";

    return (
      '<li class="todo-item' + completedClass + '">' +
        '<label class="todo-item__main">' +
          '<input class="todo-item__checkbox" type="checkbox" data-action="toggle" data-id="' + todo.id + '" ' + checkedText + ">" +
          '<span class="todo-item__title">' + escapeHtml(todo.title) + "</span>" +
        "</label>" +
        '<button class="todo-item__delete" type="button" data-action="delete" data-id="' + todo.id + '">删除</button>' +
      "</li>"
    );
  }

  /*
    setupTodoPageEvents：给当前渲染出来的 Todo 表单和列表绑定事件。
  */
  function setupTodoPageEvents() {
    const todoForm = document.querySelector("#todo-form");
    const todoList = document.querySelector(".todo-list");

    todoForm.addEventListener("submit", handleTodoSubmit);

    if (todoList !== null) {
      todoList.addEventListener("change", handleTodoListChange);
      todoList.addEventListener("click", handleTodoListClick);
    }
  }

  /*
    handleTodoSubmit：处理新增 Todo 的表单提交。
  */
  function handleTodoSubmit(event) {
    event.preventDefault();

    const titleInput = event.currentTarget.elements.title;
    const title = titleInput.value.trim();

    if (title === "") {
      return;
    }

    addTodo(title);
    renderTodoPage();
  }

  /*
    handleTodoListChange：处理 Todo 列表里的完成状态切换。
  */
  function handleTodoListChange(event) {
    if (event.target.dataset.action !== "toggle") {
      return;
    }

    toggleTodo(event.target.dataset.id);
    renderTodoPage();
  }

  /*
    handleTodoListClick：处理 Todo 列表里的删除按钮点击。
  */
  function handleTodoListClick(event) {
    if (event.target.dataset.action !== "delete") {
      return;
    }

    deleteTodo(event.target.dataset.id);
    renderTodoPage();
  }

  /*
    escapeHtml：转义用户输入内容，避免标题影响页面结构。
  */
  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return {
    render: renderTodoPage
  };
}());
