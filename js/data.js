/*
  data.js
  用途：集中管理 Todo 数据和 localStorage 持久化。
  页面文件只调用这里的函数，不直接操作数据存储。
*/

const TODO_STORAGE_KEY = "lily-todo-app-v2-todos";

let todos = loadTodos();

/*
  loadTodos：启动 App 时从 localStorage 读取之前保存的 todos。
*/
function loadTodos() {
  const savedTodos = localStorage.getItem(TODO_STORAGE_KEY);

  if (savedTodos === null) {
    return [];
  }

  try {
    const parsedTodos = JSON.parse(savedTodos);

    if (Array.isArray(parsedTodos)) {
      return parsedTodos.map(function (todo) {
        return normalizeTodo(todo);
      });
    }
  } catch (error) {
    return [];
  }

  return [];
}

/*
  saveTodos：把当前 todos 数组保存到 localStorage，刷新页面后还能读取。
*/
function saveTodos() {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

/*
  getTodos：返回当前 Todo 列表，供页面渲染使用。
*/
function getTodos() {
  return todos;
}

/*
  getActiveTodos：返回所有未完成的 Todo（isCompleted === false），不修改原数组。
*/
function getActiveTodos() {
  return todos.filter(function (todo) {
    return todo.isCompleted === false;
  });
}

/*
  getCompletedTodos：返回所有已完成的 Todo（isCompleted === true），不修改原数组。
*/
function getCompletedTodos() {
  return todos.filter(function (todo) {
    return todo.isCompleted === true;
  });
}

/*
  createTodo：根据输入数据创建符合约定结构的 Todo 对象。
*/
function createTodo(todoData) {
  const data = normalizeTodoInput(todoData);

  return {
    id: createTodoId(),
    title: getValueOrDefault(data.title, ""),
    isCompleted: false,
    quadrant: normalizeQuadrant(data.quadrant),
    dueDate: normalizeDueDate(data.dueDate),
    note: getValueOrDefault(data.note, ""),
    createdAt: new Date().toISOString()
  };
}

/*
  normalizeTodo：把旧版 Todo 数据补齐成当前 schema。
*/
function normalizeTodo(todo) {
  const source = todo || {};

  return {
    id: source.id === undefined || source.id === null ? createTodoId() : source.id,
    title: getValueOrDefault(source.title, ""),
    isCompleted: getValueOrDefault(source.isCompleted, false),
    quadrant: normalizeQuadrant(source.quadrant),
    dueDate: normalizeDueDate(source.dueDate),
    note: getValueOrDefault(source.note, ""),
    createdAt: source.createdAt === undefined || source.createdAt === null ? new Date().toISOString() : source.createdAt
  };
}

/*
  normalizeTodoInput：兼容旧版字符串参数，并统一成对象输入。
*/
function normalizeTodoInput(todoData) {
  if (typeof todoData === "string") {
    return {
      title: todoData
    };
  }

  return todoData || {};
}

/*
  getValueOrDefault：字段缺失或为 null 时使用默认值。
*/
function getValueOrDefault(value, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  return value;
}

function normalizeQuadrant(quadrant) {
  const legacyQuadrants = {
    1: "urgent-important",
    2: "important-not-urgent",
    3: "urgent-not-important",
    4: "not-urgent-not-important"
  };
  const normalizedQuadrant = legacyQuadrants[quadrant] || quadrant;
  const validQuadrants = [
    "urgent-important",
    "important-not-urgent",
    "urgent-not-important",
    "not-urgent-not-important"
  ];

  if (quadrant === undefined || quadrant === null) {
    return "none";
  }

  return validQuadrants.includes(normalizedQuadrant) ? normalizedQuadrant : "none";
}

function normalizeDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null || dueDate === "") {
    return null;
  }

  return dueDate;
}

/*
  createTodoId：创建一个字符串 id，优先使用浏览器内置随机 id。
*/
function createTodoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID !== undefined) {
    return crypto.randomUUID();
  }

  return String(Date.now()) + "-" + String(Math.random());
}

/*
  addTodo：把新的 Todo 对象加入 todos 数组，并立即保存。
*/
function addTodo(todoData) {
  todos.push(createTodo(todoData));
  saveTodos();
}

/*
  toggleTodo：根据 id 切换 Todo 的完成状态，并立即保存。
*/
function toggleTodo(id) {
  const todo = todos.find(function (item) {
    return item.id === id;
  });

  if (todo === undefined) {
    return;
  }

  todo.isCompleted = !todo.isCompleted;
  saveTodos();
}

/*
  deleteTodo：根据 id 从 todos 数组删除 Todo，并立即保存。
*/
function deleteTodo(id) {
  todos = todos.filter(function (todo) {
    return todo.id !== id;
  });
  saveTodos();
}

function computeQuadrant(todo) {
  const source = todo || {};
  const dueDate = normalizeDueDate(source.dueDate);
  const note = getValueOrDefault(source.note, "");
  const hasDueDate = dueDate !== null;
  const hasNote = note !== "";
  const isImportant = source.isImportant === undefined ? hasNote : source.isImportant;
  const isUrgent = source.isUrgent === undefined ? hasDueDate : source.isUrgent;
  const today = new Date().toISOString().slice(0, 10);

  if (source.isCompleted === true) {
    return "DONE";
  }

  if (hasDueDate && dueDate <= today) {
    return "urgent-important";
  }

  if (isUrgent && isImportant) {
    return "urgent-important";
  }

  if (isImportant) {
    return "important-not-urgent";
  }

  if (isUrgent) {
    return "urgent-not-important";
  }

  return "not-urgent-not-important";
}
