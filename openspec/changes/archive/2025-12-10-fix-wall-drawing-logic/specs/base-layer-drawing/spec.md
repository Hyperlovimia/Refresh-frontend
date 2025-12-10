# base-layer-drawing Specification Delta

## 变更类型
`MODIFIED`

## MODIFIED Requirements

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
