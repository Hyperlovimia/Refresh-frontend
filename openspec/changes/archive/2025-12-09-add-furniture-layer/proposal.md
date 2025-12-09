# Change: 添加家具层放置功能

## Why

根据 PRD（`tmp/Docs/prd_demo_version.md`）的需求，继 `add-ventilation-design-core` 完成基础层绘制后，需要实现家具层功能。家具层允许用户在房间内放置风扇、椅子、桌子、床等家具元素，为后续通风分析提供完整的房间布局数据。

本次提案采用"核心优先"策略：
- 实现家具基础放置和图层切换
- 风扇挂墙逻辑、朝向调整在本次实现
- 风扇参数设置弹窗将在后续提案中实现

## What Changes

### 新增功能

- **图层切换**：支持基础层/家具层/叠加层切换，不同图层显示对应的工具
- **家具放置**：点击格子放置风扇、椅子、桌子、床
- **风扇挂墙**：自动检测相邻墙壁并吸附
- **朝向调整**：选中家具后可旋转朝向
- **家具选择删除**：复用基础层的选择删除逻辑

### 修改文件

- `pages/design/index.js` - 新增图层切换和家具放置逻辑
- `pages/design/index.wxml` - 新增图层切换按钮和家具工具栏
- `pages/design/index.less` - 新增图层和家具相关样式
- `pages/design/utils/drawing.js` - 新增家具绘制函数

### 数据结构

```json
{
  "furniture_layer": {
    "fans": [{ "x": 5, "y": 0, "direction": "down", "wallAttached": true }],
    "chairs": [{ "x": 3, "y": 4, "direction": "up" }],
    "tables": [{ "x": 6, "y": 4, "direction": "up", "width": 2, "height": 1 }],
    "beds": [{ "x": 8, "y": 2, "direction": "right", "width": 2, "height": 3 }]
  }
}
```

## Impact

- **新增 specs**：
  - `furniture-placement`：家具放置核心功能
  - `layer-switching`：图层切换功能
- **受影响代码**：
  - `pages/design/` 目录下的所有文件

## 设计决策

1. **图层切换**：基础层/家具层/叠加层三个图层，工具栏根据当前图层显示对应工具
2. **朝向系统**：使用 `up`/`down`/`left`/`right` 四个方向
3. **风扇挂墙**：检测相邻格子是否有墙壁，自动吸附并设置朝向
4. **大型家具**：桌子和床支持多格尺寸（width, height）

## 后续规划

- `add-fan-parameters`：风扇参数设置（风速等）
- `add-ventilation-overlay`：叠加层可视化与热力图
