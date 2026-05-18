// 获取页面上的元素
console.log("JS connected");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const historyList = document.querySelector("#history-list");
const todoCount = document.querySelector("#todo-count");
const completedCount = document.querySelector("#completed-count");

// 用现有列表数量作为新待办事项的编号起点
let nextTodoId = todoList.children.length + 1;

// 创建新的待办事项
function createTodoItem(todoText) {
  const todoItem = document.createElement("li");
  const checkbox = document.createElement("input");
  const label = document.createElement("label");
  const deleteButton = document.createElement("button");

  // 设置复选框
  checkbox.type = "checkbox";
  checkbox.id = "todo-" + nextTodoId;

  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      moveTodoToHistory(todoItem);
    }
  });

  // 设置待办文字
  label.setAttribute("for", checkbox.id);
  label.textContent = todoText;

  // 设置删除按钮（暂时只有样式，没有删除功能）
  deleteButton.type = "button";
  deleteButton.textContent = "删除";

  // 把复选框、文字和按钮放进列表项
  todoItem.appendChild(checkbox);
  todoItem.appendChild(label);
  todoItem.appendChild(deleteButton);

  // 下一个待办事项使用新的编号
  nextTodoId = nextTodoId + 1;

  return todoItem;
}

// 把完成的待办事项移动到历史记录
function moveTodoToHistory(todoItem) {
  const checkbox = todoItem.querySelector("input[type='checkbox']");
  const today = new Date().toLocaleDateString("zh-CN");
  let historyDay = document.querySelector('[data-date="' + today + '"]');

  if (historyDay === null) {
    historyDay = createHistoryDay(today);
    historyList.appendChild(historyDay);
  }

  const historyItems = historyDay.querySelector("ul");

  checkbox.disabled = true;
  todoItem.classList.add("completed");
  historyItems.appendChild(todoItem);

  updateCount();
}

// 创建某一天的历史记录分组
function createHistoryDay(dateText) {
  const historyDay = document.createElement("div");
  const historyButton = document.createElement("button");
  const historyItems = document.createElement("ul");

  historyDay.classList.add("history-day");
  historyDay.setAttribute("data-date", dateText);

  historyButton.type = "button";
  historyButton.textContent = dateText;

  historyButton.addEventListener("click", function () {
    historyItems.hidden = !historyItems.hidden;
  });

  historyDay.appendChild(historyButton);
  historyDay.appendChild(historyItems);

  return historyDay;
}

// 更新待办和已完成数量
function updateCount() {
  todoCount.textContent = todoList.children.length;
  completedCount.textContent = historyList.querySelectorAll("li").length;
}

// 监听表单提交事件
todoForm.addEventListener("submit", function (event) {
  // 阻止表单提交后刷新页面
  event.preventDefault();

  // 获取输入内容，并去掉前后的空格
  const todoText = todoInput.value.trim();

  // 如果用户没有输入内容，就不添加
  if (todoText === "") {
    return;
  }

  // 把新的列表项添加到页面
  const todoItem = createTodoItem(todoText);
  todoList.appendChild(todoItem);

  // 更新数量
  updateCount();

  // 清空输入框，方便继续输入
  todoInput.value = "";
  todoInput.focus();
});

// 给页面上原本写好的待办事项添加完成事件
const defaultCheckboxes = todoList.querySelectorAll("input[type='checkbox']");

for (const checkbox of defaultCheckboxes) {
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      moveTodoToHistory(checkbox.parentElement);
    }
  });
}

updateCount();
