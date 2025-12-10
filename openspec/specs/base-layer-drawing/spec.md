# base-layer-drawing Specification

## Purpose
TBD - created by archiving change add-ventilation-design-core. Update Purpose after archive.
## Requirements
### Requirement: 工具栏切换

系统 SHALL 提供工具栏，允许用户在不同绘制工具之间切换。

#### Scenario: 选择绘制工具

- **WHEN** 用户点击工具栏中的工具按钮（墙壁/房间/门/窗）
- **THEN** 系统将当前工具切换为选中的工具
- **AND** 高亮显示当前选中的工具按钮

### Requirement: 墙壁绘制

系统 SHALL 使用填充方式绘制墙壁，墙壁应填满对应的网格区域。

#### Scenario: 绘制实心墙壁

- **GIVEN** 墙壁数据包含位置和尺寸信息 `{x, y, width, height}`
- **WHEN** 系统渲染墙壁元素
- **THEN** 系统使用 `fillRect()` 填充整个网格区域
- **AND** 墙壁颜色为黑色 `#000000`
- **AND** 墙壁完全覆盖 `width * height` 个网格单元

#### Scenario: 兼容旧数据格式

- **GIVEN** 墙壁数据使用线段格式 `{startX, startY, endX, endY}`
- **WHEN** 系统渲染墙壁元素
- **THEN** 系统自动转换为矩形格式 `{x, y, width, height}`
- **AND** x = min(startX, endX)
- **AND** y = min(startY, endY)
- **AND** width = abs(endX - startX) + 1
- **AND** height = abs(endY - startY) + 1

#### Scenario: 选中状态高亮

- **WHEN** 墙壁处于选中状态
- **THEN** 系统使用红色 `#f44336` 填充墙壁
- **AND** 绘制 3 像素宽的深红色边框

#### Scenario: 确认墙壁

- **WHEN** 用户释放触摸
- **THEN** 系统将墙壁数据 `{x, y, width, height}` 添加到 baseLayer.walls 数组
- **AND** x, y 为左上角网格坐标
- **AND** width, height 为墙壁占据的网格数（最小为 1）
- **AND** 重新渲染画布显示新墙壁

### Requirement: 房间绘制

系统 SHALL 允许用户通过拖拽方式绘制矩形房间区域。

#### Scenario: 绘制房间

- **WHEN** 用户选中房间工具
- **AND** 用户在画布上按下并拖拽
- **THEN** 系统预览从起点到当前位置的矩形区域
- **AND** 矩形填充浅色表示房间内部

#### Scenario: 确认房间

- **WHEN** 用户释放触摸
- **THEN** 系统将房间数据 { x, y, width, height } 添加到 baseLayer.rooms 数组
- **AND** x, y 为矩形左上角的格子坐标

### Requirement: 门窗绘制

系统 SHALL 允许用户通过点击方式放置门或窗。

#### Scenario: 放置门

- **WHEN** 用户选中门工具
- **AND** 用户点击画布某个位置
- **THEN** 系统在该格子位置放置一个门元素
- **AND** 门数据 { x, y, direction } 添加到 baseLayer.doors 数组

#### Scenario: 放置窗

- **WHEN** 用户选中窗工具
- **AND** 用户点击画布某个位置
- **THEN** 系统在该格子位置放置一个窗元素
- **AND** 窗数据 { x, y, direction } 添加到 baseLayer.windows 数组

#### Scenario: 自动判断方向

- **WHEN** 用户放置门或窗
- **THEN** 系统根据相邻墙壁自动判断方向（horizontal 或 vertical）
- **AND** 如果无法判断，默认为 horizontal

### Requirement: 元素选择

系统 SHALL 允许用户通过点击选中已绘制的元素。

#### Scenario: 选中元素

- **WHEN** 用户未选中任何绘制工具（选择模式）
- **AND** 用户点击某个已绘制元素的位置
- **THEN** 系统将该元素标记为选中状态
- **AND** 以高亮边框显示选中元素

#### Scenario: 取消选中

- **WHEN** 用户点击空白区域
- **THEN** 系统取消当前选中状态

### Requirement: 元素删除

系统 SHALL 允许用户删除选中的元素。

#### Scenario: 删除选中元素

- **WHEN** 用户选中某个元素
- **AND** 用户点击工具栏的删除按钮
- **THEN** 系统从对应数组中移除该元素
- **AND** 重新渲染画布
- **AND** 清除选中状态

#### Scenario: 无选中元素时删除

- **WHEN** 用户未选中任何元素
- **AND** 用户点击删除按钮
- **THEN** 系统不执行任何操作（或显示提示）

