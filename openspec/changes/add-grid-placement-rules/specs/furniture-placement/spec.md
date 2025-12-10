# furniture-placement 规范变更

## MODIFIED Requirements

### Requirement: 风扇放置

系统 SHALL 允许用户在画布上放置风扇，并自动检测是否可挂墙，同时遵循网格放置规则。

#### Scenario: 放置普通风扇

- **WHEN** 用户选中风扇工具
- **AND** 用户点击画布某个格子
- **AND** 该格子不靠近任何墙壁
- **AND** 该格子通过网格放置规则验证（无冲突、在房间内部）
- **THEN** 系统在该位置放置一个落地风扇
- **AND** 风扇数据 `{ x, y, direction: "up", wallAttached: false }` 添加到 furnitureLayer.fans 数组

#### Scenario: 放置挂墙风扇

- **WHEN** 用户选中风扇工具
- **AND** 用户点击画布某个格子
- **AND** 该格子的上/下/左/右相邻位置有墙壁
- **AND** 该格子通过网格放置规则验证（无冲突、在房间内部）
- **THEN** 系统在该位置放置一个挂墙风扇
- **AND** 风扇朝向自动设置为远离墙壁的方向（如墙在上方，则朝向 down）
- **AND** 风扇数据 `{ x, y, direction, wallAttached: true }` 添加到 furnitureLayer.fans 数组

#### Scenario: 放置失败反馈

- **WHEN** 用户尝试放置风扇
- **AND** 目标位置未通过网格放置规则验证
- **THEN** 系统拒绝放置操作
- **AND** 显示具体的错误原因（位置已占用、不在房间内部等）

### Requirement: 椅子放置

系统 SHALL 允许用户在画布上放置椅子，同时遵循网格放置规则。

#### Scenario: 放置椅子

- **WHEN** 用户选中椅子工具
- **AND** 用户点击画布某个格子
- **AND** 该格子通过网格放置规则验证（无冲突、在房间内部）
- **THEN** 系统在该位置放置一把椅子
- **AND** 椅子数据 `{ x, y, direction: "up" }` 添加到 furnitureLayer.chairs 数组
- **AND** 默认朝向为 up

#### Scenario: 放置失败反馈

- **WHEN** 用户尝试放置椅子
- **AND** 目标位置未通过网格放置规则验证
- **THEN** 系统拒绝放置操作
- **AND** 显示具体的错误原因

### Requirement: 桌子放置

系统 SHALL 允许用户在画布上放置桌子，同时遵循多格元素放置规则。

#### Scenario: 放置桌子

- **WHEN** 用户选中桌子工具
- **AND** 用户点击画布某个格子
- **AND** 桌子占用的所有格子（2x1）通过网格放置规则验证
- **THEN** 系统在该位置放置一张桌子
- **AND** 桌子数据 `{ x, y, direction: "up", width: 2, height: 1 }` 添加到 furnitureLayer.tables 数组
- **AND** 桌子占用 2x1 格（默认尺寸）

#### Scenario: 多格边界检查

- **WHEN** 用户尝试放置桌子
- **AND** 桌子的任一占用格子超出画布边界
- **THEN** 系统拒绝放置操作
- **AND** 提示用户元素超出边界

#### Scenario: 多格冲突处理

- **WHEN** 用户尝试放置桌子
- **AND** 桌子占用的任一格子与现有元素冲突
- **THEN** 系统根据覆盖规则处理冲突
- **AND** 如果是同类型家具，完整移除原有元素后放置新桌子
- **AND** 如果是结构元素，拒绝放置操作

### Requirement: 床放置

系统 SHALL 允许用户在画布上放置床，同时遵循多格元素放置规则。

#### Scenario: 放置床

- **WHEN** 用户选中床工具
- **AND** 用户点击画布某个格子
- **AND** 床占用的所有格子（2x3）通过网格放置规则验证
- **THEN** 系统在该位置放置一张床
- **AND** 床数据 `{ x, y, direction: "up", width: 2, height: 3 }` 添加到 furnitureLayer.beds 数组
- **AND** 床占用 2x3 格（默认尺寸）

#### Scenario: 多格边界检查

- **WHEN** 用户尝试放置床
- **AND** 床的任一占用格子超出画布边界
- **THEN** 系统拒绝放置操作
- **AND** 提示用户元素超出边界

#### Scenario: 多格冲突处理

- **WHEN** 用户尝试放置床
- **AND** 床占用的任一格子与现有元素冲突
- **THEN** 系统根据覆盖规则处理冲突
- **AND** 如果是同类型家具，完整移除原有元素后放置新床
- **AND** 如果是结构元素，拒绝放置操作
