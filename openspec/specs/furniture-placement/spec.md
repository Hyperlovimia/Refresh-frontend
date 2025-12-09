# furniture-placement Specification

## Purpose
TBD - created by archiving change add-furniture-layer. Update Purpose after archive.
## Requirements
### Requirement: 家具工具栏

系统 SHALL 在家具层模式下提供家具工具栏，允许用户选择要放置的家具类型。

#### Scenario: 显示家具工具

- **WHEN** 用户切换到家具层
- **THEN** 工具栏显示风扇、椅子、桌子、床四种家具工具
- **AND** 高亮显示当前选中的工具

### Requirement: 风扇放置

系统 SHALL 允许用户在画布上放置风扇，并自动检测是否可挂墙。

#### Scenario: 放置普通风扇

- **WHEN** 用户选中风扇工具
- **AND** 用户点击画布某个格子
- **AND** 该格子不靠近任何墙壁
- **THEN** 系统在该位置放置一个落地风扇
- **AND** 风扇数据 `{ x, y, direction: "up", wallAttached: false }` 添加到 furnitureLayer.fans 数组

#### Scenario: 放置挂墙风扇

- **WHEN** 用户选中风扇工具
- **AND** 用户点击画布某个格子
- **AND** 该格子的上/下/左/右相邻位置有墙壁
- **THEN** 系统在该位置放置一个挂墙风扇
- **AND** 风扇朝向自动设置为远离墙壁的方向（如墙在上方，则朝向 down）
- **AND** 风扇数据 `{ x, y, direction, wallAttached: true }` 添加到 furnitureLayer.fans 数组

### Requirement: 椅子放置

系统 SHALL 允许用户在画布上放置椅子。

#### Scenario: 放置椅子

- **WHEN** 用户选中椅子工具
- **AND** 用户点击画布某个格子
- **THEN** 系统在该位置放置一把椅子
- **AND** 椅子数据 `{ x, y, direction: "up" }` 添加到 furnitureLayer.chairs 数组
- **AND** 默认朝向为 up

### Requirement: 桌子放置

系统 SHALL 允许用户在画布上放置桌子。

#### Scenario: 放置桌子

- **WHEN** 用户选中桌子工具
- **AND** 用户点击画布某个格子
- **THEN** 系统在该位置放置一张桌子
- **AND** 桌子数据 `{ x, y, direction: "up", width: 2, height: 1 }` 添加到 furnitureLayer.tables 数组
- **AND** 桌子占用 2x1 格（默认尺寸）

### Requirement: 床放置

系统 SHALL 允许用户在画布上放置床。

#### Scenario: 放置床

- **WHEN** 用户选中床工具
- **AND** 用户点击画布某个格子
- **THEN** 系统在该位置放置一张床
- **AND** 床数据 `{ x, y, direction: "up", width: 2, height: 3 }` 添加到 furnitureLayer.beds 数组
- **AND** 床占用 2x3 格（默认尺寸）

### Requirement: 家具选择

系统 SHALL 允许用户选中已放置的家具元素。

#### Scenario: 选中家具

- **WHEN** 用户在家具层选择模式下
- **AND** 用户点击某个家具元素所在的格子
- **THEN** 系统将该家具标记为选中状态
- **AND** 以高亮边框显示选中的家具

#### Scenario: 取消选中

- **WHEN** 用户点击空白区域
- **THEN** 系统取消当前选中状态

### Requirement: 家具删除

系统 SHALL 允许用户删除选中的家具。

#### Scenario: 删除选中家具

- **WHEN** 用户选中某个家具
- **AND** 用户点击删除按钮
- **THEN** 系统从对应数组中移除该家具
- **AND** 重新渲染画布
- **AND** 清除选中状态

### Requirement: 朝向调整

系统 SHALL 允许用户调整选中家具的朝向。

#### Scenario: 旋转家具

- **WHEN** 用户选中某个家具
- **AND** 用户点击旋转按钮
- **THEN** 系统将家具朝向顺时针旋转 90 度
- **AND** 朝向循环顺序为 up → right → down → left → up
- **AND** 重新渲染画布

#### Scenario: 大型家具旋转

- **WHEN** 用户选中桌子或床（多格家具）
- **AND** 用户点击旋转按钮
- **THEN** 系统将家具旋转并交换 width 和 height
- **AND** 检查旋转后是否超出画布边界
- **AND** 如果超出边界，提示用户无法旋转

### Requirement: 家具绘制

系统 SHALL 在画布上以不同样式绘制各种家具。

#### Scenario: 绘制风扇

- **WHEN** 系统渲染画布
- **THEN** 风扇以圆形图标表示
- **AND** 挂墙风扇显示特殊标记
- **AND** 朝向以箭头或扇叶方向表示

#### Scenario: 绘制椅子

- **WHEN** 系统渲染画布
- **THEN** 椅子以 1x1 格的图标表示
- **AND** 朝向以椅背方向表示

#### Scenario: 绘制桌子

- **WHEN** 系统渲染画布
- **THEN** 桌子以 width x height 格的矩形表示
- **AND** 使用木纹色填充

#### Scenario: 绘制床

- **WHEN** 系统渲染画布
- **THEN** 床以 width x height 格的矩形表示
- **AND** 枕头端根据朝向绘制在对应位置

