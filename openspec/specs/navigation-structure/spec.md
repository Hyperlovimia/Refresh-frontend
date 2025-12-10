# navigation-structure Specification

## Purpose
TBD - created by archiving change replace-chat-with-ventilation-design. Update Purpose after archive.
## Requirements
### Requirement: Tab Bar 结构

系统 SHALL 提供包含三个主要入口的底部 Tab Bar 导航。

#### Scenario: Tab Bar 显示

- **WHEN** 用户进入小程序任意 Tab 页面
- **THEN** 系统显示底部 Tab Bar
- **AND** Tab Bar 包含三个入口：首页、设计、我的
- **AND** 当前页面对应的 Tab 项高亮显示

#### Scenario: Tab Bar 导航 - 首页

- **WHEN** 用户点击"首页"Tab
- **THEN** 系统导航到 `pages/home/index` 页面
- **AND** "首页"Tab 项高亮显示

#### Scenario: Tab Bar 导航 - 设计

- **WHEN** 用户点击"设计"Tab
- **THEN** 系统导航到 `pages/design/index` 页面
- **AND** "设计"Tab 项高亮显示
- **AND** 显示通风分析设计画布

#### Scenario: Tab Bar 导航 - 我的

- **WHEN** 用户点击"我的"Tab
- **THEN** 系统导航到 `pages/my/index` 页面
- **AND** "我的"Tab 项高亮显示

### Requirement: Tab Bar 图标

系统 SHALL 为每个 Tab 项显示对应的图标。

#### Scenario: 图标显示

- **WHEN** Tab Bar 渲染完成
- **THEN** "首页"显示 `home` 图标
- **AND** "设计"显示 `edit` 图标
- **AND** "我的"显示 `user` 图标

### Requirement: 侧边栏导航

系统 SHALL 提供侧边栏导航抽屉，包含所有可访问页面的入口。

#### Scenario: 打开侧边栏

- **WHEN** 用户点击导航栏左侧菜单按钮
- **THEN** 系统从左侧滑出侧边栏抽屉
- **AND** 显示页面入口列表

#### Scenario: 侧边栏包含设计页入口

- **WHEN** 侧边栏打开
- **THEN** 侧边栏列表包含"设计页"入口
- **AND** 点击"设计页"可导航到 `pages/design/index`

#### Scenario: 侧边栏 Tab 页面导航

- **WHEN** 用户点击侧边栏中标记为 `isSidebar: true` 的入口
- **THEN** 系统使用 `wx.switchTab` 进行导航
- **AND** 关闭侧边栏抽屉

#### Scenario: 侧边栏普通页面导航

- **WHEN** 用户点击侧边栏中标记为 `isSidebar: false` 的入口
- **THEN** 系统使用 `wx.navigateTo` 进行导航
- **AND** 关闭侧边栏抽屉

### Requirement: 路由配置

系统 SHALL 在 `app.json` 中正确配置页面路由。

#### Scenario: 主包页面配置

- **WHEN** 小程序加载
- **THEN** 主包 `pages` 数组包含：
  - `pages/home/index`
  - `pages/design/index`
  - `pages/my/index`

#### Scenario: Tab Bar 配置

- **WHEN** 小程序加载
- **THEN** `tabBar.list` 配置为：
  - `{ pagePath: "pages/home/index", text: "首页" }`
  - `{ pagePath: "pages/design/index", text: "设计" }`
  - `{ pagePath: "pages/my/index", text: "我的" }`
- **AND** `tabBar.custom` 设置为 `true`

