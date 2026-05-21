# Dev Docs

跨 Claude Code 会话保存项目上下文的开发文档目录。

## 使用方式

当开始一个大型任务时，Claude Code 可以在这里创建三个文件：

```
dev/active/[task-name]/
  [task]-plan.md      # 战略计划 - 做什么、为什么、怎么做
  [task]-context.md   # 上下文记录 - 关键决策、已知问题、文件清单
  [task]-tasks.md     # 任务清单 - 待办项，勾选表示完成
```

## 目的

Claude Code 上下文重置后，重新读取这些文件就能快速恢复项目进度，不用重新解释。

## 示例

```
dev/active/calendar-feature/
  calendar-plan.md      # "实现日历视图，显示月份的 todo 分布"
  calendar-context.md   # "data.js 中已有日期字段，pages.js 需要新增 renderCalendar()"
  calendar-tasks.md     # "- [x] 基础日历布局 - [ ] 标记有 todo 的日期 - [ ] 点击日期跳转"
```
