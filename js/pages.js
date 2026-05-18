/*
  pages.js
  用途：保存每个页面的基础信息和 HTML 内容。
  第一阶段不写业务逻辑，只提供 App Shell 切换时要展示的内容。
*/

const pages = {
  todo: {
    title: "Todo",
    description: "这里将放待办事项管理功能。",
    items: [
      "后续支持新增 Todo",
      "后续支持删除 Todo",
      "后续支持设置紧急和重要程度"
    ]
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
