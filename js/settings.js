/*
  settings.js
  用途：管理应用级 UI 设置（主题、字体、语言、默认页面等）。
  与 data.js 完全隔离，仅影响 UI 层，通过 data-* 属性和 CSS 生效。
*/

const SETTINGS_STORAGE_KEY = "app-settings-v1";

const defaultSettings = {
  appearance: {
    theme: "light",
    fontSize: "medium",
    compactMode: false
  },
  language: {
    locale: "zh-CN"
  },
  behavior: {
    defaultPage: "todo",
    showCompletedLabel: true
  },
  data: {
    exportEnabled: true
  }
};

const i18n = {
  "zh-CN": {
    "page.todo": "Todo",
    "page.todo.desc": "管理当前待办事项。",
    "page.calendar": "Calendar",
    "page.calendar.desc": "按截止日期查看 Todo。",
    "page.history": "History",
    "page.history.desc": "查看已经完成的 Todo。",
    "page.settings": "Settings",
    "page.settings.desc": "管理应用偏好设置。",
    "settings.appearance": "外观设置",
    "settings.theme": "主题",
    "settings.theme.light": "浅色",
    "settings.theme.dark": "深色",
    "settings.theme.system": "跟随系统",
    "settings.fontSize": "字体大小",
    "settings.fontSize.small": "小",
    "settings.fontSize.medium": "中",
    "settings.fontSize.large": "大",
    "settings.compactMode": "紧凑模式",
    "settings.language": "语言设置",
    "settings.locale": "语言",
    "settings.locale.zh": "中文",
    "settings.locale.en": "English",
    "settings.behavior": "行为设置",
    "settings.defaultPage": "默认进入页面",
    "settings.defaultPage.todo": "Todo",
    "settings.defaultPage.calendar": "Calendar",
    "settings.defaultPage.history": "History",
    "settings.showCompletedLabel": "显示已完成任务标识",
    "settings.data": "数据管理",
    "settings.export": "导出数据",
    "settings.import": "导入数据",
    "settings.clear": "清空所有数据",
    "settings.clear.confirm": "确定要清空所有数据吗？此操作不可恢复。",
    "todo.new": "新 Todo",
    "todo.placeholder": "输入待办事项",
    "todo.add": "新增",
    "todo.quadrant": "象限",
    "todo.startDate": "开始日期",
    "todo.dueDate": "截止日期",
    "todo.note": "备注",
    "todo.note.placeholder": "补充说明",
    "todo.sort": "排序",
    "todo.sort.createdAt": "创建时间",
    "todo.sort.dueDate": "截止日期",
    "todo.search": "搜索",
    "todo.search.placeholder": "搜索 Todo",
    "todo.quadrant.all": "全部",
    "todo.empty": "暂无 Todo。",
    "todo.selectAll": "全选",
    "todo.deselectAll": "取消全选",
    "todo.bulkComplete": "批量完成",
    "todo.bulkDelete": "批量删除",
    "todo.delete": "删除",
    "todo.completed": "已完成",
    "todo.restore": "恢复",
    "todo.permanentDelete": "永久删除",
    "todo.noHistory": "暂无完成记录。",
    "todo.unknownDate": "未知",
    "todo.noDueDate": "无截止日期",
    "calendar.prevMonth": "<",
    "calendar.nextMonth": ">",
    "calendar.selectDate": "选择日期查看 Todo",
    "calendar.noTodos": "该日期没有 Todo。",
    "calendar.more": "more",
    "quadrant.urgent-important": "重要且紧急",
    "quadrant.important-not-urgent": "重要不紧急",
    "quadrant.urgent-not-important": "紧急不重要",
    "quadrant.not-urgent-not-important": "不重要不紧急",
    "quadrant.none": "未分类"
  },
  "en": {
    "page.todo": "Todo",
    "page.todo.desc": "Manage current tasks.",
    "page.calendar": "Calendar",
    "page.calendar.desc": "View tasks by due date.",
    "page.history": "History",
    "page.history.desc": "View completed tasks.",
    "page.settings": "Settings",
    "page.settings.desc": "Manage app preferences.",
    "settings.appearance": "Appearance",
    "settings.theme": "Theme",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.system": "System",
    "settings.fontSize": "Font Size",
    "settings.fontSize.small": "Small",
    "settings.fontSize.medium": "Medium",
    "settings.fontSize.large": "Large",
    "settings.compactMode": "Compact Mode",
    "settings.language": "Language",
    "settings.locale": "Language",
    "settings.locale.zh": "中文",
    "settings.locale.en": "English",
    "settings.behavior": "Behavior",
    "settings.defaultPage": "Default Page",
    "settings.defaultPage.todo": "Todo",
    "settings.defaultPage.calendar": "Calendar",
    "settings.defaultPage.history": "History",
    "settings.showCompletedLabel": "Show Completed Label",
    "settings.data": "Data Management",
    "settings.export": "Export Data",
    "settings.import": "Import Data",
    "settings.clear": "Clear All Data",
    "settings.clear.confirm": "Are you sure you want to clear all data? This cannot be undone.",
    "todo.new": "New Todo",
    "todo.placeholder": "Enter a task",
    "todo.add": "Add",
    "todo.quadrant": "Quadrant",
    "todo.startDate": "Start Date",
    "todo.dueDate": "Due Date",
    "todo.note": "Note",
    "todo.note.placeholder": "Add details",
    "todo.sort": "Sort",
    "todo.sort.createdAt": "Created",
    "todo.sort.dueDate": "Due Date",
    "todo.search": "Search",
    "todo.search.placeholder": "Search tasks",
    "todo.quadrant.all": "All",
    "todo.empty": "No tasks yet.",
    "todo.selectAll": "Select All",
    "todo.deselectAll": "Deselect All",
    "todo.bulkComplete": "Bulk Complete",
    "todo.bulkDelete": "Bulk Delete",
    "todo.delete": "Delete",
    "todo.completed": "Completed",
    "todo.restore": "Restore",
    "todo.permanentDelete": "Delete Permanently",
    "todo.noHistory": "No completed tasks yet.",
    "todo.unknownDate": "Unknown",
    "todo.noDueDate": "No due date",
    "calendar.prevMonth": "<",
    "calendar.nextMonth": ">",
    "calendar.selectDate": "Select a date to view tasks",
    "calendar.noTodos": "No tasks for this date.",
    "calendar.more": "more",
    "quadrant.urgent-important": "Urgent & Important",
    "quadrant.important-not-urgent": "Important, Not Urgent",
    "quadrant.urgent-not-important": "Urgent, Not Important",
    "quadrant.not-urgent-not-important": "Neither",
    "quadrant.none": "Uncategorized"
  }
};

