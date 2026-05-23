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
    description: "Manage app preferences.",
    items: []
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
  return t("quadrant." + quadrant) || t("quadrant.none");
}

function escapePageHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

var emptyStateIcons = {
  todo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 14l2 2 4-4"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
};

function createEmptyStateHtml(iconKey, title, subtitle) {
  var iconSvg = emptyStateIcons[iconKey] || emptyStateIcons.todo;
  return (
    '<div class="empty-state">' +
      '<div class="empty-state__icon">' + iconSvg + "</div>" +
      '<div class="empty-state__title">' + escapePageHtml(title) + "</div>" +
      '<div class="empty-state__subtitle">' + escapePageHtml(subtitle) + "</div>" +
    "</div>"
  );
}

const calendarPage = (function () {
  const calendarState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  };

  const calendarViewState = {
    selectedDate: null,
    selectedTodos: []
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
    var hasAnyActive = getActiveTodos().length > 0;

    return (
      '<section class="page-panel">' +
        '<header class="page-header">' +
          "<h2>" + t("page.calendar") + "</h2>" +
          "<p>" + t("page.calendar.desc") + "</p>" +
        "</header>" +
        createCalendarWidgetHtml() +
        (hasAnyActive ? createSelectedDatePanelHtml() : createEmptyStateHtml("calendar", t("calendar.emptyTitle"), t("calendar.emptySubtitle"))) +
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
      ? '<div class="calendar-cell__more">+' + remaining + " " + t("calendar.more") + "</div>"
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
          (selectedDate !== null ? escapePageHtml(selectedDate) : t("calendar.selectDate")) +
        "</h3>" +
        panelHtml +
      "</div>"
    );
  }

  function createSelectedDateTodosHtml(todos, date) {
    if (todos.length === 0) {
      return '<p class="calendar-selected-panel__empty">' + t("calendar.noTodos") + '</p>';
    }

    var visibleIds = todos.map(function (todo) { return todo.id; });
    var allSelected = visibleIds.every(function (id) {
      return calendarViewState.selectedTodos.includes(id);
    });

    var bulkActionsHtml =
      '<div class="calendar-bulk-actions">' +
        '<button class="calendar-bulk-actions__button" type="button" data-action="toggle-select-all">' + (allSelected ? t("todo.deselectAll") : t("todo.selectAll")) + '</button>';

    if (calendarViewState.selectedTodos.length > 0) {
      bulkActionsHtml +=
        '<button class="calendar-bulk-actions__button calendar-bulk-actions__button--complete" type="button" data-action="bulk-complete">' + t("todo.bulkComplete") + ' (' + calendarViewState.selectedTodos.length + ')</button>' +
        '<button class="calendar-bulk-actions__button calendar-bulk-actions__button--delete" type="button" data-action="bulk-delete">' + t("todo.bulkDelete") + ' (' + calendarViewState.selectedTodos.length + ')</button>';
    }

    bulkActionsHtml += "</div>";

    return (
      bulkActionsHtml +
      '<ul class="calendar-selected-panel__list">' +
        todos.map(function (todo) {
          var overdueClass = isCalendarTodoOverdue(todo) ? " is-overdue" : "";
          var isSelected = calendarViewState.selectedTodos.includes(todo.id) ? " checked" : "";
          return (
            '<li class="calendar-selected-panel__item">' +
              '<input class="calendar-selected-panel__select" type="checkbox" data-action="select" data-id="' + todo.id + '"' + isSelected + '>' +
              '<span class="calendar-selected-panel__todo-title' + overdueClass + '">' + escapePageHtml(todo.title) + "</span>" +
              '<span class="calendar-selected-panel__quadrant">' + escapePageHtml(t("quadrant." + todo.quadrant)) + "</span>" +
              '<span class="calendar-selected-panel__due-date">' + escapePageHtml(todo.dueDate || t("todo.noDueDate")) + "</span>" +
              '<span class="calendar-selected-panel__actions">' +
                '<button class="calendar-selected-panel__complete" type="button" data-action="complete" data-id="' + todo.id + '">' + t("todo.completed") + '</button>' +
                '<button class="calendar-selected-panel__delete" type="button" data-action="delete" data-id="' + todo.id + '">' + t("todo.delete") + '</button>' +
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
      panel.addEventListener("change", handleSelectedPanelChange);
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
      showToast(t("toast.completed"), "success");
      renderCalendarPage();
      return;
    }

    if (action === "delete" && id !== undefined) {
      deleteTodo(id);
      showToast(t("toast.deleted"), "delete");
      renderCalendarPage();
      return;
    }

    if (action === "toggle-select-all") {
      var selectedDate = calendarViewState.selectedDate;
      var todos = getTodosByDate(selectedDate);
      var visibleIds = todos.map(function (todo) { return todo.id; });

      var allSelected = visibleIds.every(function (todoId) {
        return calendarViewState.selectedTodos.includes(todoId);
      });

      if (allSelected) {
        calendarViewState.selectedTodos = [];
      } else {
        visibleIds.forEach(function (todoId) {
          if (!calendarViewState.selectedTodos.includes(todoId)) {
            calendarViewState.selectedTodos.push(todoId);
          }
        });
      }
      renderCalendarPage();
      return;
    }

    if (action === "bulk-complete") {
      var calCompletedCount = calendarViewState.selectedTodos.length;
      calendarViewState.selectedTodos.forEach(function (todoId) {
        toggleTodo(todoId);
      });
      calendarViewState.selectedTodos = [];
      showToast(t("toast.completed"), "success");
      renderCalendarPage();
      return;
    }

    if (action === "bulk-delete") {
      var calDeletedCount = calendarViewState.selectedTodos.length;
      calendarViewState.selectedTodos.forEach(function (todoId) {
        deleteTodo(todoId);
      });
      calendarViewState.selectedTodos = [];
      showToast(t("toast.deletedN").replace("{n}", String(calDeletedCount)), "delete");
      renderCalendarPage();
      return;
    }
  }

  /*
    handleSelectedPanelChange：处理选中日期面板的选择 checkbox 变化。
  */
  function handleSelectedPanelChange(event) {
    var action = event.target.dataset.action;
    var id = event.target.dataset.id;

    if (action === "select" && id !== undefined) {
      if (event.target.checked) {
        calendarViewState.selectedTodos.push(id);
      } else {
        calendarViewState.selectedTodos = calendarViewState.selectedTodos.filter(function (selectedId) {
          return selectedId !== id;
        });
      }
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
    quadrantView: "all",
    selectedTodos: []
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
          "<h2>" + t("page.todo") + "</h2>" +
          "<p>" + t("page.todo.desc") + "</p>" +
        "</header>" +
        '<form class="todo-form" id="todo-form">' +
          '<label class="todo-form__label" for="todo-title">' + t("todo.new") + '</label>' +
          '<div class="todo-form__row">' +
            '<input class="todo-form__input" id="todo-title" name="title" type="text" placeholder="' + t("todo.placeholder") + '" autocomplete="off">' +
            '<button class="todo-form__button" type="submit">' + t("todo.add") + '</button>' +
          "</div>" +
          '<div class="todo-form__grid">' +
            '<label class="todo-form__field" for="todo-quadrant">' +
              '<span class="todo-form__field-label">' + t("todo.quadrant") + '</span>' +
              '<select class="todo-form__select" id="todo-quadrant" name="quadrant">' +
                '<option value="urgent-important">' + t("quadrant.urgent-important") + '</option>' +
                '<option value="important-not-urgent" selected>' + t("quadrant.important-not-urgent") + '</option>' +
                '<option value="urgent-not-important">' + t("quadrant.urgent-not-important") + '</option>' +
                '<option value="not-urgent-not-important">' + t("quadrant.not-urgent-not-important") + '</option>' +
              "</select>" +
            "</label>" +
            '<label class="todo-form__field" for="todo-start-date">' +
              '<span class="todo-form__field-label">' + t("todo.startDate") + '</span>' +
              '<input class="todo-form__input" id="todo-start-date" name="startDate" type="date">' +
            "</label>" +
            '<label class="todo-form__field" for="todo-due-date">' +
              '<span class="todo-form__field-label">' + t("todo.dueDate") + '</span>' +
              '<input class="todo-form__input" id="todo-due-date" name="dueDate" type="date">' +
            "</label>" +
          "</div>" +
          '<label class="todo-form__field" for="todo-note">' +
            '<span class="todo-form__field-label">' + t("todo.note") + '</span>' +
            '<textarea class="todo-form__textarea" id="todo-note" name="note" rows="3" placeholder="' + t("todo.note.placeholder") + '"></textarea>' +
          "</label>" +
        "</form>" +
        createTodoControlsHtml() +
        createTodoBulkActionsHtml() +
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
          '<span class="todo-controls__label">' + t("todo.sort") + '</span>' +
          '<select class="todo-controls__select" id="todo-sort-by" name="sortBy">' +
            '<option value="createdAt"' + getSelectedText(viewState.sortBy, "createdAt") + ">" + t("todo.sort.createdAt") + "</option>" +
            '<option value="dueDate"' + getSelectedText(viewState.sortBy, "dueDate") + ">" + t("todo.sort.dueDate") + "</option>" +
          "</select>" +
        "</label>" +
        '<label class="todo-controls__field" for="todo-search">' +
          '<span class="todo-controls__label">' + t("todo.search") + '</span>' +
          '<input class="todo-controls__select" id="todo-search" name="search" type="search" value="' + escapeHtml(viewState.search) + '" placeholder="' + t("todo.search.placeholder") + '">' +
        "</label>" +
        '<label class="todo-controls__field" for="todo-quadrant-view">' +
          '<span class="todo-controls__label">' + t("todo.quadrant") + '</span>' +
          '<select class="todo-controls__select" id="todo-quadrant-view" name="quadrantView">' +
            '<option value="all"' + getSelectedText(viewState.quadrantView, "all") + ">" + t("todo.quadrant.all") + "</option>" +
            '<option value="urgent-important"' + getSelectedText(viewState.quadrantView, "urgent-important") + ">" + t("quadrant.urgent-important") + "</option>" +
            '<option value="important-not-urgent"' + getSelectedText(viewState.quadrantView, "important-not-urgent") + ">" + t("quadrant.important-not-urgent") + "</option>" +
            '<option value="urgent-not-important"' + getSelectedText(viewState.quadrantView, "urgent-not-important") + ">" + t("quadrant.urgent-not-important") + "</option>" +
            '<option value="not-urgent-not-important"' + getSelectedText(viewState.quadrantView, "not-urgent-not-important") + ">" + t("quadrant.not-urgent-not-important") + "</option>" +
          "</select>" +
        "</label>" +
      "</div>"
    );
  }

  /*
    createTodoBulkActionsHtml：创建批量操作按钮栏。
  */
  function createTodoBulkActionsHtml() {
    const visibleTodos = getVisibleTodos();
    const visibleIds = viewState.quadrantView === "all"
      ? visibleTodos.map(function (todo) { return todo.id; })
      : getQuadrantTodos(visibleTodos, viewState.quadrantView).map(function (todo) { return todo.id; });

    if (visibleIds.length === 0) {
      return "";
    }

    const allSelected = visibleIds.every(function (id) {
      return viewState.selectedTodos.includes(id);
    });

    var selectAllHtml = '<button class="todo-bulk-actions__button" type="button" data-action="toggle-select-all">' + (allSelected ? t("todo.deselectAll") : t("todo.selectAll")) + "</button>";
    var bulkHtml = "";

    if (viewState.selectedTodos.length > 0) {
      bulkHtml =
        '<button class="todo-bulk-actions__button todo-bulk-actions__button--complete" type="button" data-action="bulk-complete">' + t("todo.bulkComplete") + ' (' + viewState.selectedTodos.length + ')</button>' +
        '<button class="todo-bulk-actions__button todo-bulk-actions__button--delete" type="button" data-action="bulk-delete">' + t("todo.bulkDelete") + ' (' + viewState.selectedTodos.length + ')</button>';
    }

    return '<div class="todo-bulk-actions">' + selectAllHtml + bulkHtml + "</div>";
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
        '<h3 class="todo-quadrant-panel__title">' + escapeHtml(t("quadrant." + quadrant)) + "</h3>" +
        createTodoListHtml(todos) +
      "</section>"
    );
  }

  /*
    createTodoListHtml：根据传入的 todos 创建列表 HTML。
  */
  function createTodoListHtml(todos) {
    if (todos.length === 0) {
      return createEmptyStateHtml("todo", t("todo.emptyTitle"), t("todo.emptySubtitle"));
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
    const dueDateHtml = hasDueDate(todo.dueDate) ? '<span class="todo-item__meta">' + t("todo.dueDate") + "：" + escapeHtml(todo.dueDate) + "</span>" : "";
    const noteHtml = todo.note === "" ? "" : '<span class="todo-item__note">' + t("todo.note") + "：" + escapeHtml(todo.note) + "</span>";
    const isSelected = viewState.selectedTodos.includes(todo.id) ? " checked" : "";

    return (
      '<li class="todo-item">' +
        '<input class="todo-item__select" type="checkbox" data-action="select" data-id="' + todo.id + '"' + isSelected + '>' +
        '<label class="todo-item__main">' +
          '<input class="todo-item__checkbox" type="checkbox" data-action="toggle" data-id="' + todo.id + '">' +
          '<span class="todo-item__content">' +
            '<span class="todo-item__quadrant">[' + escapeHtml(t("quadrant." + todo.quadrant)) + "]</span>" +
            '<span class="todo-item__title">' + escapeHtml(todo.title) + "</span>" +
            dueDateHtml +
            noteHtml +
          "</span>" +
        "</label>" +
        '<button class="todo-item__delete" type="button" data-action="delete" data-id="' + todo.id + '">' + t("todo.delete") + '</button>' +
      "</li>"
    );
  }

  /*
    getQuadrantLabel：把 Todo 象限值转换成展示文本。
  */
  function getQuadrantLabel(quadrant) {
    return t("quadrant." + quadrant) || t("quadrant.none");
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
    const todoBulkActions = document.querySelector(".todo-bulk-actions");

    todoForm.addEventListener("submit", handleTodoSubmit);
    todoSortBy.addEventListener("change", handleTodoSortChange);
    todoSearch.addEventListener("change", handleTodoSearchChange);
    todoQuadrantView.addEventListener("change", handleTodoQuadrantViewChange);

    todoLists.forEach(function (todoList) {
      todoList.addEventListener("change", handleTodoListChange);
      todoList.addEventListener("click", handleTodoListClick);
    });

    if (todoBulkActions !== null) {
      todoBulkActions.addEventListener("click", handleTodoBulkActionsClick);
    }
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
    showToast(t("toast.addedToToday"), "success");
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
    handleTodoListChange：处理 Todo 列表里的完成状态切换和选择状态切换。
  */
  function handleTodoListChange(event) {
    var action = event.target.dataset.action;
    var id = event.target.dataset.id;

    if (action === "toggle" && id !== undefined) {
      var item = event.target.closest(".todo-item");
      if (item !== null) {
        item.classList.add("is-completing");
      }
      setTimeout(function () {
        toggleTodo(id);
        showToast(t("toast.completed"), "success");
        renderTodoPage();
      }, 200);
      return;
    }

    if (action === "select" && id !== undefined) {
      if (event.target.checked) {
        viewState.selectedTodos.push(id);
      } else {
        viewState.selectedTodos = viewState.selectedTodos.filter(function (selectedId) {
          return selectedId !== id;
        });
      }
      renderTodoPage();
      return;
    }
  }

  /*
    handleTodoListClick：处理 Todo 列表里的删除按钮点击。
  */
  function handleTodoListClick(event) {
    if (event.target.dataset.action !== "delete") {
      return;
    }

    var id = event.target.dataset.id;
    var item = event.target.closest(".todo-item");
    if (item !== null) {
      item.classList.add("is-deleting");
      setTimeout(function () {
        deleteTodo(id);
        showToast(t("toast.deleted"), "delete");
        renderTodoPage();
      }, 250);
    } else {
      deleteTodo(id);
      showToast(t("toast.deleted"), "delete");
      renderTodoPage();
    }
  }

  /*
    handleTodoBulkActionsClick：处理批量完成和批量删除按钮点击。
  */
  function handleTodoBulkActionsClick(event) {
    var action = event.target.dataset.action;

    if (action === "toggle-select-all") {
      var visibleTodos = getVisibleTodos();
      var visibleIds = viewState.quadrantView === "all"
        ? visibleTodos.map(function (todo) { return todo.id; })
        : getQuadrantTodos(visibleTodos, viewState.quadrantView).map(function (todo) { return todo.id; });

      var allSelected = visibleIds.every(function (id) {
        return viewState.selectedTodos.includes(id);
      });

      if (allSelected) {
        viewState.selectedTodos = [];
      } else {
        visibleIds.forEach(function (id) {
          if (!viewState.selectedTodos.includes(id)) {
            viewState.selectedTodos.push(id);
          }
        });
      }
      renderTodoPage();
      return;
    }

    if (action === "bulk-complete") {
      var completedCount = viewState.selectedTodos.length;
      viewState.selectedTodos.forEach(function (todoId) {
        toggleTodo(todoId);
      });
      viewState.selectedTodos = [];
      showToast(t("toast.completed"), "success");
      renderTodoPage();
      return;
    }

    if (action === "bulk-delete") {
      var deletedCount = viewState.selectedTodos.length;
      viewState.selectedTodos.forEach(function (todoId) {
        deleteTodo(todoId);
      });
      viewState.selectedTodos = [];
      showToast(t("toast.deletedN").replace("{n}", String(deletedCount)), "delete");
      renderTodoPage();
      return;
    }
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
  var historyViewState = {
    selectedTodos: []
  };

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
          "<h2>" + t("page.history") + "</h2>" +
          "<p>" + t("page.history.desc") + "</p>" +
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
          createEmptyStateHtml("history", t("history.emptyTitle"), t("history.emptySubtitle")) +
        "</div>"
      );
    }

    var visibleIds = completedTodos.map(function (todo) { return todo.id; });
    var allSelected = visibleIds.every(function (id) {
      return historyViewState.selectedTodos.includes(id);
    });

    var bulkActionsHtml =
      '<div class="history-bulk-actions">' +
        '<button class="history-bulk-actions__button" type="button" data-action="toggle-select-all">' + (allSelected ? t("todo.deselectAll") : t("todo.selectAll")) + '</button>';

    if (historyViewState.selectedTodos.length > 0) {
      bulkActionsHtml +=
        '<button class="history-bulk-actions__button history-bulk-actions__button--delete" type="button" data-action="bulk-delete">' + t("todo.bulkDelete") + ' (' + historyViewState.selectedTodos.length + ')</button>';
    }

    bulkActionsHtml += "</div>";

    return (
      '<div class="history-page">' +
        bulkActionsHtml +
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
    var quadrantLabel = t("quadrant." + todo.quadrant);
    var dueDateHtml = hasPageDueDate(todo.dueDate)
      ? '<span class="history-item__meta">' + t("todo.dueDate") + "：" + escapePageHtml(todo.dueDate) + "</span>"
      : "";
    var completedAtHtml = '<span class="history-item__meta">' + t("todo.sort.createdAt") + "：" + escapePageHtml(formatPageDateTime(todo.createdAt)) + "</span>";
    var noteHtml = todo.note === ""
      ? ""
      : '<p class="history-item__note">' + t("todo.note") + "：" + escapePageHtml(todo.note) + "</p>";
    var isSelected = historyViewState.selectedTodos.includes(todo.id) ? " checked" : "";

    return (
      '<li class="history-item">' +
        '<input class="history-item__select" type="checkbox" data-action="select" data-id="' + todo.id + '"' + isSelected + '>' +
        '<div class="history-item__body">' +
          '<div class="history-item__content">' +
            '<div class="history-item__topline">' +
              '<span class="history-item__status">' + t("todo.completed") + "</span>" +
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
            '<button class="history-item__restore" type="button" data-action="restore" data-id="' + todo.id + '">' + t("todo.restore") + "</button>" +
            '<button class="history-item__delete" type="button" data-action="delete" data-id="' + todo.id + '">' + t("todo.permanentDelete") + "</button>" +
          "</div>" +
        "</div>" +
      "</li>"
    );
  }

  function setupHistoryPageEvents() {
    var historyList = document.querySelector(".history-list");
    var historyBulkActions = document.querySelector(".history-bulk-actions");

    if (historyList !== null) {
      historyList.addEventListener("click", handleHistoryClick);
      historyList.addEventListener("change", handleHistoryChange);
    }

    if (historyBulkActions !== null) {
      historyBulkActions.addEventListener("click", handleHistoryBulkClick);
    }
  }

  function handleHistoryClick(event) {
    var action = event.target.dataset.action;
    var id = event.target.dataset.id;

    if (action === "restore" && id !== undefined) {
      restoreTodo(id);
      showToast(t("toast.restored"), "info");
      renderHistoryPage();
      return;
    }

    if (action === "delete" && id !== undefined) {
      var histItem = event.target.closest(".history-item");
      if (histItem !== null) {
        histItem.classList.add("is-deleting");
        setTimeout(function () {
          deleteTodo(id);
          showToast(t("toast.deleted"), "delete");
          renderHistoryPage();
        }, 250);
      } else {
        deleteTodo(id);
        showToast(t("toast.deleted"), "delete");
        renderHistoryPage();
      }
      return;
    }
  }

  function handleHistoryChange(event) {
    var action = event.target.dataset.action;
    var id = event.target.dataset.id;

    if (action === "select" && id !== undefined) {
      if (event.target.checked) {
        historyViewState.selectedTodos.push(id);
      } else {
        historyViewState.selectedTodos = historyViewState.selectedTodos.filter(function (selectedId) {
          return selectedId !== id;
        });
      }
      renderHistoryPage();
      return;
    }
  }

  function handleHistoryBulkClick(event) {
    var action = event.target.dataset.action;

    if (action === "toggle-select-all") {
      var completedTodos = getCompletedTodos().sort(function (firstTodo, secondTodo) {
        return getPageTimeValue(secondTodo.createdAt) - getPageTimeValue(firstTodo.createdAt);
      });
      var visibleIds = completedTodos.map(function (todo) { return todo.id; });

      var allSelected = visibleIds.every(function (todoId) {
        return historyViewState.selectedTodos.includes(todoId);
      });

      if (allSelected) {
        historyViewState.selectedTodos = [];
      } else {
        visibleIds.forEach(function (todoId) {
          if (!historyViewState.selectedTodos.includes(todoId)) {
            historyViewState.selectedTodos.push(todoId);
          }
        });
      }
      renderHistoryPage();
      return;
    }

    if (action === "bulk-delete") {
      var histDeletedCount = historyViewState.selectedTodos.length;
      historyViewState.selectedTodos.forEach(function (todoId) {
        deleteTodo(todoId);
      });
      historyViewState.selectedTodos = [];
      showToast(t("toast.deletedN").replace("{n}", String(histDeletedCount)), "delete");
      renderHistoryPage();
      return;
    }
  }

  return {
    render: renderHistoryPage
  };
}());

const settingsPage = (function () {
  /*
    renderSettingsPage：渲染 Settings 页面。
  */
  function renderSettingsPage() {
    pageContent.innerHTML = createSettingsPageHtml();
    setupSettingsPageEvents();
    pageContent.focus();
  }

  /*
    createSettingsPageHtml：创建 Settings 页面完整 HTML。
  */
  function createSettingsPageHtml() {
    var s = getSettings();

    return (
      '<section class="page-panel">' +
        '<header class="page-header">' +
          "<h2>" + t("page.settings") + "</h2>" +
          "<p>" + t("page.settings.desc") + "</p>" +
        "</header>" +
        createAppearanceSectionHtml(s) +
        createLanguageSectionHtml(s) +
        createBehaviorSectionHtml(s) +
        createDataSectionHtml(s) +
      "</section>"
    );
  }

  function createAppearanceSectionHtml(s) {
    var themeOptions = [
      { value: "light", label: t("settings.theme.light") },
      { value: "dark", label: t("settings.theme.dark") },
      { value: "system", label: t("settings.theme.system") }
    ];
    var themeStyleOptions = [
      { value: "apple", label: t("settings.themeStyle.apple") },
      { value: "todoist", label: t("settings.themeStyle.todoist") },
      { value: "minimal", label: t("settings.themeStyle.minimal") }
    ];
    var fontSizeOptions = [
      { value: "small", label: t("settings.fontSize.small") },
      { value: "medium", label: t("settings.fontSize.medium") },
      { value: "large", label: t("settings.fontSize.large") }
    ];

    return (
      '<div class="settings-section">' +
        '<h3 class="settings-section__title">' + t("settings.appearance") + "</h3>" +
        '<div class="settings-card">' +
          createSettingsRowSelectHtml(t("settings.theme"), "appearance.theme", themeOptions, s.appearance.theme) +
          createSettingsRowSelectHtml(t("settings.themeStyle"), "appearance.themeStyle", themeStyleOptions, s.appearance.themeStyle) +
          createSettingsRowSelectHtml(t("settings.fontSize"), "appearance.fontSize", fontSizeOptions, s.appearance.fontSize) +
          createSettingsRowSwitchHtml(t("settings.compactMode"), "appearance.compactMode", s.appearance.compactMode) +
        "</div>" +
      "</div>"
    );
  }

  function createLanguageSectionHtml(s) {
    var localeOptions = [
      { value: "zh-CN", label: t("settings.locale.zh") },
      { value: "en", label: t("settings.locale.en") }
    ];

    return (
      '<div class="settings-section">' +
        '<h3 class="settings-section__title">' + t("settings.language") + "</h3>" +
        '<div class="settings-card">' +
          createSettingsRowSelectHtml(t("settings.locale"), "language.locale", localeOptions, s.language.locale) +
        "</div>" +
      "</div>"
    );
  }

  function createBehaviorSectionHtml(s) {
    var pageOptions = [
      { value: "todo", label: t("settings.defaultPage.todo") },
      { value: "calendar", label: t("settings.defaultPage.calendar") },
      { value: "history", label: t("settings.defaultPage.history") }
    ];

    return (
      '<div class="settings-section">' +
        '<h3 class="settings-section__title">' + t("settings.behavior") + "</h3>" +
        '<div class="settings-card">' +
          createSettingsRowSelectHtml(t("settings.defaultPage"), "behavior.defaultPage", pageOptions, s.behavior.defaultPage) +
          createSettingsRowSwitchHtml(t("settings.showCompletedLabel"), "behavior.showCompletedLabel", s.behavior.showCompletedLabel) +
        "</div>" +
      "</div>"
    );
  }

  function createDataSectionHtml(s) {
    return (
      '<div class="settings-section">' +
        '<h3 class="settings-section__title">' + t("settings.data") + "</h3>" +
        '<div class="settings-card">' +
          '<div class="settings-row">' +
            '<span class="settings-row__label">' + t("settings.export") + "</span>" +
            '<button class="settings-button" type="button" data-action="export">' + t("settings.export") + "</button>" +
          "</div>" +
          '<div class="settings-row">' +
            '<span class="settings-row__label">' + t("settings.import") + "</span>" +
            '<input class="settings-file" type="file" accept="application/json" data-action="import">' +
          "</div>" +
          '<div class="settings-row">' +
            '<span class="settings-row__label">' + t("settings.clear") + "</span>" +
            '<button class="settings-button settings-button--danger" type="button" data-action="clear">' + t("settings.clear") + "</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function createSettingsRowSelectHtml(label, path, options, currentValue) {
    var optionsHtml = options.map(function (opt) {
      var selected = opt.value === currentValue ? " selected" : "";
      return '<option value="' + opt.value + '"' + selected + ">" + opt.label + "</option>";
    }).join("");

    return (
      '<div class="settings-row">' +
        '<span class="settings-row__label">' + label + "</span>" +
        '<select class="settings-select" data-path="' + path + '">' +
          optionsHtml +
        "</select>" +
      "</div>"
    );
  }

  function createSettingsRowSwitchHtml(label, path, checked) {
    var checkedAttr = checked ? " checked" : "";
    return (
      '<div class="settings-row">' +
        '<span class="settings-row__label">' + label + "</span>" +
        '<label class="settings-switch">' +
          '<input type="checkbox" data-path="' + path + '"' + checkedAttr + ">" +
          '<span class="settings-switch__slider"></span>' +
        "</label>" +
      "</div>"
    );
  }

  /*
    setupSettingsPageEvents：绑定设置页面事件。
  */
  function setupSettingsPageEvents() {
    var selects = pageContent.querySelectorAll(".settings-select[data-path]");
    var switches = pageContent.querySelectorAll(".settings-switch input[data-path]");
    var buttons = pageContent.querySelectorAll(".settings-button[data-action]");
    var fileInput = pageContent.querySelector(".settings-file[data-action='import']");

    selects.forEach(function (select) {
      select.addEventListener("change", handleSettingChange);
    });

    switches.forEach(function (sw) {
      sw.addEventListener("change", handleSettingChange);
    });

    buttons.forEach(function (btn) {
      btn.addEventListener("click", handleSettingsButtonClick);
    });

    if (fileInput !== null) {
      fileInput.addEventListener("change", handleImportFile);
    }
  }

  function handleSettingChange(event) {
    var target = event.currentTarget;
    var path = target.dataset.path;
    var value = target.type === "checkbox" ? target.checked : target.value;
    updateSetting(path, value);

    if (path.indexOf("appearance") === 0) {
      applySettingsToDOM();
    }

    if (path.indexOf("language.locale") === 0) {
      applySettingsToDOM();
      updateStaticLabels();
      if (currentPageName !== "settings") {
        renderPage(currentPageName);
      } else {
        renderSettingsPage();
      }
    }
  }

  function handleSettingsButtonClick(event) {
    var action = event.currentTarget.dataset.action;

    if (action === "export") {
      exportData();
      showToast(t("toast.exported"), "info");
      return;
    }

    if (action === "clear") {
      clearAllData();
      return;
    }
  }

  function handleImportFile(event) {
    var file = event.currentTarget.files[0];
    if (file === undefined) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var success = importData(e.target.result);
      if (success) {
        showToast(t("toast.importSuccess"), "success");
      } else {
        showToast(t("toast.importFailed"), "warning");
      }
      event.currentTarget.value = "";
    };
    reader.readAsText(file);
  }

  return {
    render: renderSettingsPage
  };
}());
