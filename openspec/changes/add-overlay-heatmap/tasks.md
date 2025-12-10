## 1. 数据结构扩展

- [x] 1.1 在 `designData` 中添加 `overlay_layer` 字段结构
- [x] 1.2 定义热力图数据格式：`{ grid: number[][], minValue, maxValue, unit }`
- [x] 1.3 扩展 `saveToLocalCache` 和 `loadFromLocalCache` 支持新字段

## 2. 叠加层工具栏 UI

- [x] 2.1 在 `index.wxml` 添加叠加层专用工具栏区域
- [x] 2.2 添加「加载分析结果」按钮
- [x] 2.3 添加「清除热力图」按钮
- [x] 2.4 在 `index.less` 添加叠加层工具栏样式

## 3. 热力图渲染

- [x] 3.1 在 `drawing.js` 中实现 `drawHeatmap(ctx, heatmapData, gridSize, cellSize)` 函数
- [x] 3.2 实现颜色映射逻辑（值 → 颜色渐变）
- [x] 3.3 在 `renderCanvas` 叠加层分支调用热力图绘制
- [x] 3.4 支持半透明叠加渲染（不遮挡基础层和家具层）

## 4. 分析数据加载

- [x] 4.1 实现 `onLoadAnalysis` 方法（工具栏按钮回调）
- [x] 4.2 支持从后端 API 加载分析结果（若 API 存在）
- [x] 4.3 支持本地 Mock 数据加载（开发/演示用）
- [x] 4.4 实现 `onClearHeatmap` 清除热力图数据

## 5. 交互优化

- [x] 5.1 叠加层模式下禁用绘制工具（仅显示分析相关按钮）
- [x] 5.2 热力图数据存在时在状态栏显示当前值范围
- [x] 5.3 触摸画布时显示当前格子的分析值

## 6. 持久化兼容

- [x] 6.1 确保后端保存/加载支持 `overlay_layer` 字段
- [x] 6.2 确保旧版数据加载时 `overlay_layer` 默认为空