let settings = loadSettings();

/*
  loadSettings：从 localStorage 读取设置，缺失字段用默认值补齐。
*/
function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (saved === null) {
    return deepClone(defaultSettings);
  }

  try {
    const parsed = JSON.parse(saved);
    return mergeDeep(deepClone(defaultSettings), parsed);
  } catch (error) {
    return deepClone(defaultSettings);
  }
}

/*
  saveSettings：把当前设置保存到 localStorage。
*/
function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/*
  getSettings：返回当前 settings 引用。
*/
function getSettings() {
  return settings;
}

/*
  updateSetting：按路径更新单个设置项并立即保存。
  例：updateSetting("appearance.theme", "dark")
*/
function updateSetting(path, value) {
  const keys = path.split(".");
  let target = settings;
  for (var i = 0; i < keys.length - 1; i++) {
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = value;
  saveSettings();
}

/*
  getEffectiveTheme：根据设置返回实际主题（处理跟随系统）。
*/
function getEffectiveTheme() {
  const theme = settings.appearance.theme;
  if (theme === "system") {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return theme;
}

/*
  applySettingsToDOM：把当前设置应用到 document.documentElement 的 data-* 属性上。
*/
function applySettingsToDOM() {
  const html = document.documentElement;
  html.dataset.theme = getEffectiveTheme();
  html.dataset.fontSize = settings.appearance.fontSize;
  html.dataset.compact = String(settings.appearance.compactMode);
  html.dataset.locale = settings.language.locale;
}

/*
  t：根据当前语言返回翻译文本，缺失时返回 key 本身。
*/
function t(key) {
  const locale = settings.language.locale;
  const dict = i18n[locale] || i18n["zh-CN"];
  return dict[key] !== undefined ? dict[key] : key;
}

/*
  exportData：把当前 todos 导出为 JSON 文件下载。
*/
function exportData() {
  const data = {
    todos: getTodos(),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lily-todo-app-v2-export-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/*
  importData：读取 JSON 字符串，恢复 todos。
  成功后返回 true，失败返回 false。
*/
function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.todos)) {
      return false;
    }
    const normalized = data.todos.map(function (todo) {
      return normalizeTodo(todo);
    });
    todos = normalized;
    saveTodos();
    return true;
  } catch (error) {
    return false;
  }
}

/*
  clearAllData：清空所有 Todo 数据并刷新页面。
*/
function clearAllData() {
  if (!window.confirm(t("settings.clear.confirm"))) {
    return;
  }
  localStorage.removeItem(TODO_STORAGE_KEY);
  window.location.reload();
}

/*
  辅助函数：深拷贝简单对象/数组。
*/
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/*
  辅助函数：把 source 对象合并到 target（仅覆盖存在的键）。
*/
function mergeDeep(target, source) {
  const output = deepClone(target);
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
        output[key] = mergeDeep(output[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
  }
  return output;
}
