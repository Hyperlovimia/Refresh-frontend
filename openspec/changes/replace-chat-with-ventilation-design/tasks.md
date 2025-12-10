# 实施任务清单

## 1. 修改 Tab Bar 配置

- [ ] 1.1 修改 `app.json` 中的 `tabBar.list`
  - 将 `pages/message/index` 替换为 `pages/design/index`
  - 将文本从"消息"改为"设计"

## 2. 更新自定义 Tab Bar 组件

- [ ] 2.1 修改 `custom-tab-bar/index.wxml`
  - 将第二个 `t-tab-bar-item` 的 icon 从 `chat` 改为 `edit`（或 `tools`）
  - 将 value 从 `message` 改为 `design`
  - 移除 `badge-props` 属性（设计页面不需要未读数角标）
  - 将文本从"消息"改为"设计"

- [ ] 2.2 修改 `custom-tab-bar/index.js`
  - 更新 `list` 数组中第二项的配置（icon、value、label）
  - 移除未读消息数量相关逻辑（`unreadNum` 相关代码可保留但不再使用）

## 3. 更新侧边栏导航组件

- [ ] 3.1 修改 `components/nav/index.js`
  - 添加"设计页"入口 `{ title: '设计页', url: 'pages/design/index', isSidebar: true }`
  - 将"消息列表页"和"对话页"的 `isSidebar` 设为 `false`（或直接注释/移除）

## 4. 清理聊天相关代码（可选，低优先级）

- [ ] 4.1 评估 `app.js` 中 WebSocket 和未读消息逻辑的处理方式
  - 可选择：完全移除、注释保留、或改为按需加载

## 5. 测试验证

- [ ] 5.1 启动小程序开发者工具，验证 Tab Bar 显示正确
- [ ] 5.2 点击"设计"Tab，验证能正确进入设计页面
- [ ] 5.3 验证设计页面所有功能正常（绘制、放置家具、保存、加载、热力图）
- [ ] 5.4 验证侧边栏导航中"设计页"入口可用
- [ ] 5.5 确认无法通过正常 UI 路径进入聊天/消息页面
