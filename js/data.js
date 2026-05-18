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
      return parsedTodos;
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
  createTodo：根据标题创建符合约定结构的 Todo 对象。
*/
function createTodo(title) {
  return {
    id: createTodoId(),
    title: title,
    isCompleted: false,
    createdAt: new Date().toISOString()
  };
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
function addTodo(title) {
  todos.push(createTodo(title));
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
