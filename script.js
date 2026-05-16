// 获取页面上的元素
console.log("JS connected");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const totalCount = document.querySelector("#total-count");

// 用现有列表数量作为新待办事项的编号起点
let nextTodoId = todoList.children.length + 1;

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

  // 创建新的待办事项
  const todoItem = document.createElement("li");
  const checkbox = document.createElement("input");
  const label = document.createElement("label");
  const deleteButton = document.createElement("button");

  // 设置复选框
  checkbox.type = "checkbox";
  checkbox.id = "todo-" + nextTodoId;

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

  // 把新的列表项添加到页面
  todoList.appendChild(todoItem);

  // 更新总数
  totalCount.textContent = todoList.children.length;

  // 清空输入框，方便继续输入
  todoInput.value = "";
  todoInput.focus();

  // 下一个待办事项使用新的编号
  nextTodoId = nextTodoId + 1;
});
