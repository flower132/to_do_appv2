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
  const viewState = {
    filter: "all",
    sortBy: "createdAt",
    search: "",
    quadrantView: "all"
  };

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
          '<div class="todo-form__grid">' +
            '<label class="todo-form__field" for="todo-quadrant">' +
              '<span class="todo-form__field-label">象限</span>' +
              '<select class="todo-form__select" id="todo-quadrant" name="quadrant">' +
                '<option value="1">重要且紧急</option>' +
                '<option value="2" selected>重要不紧急</option>' +
                '<option value="3">紧急不重要</option>' +
                '<option value="4">不重要不紧急</option>' +
              "</select>" +
            "</label>" +
            '<label class="todo-form__field" for="todo-due-date">' +
              '<span class="todo-form__field-label">截止日期</span>' +
              '<input class="todo-form__input" id="todo-due-date" name="dueDate" type="date">' +
            "</label>" +
          "</div>" +
          '<label class="todo-form__field" for="todo-note">' +
            '<span class="todo-form__field-label">备注</span>' +
            '<textarea class="todo-form__textarea" id="todo-note" name="note" rows="3" placeholder="补充说明"></textarea>' +
          "</label>" +
        "</form>" +
        createTodoControlsHtml() +
        createQuadrantsHtml() +
      "</section>"
    );
  }

  /*
    createTodoControlsHtml：创建 Todo 列表筛选和排序控件。
  */
  function createTodoControlsHtml() {
    return (
      '<div class="todo-controls">' +
        '<label class="todo-controls__field" for="todo-filter">' +
          '<span class="todo-controls__label">筛选</span>' +
          '<select class="todo-controls__select" id="todo-filter" name="filter">' +
            '<option value="all"' + getSelectedText(viewState.filter, "all") + ">全部</option>" +
            '<option value="active"' + getSelectedText(viewState.filter, "active") + ">未完成</option>" +
            '<option value="completed"' + getSelectedText(viewState.filter, "completed") + ">已完成</option>" +
          "</select>" +
        "</label>" +
        '<label class="todo-controls__field" for="todo-sort-by">' +
          '<span class="todo-controls__label">排序</span>' +
          '<select class="todo-controls__select" id="todo-sort-by" name="sortBy">' +
            '<option value="createdAt"' + getSelectedText(viewState.sortBy, "createdAt") + ">创建时间</option>" +
            '<option value="dueDate"' + getSelectedText(viewState.sortBy, "dueDate") + ">截止日期</option>" +
          "</select>" +
        "</label>" +
        '<label class="todo-controls__field" for="todo-search">' +
          '<span class="todo-controls__label">搜索</span>' +
          '<input class="todo-controls__select" id="todo-search" name="search" type="search" value="' + escapeHtml(viewState.search) + '" placeholder="搜索 Todo">' +
        "</label>" +
        '<label class="todo-controls__field" for="todo-quadrant-view">' +
          '<span class="todo-controls__label">象限</span>' +
          '<select class="todo-controls__select" id="todo-quadrant-view" name="quadrantView">' +
            '<option value="all"' + getSelectedText(viewState.quadrantView, "all") + ">全部</option>" +
            '<option value="1"' + getSelectedText(viewState.quadrantView, "1") + ">重要且紧急</option>" +
            '<option value="2"' + getSelectedText(viewState.quadrantView, "2") + ">重要不紧急</option>" +
            '<option value="3"' + getSelectedText(viewState.quadrantView, "3") + ">紧急不重要</option>" +
            '<option value="4"' + getSelectedText(viewState.quadrantView, "4") + ">不重要不紧急</option>" +
          "</select>" +
        "</label>" +
      "</div>"
    );
  }

  /*
    createQuadrantsHtml：创建 Todo 四象限区域。
  */
  function createQuadrantsHtml() {
    const visibleTodos = getVisibleTodos();
    const quadrants = viewState.quadrantView === "all" ? [1, 2, 3, 4] : [Number(viewState.quadrantView)];
    const quadrantPanels = quadrants
      .map(function (quadrant) {
        return createQuadrantPanelHtml(quadrant, visibleTodos);
      })
      .join("");

    return '<div class="todo-quadrants">' + quadrantPanels + "</div>";
  }

  /*
    createQuadrantPanelHtml：创建单个象限区域。
  */
  function createQuadrantPanelHtml(quadrant, visibleTodos) {
    const todos = getQuadrantTodos(visibleTodos, quadrant);

    return (
      '<section class="todo-quadrant-panel">' +
        '<h3 class="todo-quadrant-panel__title">' + escapeHtml(getQuadrantLabel(quadrant)) + "</h3>" +
        createTodoListHtml(todos) +
      "</section>"
    );
  }

  /*
    createTodoListHtml：根据传入的 todos 创建列表 HTML。
  */
  function createTodoListHtml(todos) {
    if (todos.length === 0) {
      return '<p class="todo-empty">暂无 Todo。</p>';
    }

    return '<ul class="todo-list">' + createTodoItemsHtml(todos) + "</ul>";
  }

  /*
    createTodoItemsHtml：复用单个 Todo 的渲染逻辑创建列表项。
  */
  function createTodoItemsHtml(todos) {
    return todos
      .map(function (todo) {
        return createTodoItemHtml(todo);
      })
      .join("");
  }

  /*
    getVisibleTodos：从数据源经 query layer 派生最终可见 Todo。
  */
  function getVisibleTodos() {
    const todos = getTodos();

    return getSortedTodos(getQuadrantTodos(getSearchedTodos(getFilteredTodos(todos))));
  }

  /*
    getFilteredTodos：根据 viewState.filter 派生完成状态筛选结果。
  */
  function getFilteredTodos(todos) {
    if (viewState.filter === "active") {
      return todos.filter(function (todo) {
        return !todo.isCompleted;
      });
    }

    if (viewState.filter === "completed") {
      return todos.filter(function (todo) {
        return todo.isCompleted;
      });
    }

    return todos.slice();
  }

  /*
    getSearchedTodos：根据 viewState.search 派生搜索结果。
  */
  function getSearchedTodos(todos) {
    const searchText = viewState.search.trim().toLowerCase();

    if (searchText === "") {
      return todos.slice();
    }

    return todos.filter(function (todo) {
      return getTodoSearchText(todo).includes(searchText);
    });
  }

  /*
    getQuadrantTodos：根据 viewState.quadrantView 或指定象限派生象限结果。
  */
  function getQuadrantTodos(todos, quadrant) {
    const selectedQuadrant = quadrant === undefined ? viewState.quadrantView : String(quadrant);

    if (selectedQuadrant === "all") {
      return todos.slice();
    }

    return todos.filter(function (todo) {
      return String(todo.quadrant) === selectedQuadrant;
    });
  }

  /*
    getSortedTodos：根据 viewState.sortBy 派生排序结果。
  */
  function getSortedTodos(todos) {
    const sortedTodos = todos.slice();

    if (viewState.sortBy === "dueDate") {
      return sortedTodos.sort(compareTodosByDueDate);
    }

    return sortedTodos.sort(compareTodosByCreatedAt);
  }

  /*
    compareTodosByCreatedAt：按创建时间排序。
  */
  function compareTodosByCreatedAt(firstTodo, secondTodo) {
    return getTimeValue(firstTodo.createdAt) - getTimeValue(secondTodo.createdAt);
  }

  /*
    compareTodosByDueDate：按截止日期排序，未设置截止日期的 Todo 排在后面。
  */
  function compareTodosByDueDate(firstTodo, secondTodo) {
    const firstDueDate = getDueDateValue(firstTodo.dueDate);
    const secondDueDate = getDueDateValue(secondTodo.dueDate);

    if (firstDueDate !== secondDueDate) {
      return firstDueDate - secondDueDate;
    }

    return compareTodosByCreatedAt(firstTodo, secondTodo);
  }

  /*
    getTodoSearchText：把 Todo 可搜索字段合成查询文本。
  */
  function getTodoSearchText(todo) {
    return [
      todo.title,
      todo.dueDate,
      todo.note,
      getQuadrantLabel(todo.quadrant)
    ].join(" ").toLowerCase();
  }

  /*
    createTodoItemHtml：根据单个 Todo 对象创建列表项 HTML。
  */
  function createTodoItemHtml(todo) {
    const completedClass = todo.isCompleted ? " is-completed" : "";
    const checkedText = todo.isCompleted ? "checked" : "";
    const dueDateHtml = todo.dueDate === "" ? "" : '<span class="todo-item__meta">截止：' + escapeHtml(todo.dueDate) + "</span>";
    const noteHtml = todo.note === "" ? "" : '<span class="todo-item__note">备注：' + escapeHtml(todo.note) + "</span>";

    return (
      '<li class="todo-item' + completedClass + '">' +
        '<label class="todo-item__main">' +
          '<input class="todo-item__checkbox" type="checkbox" data-action="toggle" data-id="' + todo.id + '" ' + checkedText + ">" +
          '<span class="todo-item__content">' +
            '<span class="todo-item__quadrant">[' + escapeHtml(getQuadrantLabel(todo.quadrant)) + "]</span>" +
            '<span class="todo-item__title">' + escapeHtml(todo.title) + "</span>" +
            dueDateHtml +
            noteHtml +
          "</span>" +
        "</label>" +
        '<button class="todo-item__delete" type="button" data-action="delete" data-id="' + todo.id + '">删除</button>' +
      "</li>"
    );
  }

  /*
    getQuadrantLabel：把 Todo 象限值转换成展示文本。
  */
  function getQuadrantLabel(quadrant) {
    const labels = {
      1: "重要且紧急",
      2: "重要不紧急",
      3: "紧急不重要",
      4: "不重要不紧急"
    };

    return labels[quadrant] || labels[2];
  }

  /*
    setupTodoPageEvents：给当前渲染出来的 Todo 表单和列表绑定事件。
  */
  function setupTodoPageEvents() {
    const todoForm = document.querySelector("#todo-form");
    const todoFilter = document.querySelector("#todo-filter");
    const todoSortBy = document.querySelector("#todo-sort-by");
    const todoSearch = document.querySelector("#todo-search");
    const todoQuadrantView = document.querySelector("#todo-quadrant-view");
    const todoLists = document.querySelectorAll(".todo-list");

    todoForm.addEventListener("submit", handleTodoSubmit);
    todoFilter.addEventListener("change", handleTodoFilterChange);
    todoSortBy.addEventListener("change", handleTodoSortChange);
    todoSearch.addEventListener("change", handleTodoSearchChange);
    todoQuadrantView.addEventListener("change", handleTodoQuadrantViewChange);

    todoLists.forEach(function (todoList) {
      todoList.addEventListener("change", handleTodoListChange);
      todoList.addEventListener("click", handleTodoListClick);
    });
  }

  /*
    handleTodoSubmit：处理新增 Todo 的表单提交。
  */
  function handleTodoSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const title = form.elements.title.value.trim();

    if (title === "") {
      return;
    }

    addTodo({
      title: title,
      quadrant: Number(form.elements.quadrant.value),
      dueDate: form.elements.dueDate.value,
      note: form.elements.note.value.trim()
    });
    renderTodoPage();
  }

  /*
    handleTodoFilterChange：更新当前 Todo 筛选条件。
  */
  function handleTodoFilterChange(event) {
    viewState.filter = event.currentTarget.value;
    renderTodoPage();
  }

  /*
    handleTodoSortChange：更新当前 Todo 排序方式。
  */
  function handleTodoSortChange(event) {
    viewState.sortBy = event.currentTarget.value;
    renderTodoPage();
  }

  /*
    handleTodoSearchChange：更新当前 Todo 搜索关键词。
  */
  function handleTodoSearchChange(event) {
    viewState.search = event.currentTarget.value;
    renderTodoPage();
  }

  /*
    handleTodoQuadrantViewChange：更新当前 Todo 象限视图。
  */
  function handleTodoQuadrantViewChange(event) {
    viewState.quadrantView = event.currentTarget.value;
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

  /*
    getSelectedText：根据当前值生成 select option 的 selected 文本。
  */
  function getSelectedText(currentValue, optionValue) {
    return currentValue === optionValue ? " selected" : "";
  }

  /*
    getTimeValue：把日期字符串转换成可排序数值。
  */
  function getTimeValue(dateText) {
    const timeValue = Date.parse(dateText);

    return Number.isNaN(timeValue) ? 0 : timeValue;
  }

  /*
    getDueDateValue：把截止日期转换成可排序数值，空日期排在最后。
  */
  function getDueDateValue(dueDate) {
    if (dueDate === "") {
      return Number.POSITIVE_INFINITY;
    }

    return getTimeValue(dueDate);
  }

  return {
    render: renderTodoPage
  };
}());
