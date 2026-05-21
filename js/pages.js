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
    description: "按截止日期查看 Todo。"
  },
  history: {
    title: "History",
    description: "查看已经完成的 Todo。"
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

const calendarPage = (function () {
  const calendarState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  };

  const calendarViewState = {
    selectedDate: null
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /*
    renderCalendarPage：渲染 Calendar 页面。
  */
  function renderCalendarPage() {
    pageContent.innerHTML = createCalendarPageHtml();
    setupCalendarPageEvents();
    pageContent.focus();
  }

  /*
    createCalendarPageHtml：创建 Calendar 页面完整 HTML 字符串。
  */
  function createCalendarPageHtml() {
    return (
      '<section class="page-panel">' +
        '<header class="page-header">' +
          "<h2>" + pages.calendar.title + "</h2>" +
          "<p>" + pages.calendar.description + "</p>" +
        "</header>" +
        createCalendarWidgetHtml() +
        createSelectedDatePanelHtml() +
      "</section>"
    );
  }

  /*
    createCalendarWidgetHtml：创建月份网格日历组件 HTML。
  */
  function createCalendarWidgetHtml() {
    const year = calendarState.year;
    const month = calendarState.month;

    return (
      '<div class="calendar-widget">' +
        createCalendarNavHtml(year, month) +
        createWeekdayHeaderHtml() +
        createCalendarGridHtml(year, month) +
      "</div>"
    );
  }

  /*
    createCalendarNavHtml：创建日历标题和月份导航按钮。
  */
  function createCalendarNavHtml(year, month) {
    const title = monthNames[month] + " " + year;

    return (
      '<div class="calendar-nav">' +
        '<button class="calendar-nav__button" type="button" data-action="prev-month">&lt;</button>' +
        '<span class="calendar-nav__title">' + escapePageHtml(title) + "</span>" +
        '<button class="calendar-nav__button" type="button" data-action="next-month">&gt;</button>' +
      "</div>"
    );
  }

  /*
    createWeekdayHeaderHtml：创建星期标题行。
  */
  function createWeekdayHeaderHtml() {
    const cells = weekdayNames.map(function (name) {
      return '<div class="calendar-weekday">' + escapePageHtml(name) + "</div>";
    }).join("");

    return '<div class="calendar-weekdays">' + cells + "</div>";
  }

  /*
    createCalendarGridHtml：创建日期网格，包含空白补齐和日期 cell。
  */
  function getCalendarTodayString() {
    return getTodayString();
  }

  function isCalendarTodoOverdue(todo) {
    return todo.dueDate !== null && todo.dueDate !== "" && todo.dueDate < getCalendarTodayString();
  }

  function createCalendarGridHtml(year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getFirstDayOfWeek(year, month);
    const cells = [];
    var todayString = getCalendarTodayString();

    for (var i = 0; i < firstDayOfWeek; i++) {
      cells.push('<div class="calendar-cell calendar-cell--empty"></div>');
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dateString = formatCalendarDate(year, month, day);
      var dayTodos = getTodosByDate(dateString);
      var todosHtml = createCalendarCellTodosHtml(dayTodos);
      var isSelected = dateString === calendarViewState.selectedDate;
      var selectedClass = isSelected ? " is-selected" : "";
      var isToday = dateString === todayString;
      var todayClass = isToday ? " is-today" : "";
      var numberTodayClass = isToday ? " is-today" : "";

      cells.push(
        '<div class="calendar-cell' + selectedClass + todayClass + '" data-date="' + dateString + '">' +
          '<span class="calendar-cell__number' + numberTodayClass + '">' + day + "</span>" +
          todosHtml +
        "</div>"
      );
    }

    return '<div class="calendar-grid">' + cells.join("") + "</div>";
  }

  function formatCalendarDate(year, month, day) {
    var monthStr = String(month + 1);
    var dayStr = String(day);

    if (monthStr.length < 2) {
      monthStr = "0" + monthStr;
    }

    if (dayStr.length < 2) {
      dayStr = "0" + dayStr;
    }

    return year + "-" + monthStr + "-" + dayStr;
  }

  function createCalendarCellTodosHtml(todos) {
    if (todos.length === 0) {
      return "";
    }

    var maxVisible = 2;
    var visibleTodos = todos.slice(0, maxVisible);
    var remaining = todos.length - maxVisible;

    var itemsHtml = visibleTodos.map(function (todo) {
      var overdueClass = isCalendarTodoOverdue(todo) ? " is-overdue" : "";
      return '<div class="calendar-cell__todo' + overdueClass + '">' + escapePageHtml(todo.title) + "</div>";
    }).join("");

    var moreHtml = remaining > 0
      ? '<div class="calendar-cell__more">+' + remaining + " more</div>"
      : "";

    return '<div class="calendar-cell__todos">' + itemsHtml + moreHtml + "</div>";
  }

  function createSelectedDatePanelHtml() {
    var selectedDate = calendarViewState.selectedDate;
    var panelHtml = "";

    if (selectedDate !== null) {
      var selectedTodos = getTodosByDate(selectedDate);
      panelHtml = createSelectedDateTodosHtml(selectedTodos, selectedDate);
    }

    return (
      '<div class="calendar-selected-panel">' +
        '<h3 class="calendar-selected-panel__title">' +
          (selectedDate !== null ? escapePageHtml(selectedDate) : "选择日期查看 Todo") +
        "</h3>" +
        panelHtml +
      "</div>"
    );
  }

  function createSelectedDateTodosHtml(todos, date) {
    if (todos.length === 0) {
      return '<p class="calendar-selected-panel__empty">该日期没有 Todo。</p>';
    }

    return (
      '<ul class="calendar-selected-panel__list">' +
        todos.map(function (todo) {
          var overdueClass = isCalendarTodoOverdue(todo) ? " is-overdue" : "";
          return (
            '<li class="calendar-selected-panel__item">' +
              '<span class="calendar-selected-panel__todo-title' + overdueClass + '">' + escapePageHtml(todo.title) + "</span>" +
              '<span class="calendar-selected-panel__quadrant">' + escapePageHtml(getPageQuadrantLabel(todo.quadrant)) + "</span>" +
              '<span class="calendar-selected-panel__due-date">' + escapePageHtml(todo.dueDate || "无截止日期") + "</span>" +
              '<span class="calendar-selected-panel__actions">' +
                '<button class="calendar-selected-panel__complete" type="button" data-action="complete" data-id="' + todo.id + '">完成</button>' +
                '<button class="calendar-selected-panel__delete" type="button" data-action="delete" data-id="' + todo.id + '">删除</button>' +
              "</span>" +
            "</li>"
          );
        }).join("") +
      "</ul>"
    );
  }

  /*
    getDaysInMonth：返回指定月份的天数。
  */
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /*
    getFirstDayOfWeek：返回指定月份第一天是星期几（0=Sun）。
  */
  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }

  /*
    setupCalendarPageEvents：绑定日历导航按钮事件和选中面板事件。
  */
  function setupCalendarPageEvents() {
    var widget = pageContent.querySelector(".calendar-widget");

    if (widget !== null) {
      widget.addEventListener("click", handleCalendarClick);
    }

    var panel = pageContent.querySelector(".calendar-selected-panel");

    if (panel !== null) {
      panel.addEventListener("click", handleSelectedPanelClick);
    }
  }

  /*
    handleCalendarClick：处理日历内按钮点击。
  */
  function handleCalendarClick(event) {
    var action = event.target.dataset.action;
    var cell = event.target.closest(".calendar-cell");
    var date = cell !== null ? cell.dataset.date : undefined;

    if (action === "prev-month") {
      goToPrevMonth();
      return;
    }

    if (action === "next-month") {
      goToNextMonth();
      return;
    }

    if (date !== undefined && date !== "") {
      calendarViewState.selectedDate = date;
      renderCalendarPage();
      return;
    }
  }

  /*
    handleSelectedPanelClick：处理选中日期面板的完成和删除按钮点击。
  */
  function handleSelectedPanelClick(event) {
    var action = event.target.dataset.action;
    var id = event.target.dataset.id;

    if (action === "complete" && id !== undefined) {
      toggleTodo(id);
      renderCalendarPage();
      return;
    }

    if (action === "delete" && id !== undefined) {
      deleteTodo(id);
      renderCalendarPage();
      return;
    }
  }

  /*
    goToPrevMonth：切换到上一个月并重新渲染。
  */
  function goToPrevMonth() {
    calendarState.month -= 1;

    if (calendarState.month < 0) {
      calendarState.month = 11;
      calendarState.year -= 1;
    }

    renderCalendarPage();
  }

  /*
    goToNextMonth：切换到下一个月并重新渲染。
  */
  function goToNextMonth() {
    calendarState.month += 1;

    if (calendarState.month > 11) {
      calendarState.month = 0;
      calendarState.year += 1;
    }

    renderCalendarPage();
  }

  return {
    render: renderCalendarPage
  };
}());

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
            '<label class="todo-form__field" for="todo-start-date">' +
              '<span class="todo-form__field-label">开始日期</span>' +
              '<input class="todo-form__input" id="todo-start-date" name="startDate" type="date">' +
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
    getVisibleTodos：从 data.js 经 query layer 派生 Todo 列表（搜索 + 排序）。
    象限过滤只在 createQuadrantPanelHtml 中做一次，避免双重 filter。
  */
  function getVisibleTodos() {
    const todos = getActiveTodos();
    const searchedTodos = getSearchedTodos(todos);

    return getSortedTodos(searchedTodos);
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
    createTodoItemHtml：根据单个 active Todo 对象创建列表项 HTML。
    数据源已通过 getActiveTodos() 过滤，因此不需要处理 completed 状态。
  */
  function createTodoItemHtml(todo) {
    const dueDateHtml = hasDueDate(todo.dueDate) ? '<span class="todo-item__meta">截止：' + escapeHtml(todo.dueDate) + "</span>" : "";
    const noteHtml = todo.note === "" ? "" : '<span class="todo-item__note">备注：' + escapeHtml(todo.note) + "</span>";

    return (
      '<li class="todo-item">' +
        '<label class="todo-item__main">' +
          '<input class="todo-item__checkbox" type="checkbox" data-action="toggle" data-id="' + todo.id + '">' +
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
      startDate: form.elements.startDate.value,
      dueDate: form.elements.dueDate.value,
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

const historyPage = (function () {
  /*
    renderHistoryPage：根据 data.js 提供的已完成 todos 渲染 History 页面。
  */
  function renderHistoryPage() {
    pageContent.innerHTML = createHistoryPageHtml();
    setupHistoryPageEvents();
    pageContent.focus();
  }

  /*
    createHistoryPageHtml：创建 History 页面完整 HTML 字符串。
  */
  function createHistoryPageHtml() {
    var completedTodos = getCompletedTodos().sort(function (firstTodo, secondTodo) {
      return getPageTimeValue(secondTodo.createdAt) - getPageTimeValue(firstTodo.createdAt);
    });

    return (
      '<section class="page-panel">' +
        '<header class="page-header">' +
          "<h2>" + pages.history.title + "</h2>" +
          "<p>" + pages.history.description + "</p>" +
        "</header>" +
        createHistoryContentHtml(completedTodos) +
      "</section>"
    );
  }

  /*
    createHistoryContentHtml：根据已完成 todos 创建列表或空状态 HTML。
  */
  function createHistoryContentHtml(completedTodos) {
    if (completedTodos.length === 0) {
      return (
        '<div class="history-page">' +
          '<p class="history-empty">暂无完成记录。</p>' +
        "</div>"
      );
    }

    return (
      '<div class="history-page">' +
        '<ul class="history-list">' +
          completedTodos.map(createHistoryItemHtml).join("") +
        "</ul>" +
      "</div>"
    );
  }

  /*
    createHistoryItemHtml：为单个已完成的 Todo 创建列表项 HTML。
  */
  function createHistoryItemHtml(todo) {
    var quadrantLabel = getPageQuadrantLabel(todo.quadrant);
    var dueDateHtml = hasPageDueDate(todo.dueDate)
      ? '<span class="history-item__meta">截止：' + escapePageHtml(todo.dueDate) + "</span>"
      : "";
    var completedAtHtml = '<span class="history-item__meta">创建：' + escapePageHtml(formatPageDateTime(todo.createdAt)) + "</span>";
    var noteHtml = todo.note === ""
      ? ""
      : '<p class="history-item__note">备注：' + escapePageHtml(todo.note) + "</p>";

    return (
      '<li class="history-item">' +
        '<div class="history-item__content">' +
          '<div class="history-item__topline">' +
            '<span class="history-item__status">已完成</span>' +
            '<span class="history-item__quadrant">' + escapePageHtml(quadrantLabel) + "</span>" +
          "</div>" +
          '<h3 class="history-item__title">' + escapePageHtml(todo.title) + "</h3>" +
          '<div class="history-item__meta-row">' +
            dueDateHtml +
            completedAtHtml +
          "</div>" +
          noteHtml +
        "</div>" +
        '<div class="history-item__actions">' +
          '<button class="history-item__restore" type="button" data-action="restore" data-id="' + todo.id + '">恢复</button>' +
          '<button class="history-item__delete" type="button" data-action="delete" data-id="' + todo.id + '">永久删除</button>' +
        "</div>" +
      "</li>"
    );
  }

  function setupHistoryPageEvents() {
    var historyList = document.querySelector(".history-list");

    if (historyList === null) {
      return;
    }

    historyList.addEventListener("click", handleHistoryClick);
  }

  function handleHistoryClick(event) {
    var action = event.target.dataset.action;

    if (action === "restore") {
      restoreTodo(event.target.dataset.id);
      renderHistoryPage();
      return;
    }

    if (action === "delete") {
      deleteTodo(event.target.dataset.id);
      renderHistoryPage();
      return;
    }
  }

  return {
    render: renderHistoryPage
  };
}());
