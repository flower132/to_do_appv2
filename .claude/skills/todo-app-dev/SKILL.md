# Lily Todo App V2 - Development Guidelines

> Auto-loaded when working on this project. Defines architecture rules, code conventions, and file structure.

## Project Architecture

This is a **vanilla HTML/CSS/JS** single-page application using an **App Shell** architecture.

### App Shell Structure

```
index.html
├── sidebar (左侧导航)
│   ├── sidebar__brand (Lily Todo / V2 App Shell)
│   └── sidebar__nav (导航按钮)
│       ├── [Todo]  data-page="todo"
│       ├── [Calendar]  data-page="calendar"
│       ├── [History]  data-page="history"
│       └── [Settings]  data-page="settings"
└── main-content#page-content (页面渲染目标)
```

### Page Switching

- Navigation uses `data-page` attribute on buttons
- **No real URL routing** — single-page, content swapped via JavaScript
- Active button gets `.is-active` class
- Router logic in `js/router.js`

## File Conventions

### CSS Layer Order (load order matters!)

| File | Purpose | Load Order |
|------|---------|------------|
| `css/base.css` | Global resets, fonts, CSS variables, box-sizing | 1st |
| `css/layout.css` | App Shell layout (sidebar + main) | 2nd |
| `css/components.css` | Reusable widget styles (buttons, titles) | 3rd |
| `css/pages.css` | Page-specific styles | 4th |

**Rules:**
- Use CSS variables from `base.css`, don't hardcode colors
- New components → `components.css` unless it's a full-page section → `pages.css`
- Use BEM-style naming: `.block__element--modifier`

### JS Load Order (dependency chain!)

| File | Purpose | Depends On |
|------|---------|------------|
| `js/data.js` | Todo data model + localStorage persistence | Nothing |
| `js/pages.js` | Page content generators | `data.js` |
| `js/router.js` | Page switching logic | `pages.js` |
| `js/app.js` | App entry point, initializes everything | All above |

**Rules:**
- **Never reorder scripts in index.html** — the load order is the dependency chain
- `data.js` is the single source of truth for all data
- All data persistence goes through `data.js` (localStorage)
- New pages → add content function in `js/pages.js`

### Data Management

```javascript
// data.js 是唯一的数据管理入口
// 所有读写 localStorage 的操作必须通过 data.js
// 其他 js 文件不能直接操作 localStorage

data.js API pattern:
  - getTodos()           // 获取所有 todo
  - addTodo(item)        // 添加 todo
  - updateTodo(id, data) // 更新 todo
  - deleteTodo(id)       // 删除 todo
  - saveToStorage()      // 持久化到 localStorage (内部调用)
```

## When Creating/Editing Pages

1. **New page button**: Add `<button data-page="xxx">` in sidebar nav
2. **Page content**: Add render function in `js/pages.js`
3. **Page styles**: Add section in `css/pages.css`
4. **No new HTML files** — everything renders into `#page-content`

## When Editing Styles

- Check if the style belongs in `components.css` (reusable) or `pages.css` (page-specific)
- Use existing CSS variables first
- Mobile-first approach: base styles for mobile, `@media` for larger screens

## When Adding Features

1. Does it need data persistence? → Add to `data.js`
2. Is it a new page? → Add to `pages.js` + nav button + `pages.css`
3. Is it a reusable widget? → Consider `components.css`
4. Does it change navigation behavior? → Modify `router.js`

## Project Constraints

- **No external libraries** — vanilla JS only (no React, Vue, jQuery)
- **No build system** — no webpack, vite, etc.
- **No TypeScript** — plain JavaScript (ES6+)
- **No backend** — localStorage only for now
- **Target**: modern browsers (Chrome, Safari, Firefox, Edge latest 2 versions)

## Testing

- Use `node --check <file>` for JS syntax validation
- Manual testing: open `index.html` in browser
- `verify-calendar.mjs` exists for calendar-specific testing
