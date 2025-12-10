# Change: 将聊天消息入口替换为通风分析系统

## Why

当前系统基于微信小程序社交软件模板构建，包含聊天、消息等暂时不需要的功能。用户需要将主要入口切换到通风分析系统（pages/design），使其成为小程序的核心功能页面。

## What Changes

### **BREAKING** Tab Bar 结构变更
- 移除"消息"Tab 项
- 新增"设计"Tab 项，指向 `pages/design/index`

### 路由配置调整
- `app.json` 中 `tabBar.list` 从 `[首页, 消息, 我的]` 变更为 `[首页, 设计, 我的]`
- 保留 `pages/message/index` 和 `pages/chat/index` 在 pages/subpackages 中（代码不删除，仅隐藏入口）

### 自定义 Tab Bar 组件更新
- `custom-tab-bar/index.wxml`: 将 `chat` 图标改为 `edit` 或 `tools` 图标，value 改为 `design`
- `custom-tab-bar/index.js`: 移除未读消息数相关逻辑（设计页面不需要）

### 侧边栏导航更新
- `components/nav/index.js`: 新增"设计页"入口，移除或标记聊天相关入口为非活跃

## Impact

### 新增 specs
- `navigation-structure`: 定义小程序导航结构规范

### 修改文件
- `app.json`: tabBar 配置
- `custom-tab-bar/index.js`: Tab Bar 逻辑
- `custom-tab-bar/index.wxml`: Tab Bar UI
- `components/nav/index.js`: 侧边栏导航配置

### 隐藏功能（代码保留）
- `pages/message/*`: 消息列表页面
- `pages/chat/*`: 聊天页面
- `mock/chat.js`: 聊天相关 Mock 数据
- `app.js` 中的 WebSocket 和未读消息相关代码

## 验收标准

- [ ] Tab Bar 显示：首页、设计、我的
- [ ] 点击"设计"Tab 可正常进入 `pages/design/index`
- [ ] 通风分析系统所有功能正常工作（绘制、放置、保存、加载、热力图）
- [ ] 侧边栏导航包含"设计页"入口
- [ ] 无法通过正常 UI 操作进入聊天/消息页面
