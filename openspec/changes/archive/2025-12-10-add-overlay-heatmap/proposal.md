# Change: 实现叠加层热力图可视化功能

## Why

当前 `layer-switching` 规范中的叠加层功能仅有框架，未实现热力图/通风分析可视化。用户无法查看设计的通风效率分析结果，这是该规范中唯一未完成的功能（当前完成度约 60%）。

代码中已有 TODO 标记（`pages/design/index.js:215`）：
```javascript
// TODO: 叠加层可视化（热力图等）将在后续实现
```

## What Changes

- 新增叠加层数据结构（`overlay_layer`），存储热力图分析结果
- 实现叠加层工具栏，提供「加载分析结果」按钮
- 实现热力图渲染功能，将分析数据可视化为颜色渐变网格
- 集成后端 API（若存在）或支持本地 Mock 数据加载
- 补充叠加层模式下的交互逻辑

## Impact

- **受影响规范**: `layer-switching`
- **受影响代码**:
  - `pages/design/index.js` - 数据结构、工具栏逻辑、渲染逻辑
  - `pages/design/index.wxml` - 叠加层工具栏 UI
  - `pages/design/utils/drawing.js` - 热力图绘制函数
- **数据格式扩展**: `designData` 结构需增加 `overlay_layer` 字段
