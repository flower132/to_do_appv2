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
    description: "按截止日期查看 Todo。",
    get items() {
      return createCalendarPageItems();
    }
  },
  history: {
    title: "History",
    description: "查看已经完成的 Todo。",
    get items() {
      return createHistoryPageItems();
    }
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

/*
  getTodosByDate：按 dueDate 分组 Todo，没有 dueDate 的归入 no-date。
*/
function getTodosByDate() {
  const groupsByDate = getTodos().reduce(function (groups, todo) {
    const dateKey = hasPageDueDate(todo.dueDate) ? todo.dueDate : "no-date";

    if (groups[dateKey] === undefined) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(todo);
    return groups;
  }, {});

  return Object.keys(groupsByDate)
    .sort(compareDateGroupKeys)
    .map(function (dateKey) {
      return {
        date: dateKey,
        todos: groupsByDate[dateKey].slice().sort(comparePageTodosByCreatedAt)
      };
    });
}

function createCalendarPageItems() {
  const groups = getTodosByDate();

  if (groups.length === 0) {
    return [
      '<div class="calendar-page">' +
        '<p class="todo-empty">暂无 Todo。</p>' +
      "</div>"
    ];
  }

  return [
    '<div class="calendar-page">' +
      groups.map(createCalendarDateGroupHtml).join("") +
    "</div>"
  ];
}

function createCalendarDateGroupHtml(group) {
  const dateTitle = group.date === "no-date" ? "无截止日期" : group.date;
  const countText = group.todos.length + " 项";

  return (
    '<section class="calendar-day">' +
      '<header class="calendar-day__header">' +
        '<h3 class="calendar-day__title">' + escapePageHtml(dateTitle) + "</h3>" +
        '<span class="calendar-day__count">' + countText + "</span>" +
      "</header>" +
      '<ul class="calendar-day__list">' +
        group.todos.map(createReadonlyTodoItemHtml).join("") +
      "</ul>" +
    "</section>"
  );
}

function createHistoryPageItems() {
  const completedTodos = getCompletedTodos().sort(function (firstTodo, secondTodo) {
    return comparePageTodosByCreatedAt(secondTodo, firstTodo);
  });

  if (completedTodos.length === 0) {
    return [
      '<div class="history-page">' +
        '<p class="todo-empty">暂无完成记录。</p>' +
      "</div>"
    ];
  }

  return [
    '<div class="history-page">' +
      '<ul class="history-list">' +
        completedTodos.map(createHistoryTodoItemHtml).join("") +
      "</ul>" +
    "</div>"
  ];
}

function createHistoryTodoItemHtml(todo) {
  return createReadonlyTodoItemHtml(todo, "history");
}

function createReadonlyTodoItemHtml(todo, pageName) {
  const statusText = todo.isCompleted ? "已完成" : "未完成";
  const dueDateHtml = hasPageDueDate(todo.dueDate) ? '<span class="readonly-todo__meta">截止：' + escapePageHtml(todo.dueDate) + "</span>" : "";
  const createdAtHtml = '<span class="readonly-todo__meta">创建：' + escapePageHtml(formatPageDateTime(todo.createdAt)) + "</span>";
  const noteHtml = todo.note === "" ? "" : '<p class="readonly-todo__note">备注：' + escapePageHtml(todo.note) + "</p>";
  const itemClass = pageName === "history" ? " readonly-todo--history" : "";

  return (
    '<li class="readonly-todo' + itemClass + '">' +
      '<div class="readonly-todo__content">' +
        '<div class="readonly-todo__topline">' +
          '<span class="readonly-todo__status">' + statusText + "</span>" +
          '<span class="readonly-todo__quadrant">' + escapePageHtml(getPageQuadrantLabel(todo.quadrant)) + "</span>" +
        "</div>" +
        '<h4 class="readonly-todo__title">' + escapePageHtml(todo.title) + "</h4>" +
        '<div class="readonly-todo__meta-row">' +
          dueDateHtml +
          createdAtHtml +
        "</div>" +
        noteHtml +
      "</div>" +
    "</li>"
  );
}

function compareDateGroupKeys(firstKey, secondKey) {
  if (firstKey === "no-date") {
    return 1;
  }

  if (secondKey === "no-date") {
    return -1;
  }

  return firstKey.localeCompare(secondKey);
}

function comparePageTodosByCreatedAt(firstTodo, secondTodo) {
  return getPageTimeValue(firstTodo.createdAt) - getPageTimeValue(secondTodo.createdAt);
}

function getPageTimeValue(dateText) {
  const timeValue = Date.parse(dateText);

  return Number.isNaN(timeValue) ? 0 : timeValue;
}

function hasPageDueDate(dueDate) {
  return dueDate !== null && dueDate !== "";
}

function formatPageDateTime(dateText) {
  if (dateText === undefined || dateText === null || dateText === "") {
    return "未知";
  }

  return String(dateText).slice(0, 10);
}

function getPageQuadrantLabel(quadrant) {
  const labels = {
    "urgent-important": "重要且紧急",
    "important-not-urgent": "重要不紧急",
    "urgent-not-important": "紧急不重要",
    "not-urgent-not-important": "不重要不紧急"
  };

  return labels[quadrant] || "未分类";
}

function escapePageHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const todoPage = (function () {
  const viewState = {
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
                '<option value="urgent-important">重要且紧急</option>' +
                '<option value="important-not-urgent" selected>重要不紧急</option>' +
                '<option value="urgent-not-important">紧急不重要</option>' +
                '<option value="not-urgent-not-important">不重要不紧急</option>' +
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
            '<option value="urgent-important"' + getSelectedText(viewState.quadrantView, "urgent-important") + ">重要且紧急</option>" +
            '<option value="important-not-urgent"' + getSelectedText(viewState.quadrantView, "important-not-urgent") + ">重要不紧急</option>" +
            '<option value="urgent-not-important"' + getSelectedText(viewState.quadrantView, "urgent-not-important") + ">紧急不重要</option>" +
            '<option value="not-urgent-not-important"' + getSelectedText(viewState.quadrantView, "not-urgent-not-important") + ">不重要不紧急</option>" +
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
    const quadrants = viewState.quadrantView === "all" ? getQuadrantValues() : [viewState.quadrantView];
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
    const todos = getActiveTodos();
    const searchedTodos = getSearchedTodos(todos);
    const quadrantTodos = getQuadrantTodos(searchedTodos);

    return getSortedTodos(quadrantTodos);
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
    const selectedQuadrant = quadrant === undefined ? viewState.quadrantView : quadrant;

    if (selectedQuadrant === "all") {
      return todos.slice();
    }

    return todos.filter(function (todo) {
      return todo.quadrant === selectedQuadrant;
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
    const dueDateHtml = hasDueDate(todo.dueDate) ? '<span class="todo-item__meta">截止：' + escapeHtml(todo.dueDate) + "</span>" : "";
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
      "urgent-important": "重要且紧急",
      "important-not-urgent": "重要不紧急",
      "urgent-not-important": "紧急不重要",
      "not-urgent-not-important": "不重要不紧急"
    };

    return labels[quadrant] || "未分类";
  }

  /*
    setupTodoPageEvents：给当前渲染出来的 Todo 表单和列表绑定事件。
  */
  function setupTodoPageEvents() {
    const todoForm = document.querySelector("#todo-form");
    const todoSortBy = document.querySelector("#todo-sort-by");
    const todoSearch = document.querySelector("#todo-search");
    const todoQuadrantView = document.querySelector("#todo-quadrant-view");
    const todoLists = document.querySelectorAll(".todo-list");

    todoForm.addEventListener("submit", handleTodoSubmit);
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
      quadrant: form.elements.quadrant.value,
      dueDate: form.elements.dueDate.value === "" ? null : form.elements.dueDate.value,
      note: form.elements.note.value.trim()
    });
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
    return String(text)
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
    if (!hasDueDate(dueDate)) {
      return Number.POSITIVE_INFINITY;
    }

    return getTimeValue(dueDate);
  }

  function hasDueDate(dueDate) {
    return dueDate !== null && dueDate !== "";
  }

  function getQuadrantValues() {
    return [
      "urgent-important",
      "important-not-urgent",
      "urgent-not-important",
      "not-urgent-not-important"
    ];
  }

  return {
    render: renderTodoPage
  };
}());
