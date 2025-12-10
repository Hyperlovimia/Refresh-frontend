# layer-switching Specification

## Purpose
TBD - created by archiving change add-furniture-layer. Update Purpose after archive.
## Requirements
### Requirement: 图层切换按钮

系统 SHALL 在页面顶部提供图层切换按钮组。

#### Scenario: 显示图层按钮

- **WHEN** 用户进入设计页面
- **THEN** 页面顶部显示三个图层按钮：基础层、家具层、叠加层
- **AND** 当前图层按钮高亮显示
- **AND** 默认选中基础层

### Requirement: 切换图层

系统 SHALL 允许用户点击按钮切换当前编辑图层。

#### Scenario: 切换到基础层

- **WHEN** 用户点击"基础层"按钮
- **THEN** 系统切换到基础层编辑模式
- **AND** 工具栏显示墙壁、房间、门、窗工具
- **AND** 高亮显示"基础层"按钮

#### Scenario: 切换到家具层

- **WHEN** 用户点击"家具层"按钮
- **THEN** 系统切换到家具层编辑模式
- **AND** 工具栏显示风扇、椅子、桌子、床工具
- **AND** 高亮显示"家具层"按钮

#### Scenario: 切换到叠加层

- **WHEN** 用户点击"叠加层"按钮
- **THEN** 系统切换到叠加层查看模式
- **AND** 工具栏隐藏或显示分析相关按钮
- **AND** 高亮显示"叠加层"按钮

### Requirement: 工具栏联动

系统 SHALL 根据当前图层动态显示对应的工具。

#### Scenario: 基础层工具

- **WHEN** 当前图层为基础层
- **THEN** 工具栏显示：墙壁、房间、门、窗、选择
- **AND** 隐藏家具相关工具

#### Scenario: 家具层工具

- **WHEN** 当前图层为家具层
- **THEN** 工具栏显示：风扇、椅子、桌子、床、选择、旋转
- **AND** 隐藏基础层相关工具

#### Scenario: 叠加层工具

- **WHEN** 当前图层为叠加层
- **THEN** 工具栏显示：加载分析结果、清除热力图
- **AND** 隐藏所有绘制工具

### Requirement: 图层可见性

系统 SHALL 在渲染时根据当前模式控制各图层的可见性。

#### Scenario: 基础层模式渲染

- **WHEN** 当前为基础层模式
- **THEN** 渲染基础层元素（墙壁、房间、门、窗）
- **AND** 家具层元素以半透明方式渲染（可选）

#### Scenario: 家具层模式渲染

- **WHEN** 当前为家具层模式
- **THEN** 渲染基础层元素（作为背景参考）
- **AND** 渲染家具层元素

#### Scenario: 叠加层模式渲染

- **WHEN** 当前为叠加层模式
- **THEN** 渲染基础层和家具层元素
- **AND** 叠加渲染热力图（如已加载）
- **AND** 热力图以半透明颜色显示，不完全遮挡下层元素

### Requirement: 选中状态清除

系统 SHALL 在切换图层时清除当前选中状态。

#### Scenario: 切换图层清除选中

- **WHEN** 用户切换到另一个图层
- **THEN** 系统清除当前选中的元素
- **AND** 重置选中相关状态

### Requirement: 叠加层数据结构

系统 SHALL 使用 `overlay_layer` 存储热力图分析数据。

#### Scenario: 数据格式定义

- **WHEN** 加载或保存叠加层数据
- **THEN** 数据格式符合以下结构：
  ```json
  {
    "overlay_layer": {
      "heatmap": {
        "grid": [[0.5, 0.8, ...], ...],
        "minValue": 0,
        "maxValue": 1,
        "unit": "通风系数"
      }
    }
  }
  ```
- **AND** `grid` 为 20×20 的二维数组，每个值代表该格子的分析数值
- **AND** `minValue` 和 `maxValue` 定义数据范围用于颜色映射

### Requirement: 热力图渲染

系统 SHALL 在叠加层模式下以颜色渐变方式渲染热力图数据。

#### Scenario: 渲染热力图

- **WHEN** 当前为叠加层模式
- **AND** 存在热力图数据（`overlay_layer.heatmap` 非空）
- **THEN** 系统以半透明颜色渐变方式渲染每个格子
- **AND** 低值显示为蓝色（冷），高值显示为红色（热）
- **AND** 热力图叠加在基础层和家具层之上

#### Scenario: 无热力图数据

- **WHEN** 当前为叠加层模式
- **AND** 热力图数据为空
- **THEN** 系统仅渲染基础层和家具层
- **AND** 在状态栏提示「暂无分析数据，请加载」

### Requirement: 加载分析结果

系统 SHALL 允许用户加载热力图分析结果数据。

#### Scenario: 点击加载按钮

- **WHEN** 用户点击「加载分析结果」按钮
- **THEN** 系统显示加载提示
- **AND** 尝试从后端 API 或本地 Mock 获取分析数据

#### Scenario: 加载成功

- **WHEN** 分析数据加载成功
- **THEN** 系统将数据存入 `overlay_layer.heatmap`
- **AND** 重新渲染画布显示热力图
- **AND** 显示「加载成功」提示

#### Scenario: 加载失败

- **WHEN** 分析数据加载失败
- **THEN** 系统显示「加载失败」错误提示
- **AND** 保持当前画布状态不变

### Requirement: 清除热力图

系统 SHALL 允许用户清除当前加载的热力图数据。

#### Scenario: 清除热力图

- **WHEN** 用户点击「清除热力图」按钮
- **THEN** 系统清空 `overlay_layer.heatmap` 数据
- **AND** 重新渲染画布（仅显示基础层和家具层）
- **AND** 显示「已清除」提示

### Requirement: 分析值显示

系统 SHALL 在叠加层模式下触摸画布时显示当前格子的分析值。

#### Scenario: 显示分析值

- **WHEN** 当前为叠加层模式
- **AND** 存在热力图数据
- **AND** 用户触摸画布某个格子
- **THEN** 系统在状态栏显示该格子的分析值和单位
- **AND** 格式为「分析值: 0.75 (通风系数)」

