# canvas-grid-system Specification

## Purpose
TBD - created by archiving change add-ventilation-design-core. Update Purpose after archive.
## Requirements
### Requirement: 网格画布初始化

系统 SHALL 在设计页面加载时初始化一个 Canvas 2D 画布，画布包含 20×20 的网格系统。

#### Scenario: 画布正常初始化

- **WHEN** 用户进入设计页面
- **THEN** 系统创建 Canvas 2D 上下文
- **AND** 画布尺寸根据屏幕宽度自适应（保持正方形）
- **AND** 每个格子尺寸为 cellSize 像素（默认 30px）

### Requirement: 网格线渲染

系统 SHALL 支持在画布上渲染网格线，并允许用户切换显示状态。

#### Scenario: 显示网格线

- **WHEN** 网格显示开关为开启状态
- **THEN** 系统在画布上绘制 20×20 的灰色网格线

#### Scenario: 隐藏网格线

- **WHEN** 用户关闭网格显示开关
- **THEN** 系统隐藏网格线，仅显示已绘制的元素

### Requirement: 坐标系统转换

系统 SHALL 提供格子坐标与像素坐标的双向转换能力。

#### Scenario: 像素坐标转格子坐标

- **WHEN** 用户触摸画布某个位置
- **THEN** 系统将触摸点的像素坐标 (px, py) 转换为格子坐标 (gx, gy)
- **AND** 格子坐标为整数，范围 [0, gridSize-1]

#### Scenario: 格子坐标转像素坐标

- **WHEN** 系统需要绘制某个格子
- **THEN** 系统将格子坐标 (gx, gy) 转换为像素坐标 (px, py)
- **AND** 像素坐标为格子左上角的位置

### Requirement: 触摸坐标显示

系统 SHALL 在用户触摸画布时显示当前触摸位置的格子坐标。

#### Scenario: 显示触摸坐标

- **WHEN** 用户触摸画布
- **THEN** 系统在状态栏显示当前格子坐标 "(x, y)"
- **AND** 坐标随触摸移动实时更新

#### Scenario: 隐藏触摸坐标

- **WHEN** 用户手指离开画布
- **THEN** 系统隐藏坐标显示或显示默认文本

