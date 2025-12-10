# 提案：fix-wall-drawing-logic

## Why

当前通风分析系统的墙壁绘制存在严重的视觉问题：**墙壁显示为6像素宽的细线段，远远窄于网格单元格**。这与原始系统的设计意图不符，导致用户无法准确理解房间布局，影响通风分析的准确性和可读性。

**用户影响**：
- 墙壁难以识别，用户体验差
- 与原始系统视觉效果不一致
- 影响后续通风分析的可视化效果

## What Changes

将墙壁绘制从"线段描边"改为"矩形填充"，使墙壁完全填满网格单元格。

**核心变更**：
1. **绘制方式**：`stroke()` 线条 → `fillRect()` 填充
2. **数据格式**：统一使用 `{x, y, width, height}` 格式，向后兼容旧格式 `{startX, startY, endX, endY}`
3. **颜色规范**：墙壁使用黑色 `#000000` 填充

**修改文件**：
- `pages/design/utils/drawing.js` - 绘制函数
- `pages/design/index.js` - 数据创建与处理逻辑

## 问题描述

当前系统 (`pages/design/utils/drawing.js`) 与原始系统 (`tmp/源/index.html`) 在墙壁表示和绘制上存在本质差异：

| 方面 | 原始系统 | 当前系统 |
|------|----------|----------|
| **数据结构** | `{x, y, width, height}` 矩形区域 | `{startX, startY, endX, endY}` 线段端点 |
| **绘制方式** | `fillRect()` 填充网格 | `stroke()` 绘制线条 |
| **视觉效果** | 墙壁填满整个网格单元 | 墙壁显示为6像素宽的细线 |

### 原始系统绘制逻辑（参考）

```javascript
// tmp/源/index.html 第 1519-1538 行
this.designData.base_layer.walls.forEach(wall => {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(
        wall.x * this.cellSize,
        wall.y * this.cellSize,
        wall.width * this.cellSize,
        wall.height * this.cellSize
    );
});
```

### 当前系统绘制逻辑（问题代码）

```javascript
// pages/design/utils/drawing.js 第 16-28 行
function drawWall(ctx, wall, cellSize, color = '#424242', isSelected = false) {
  const start = gridUtils.gridToPixel(wall.startX, wall.startY, cellSize)
  const end = gridUtils.gridToPixel(wall.endX, wall.endY, cellSize)
  ctx.strokeStyle = isSelected ? '#f44336' : color
  ctx.lineWidth = isSelected ? 8 : 6  // 仅6像素宽
  ctx.beginPath()
  ctx.moveTo(start.x + cellSize / 2, start.y + cellSize / 2)
  ctx.lineTo(end.x + cellSize / 2, end.y + cellSize / 2)
  ctx.stroke()
}
```

## 修复方案

将当前系统的墙壁绘制逻辑改为与原始系统一致：

1. **数据结构兼容**：支持两种数据格式（`{x, y, width, height}` 和 `{startX, startY, endX, endY}`），自动转换
2. **绘制方式改为填充**：使用 `fillRect()` 填满网格区域，而非 `stroke()` 绘制线条
3. **颜色保持一致**：墙壁使用黑色 `#000000` 填充

## 影响范围

- `pages/design/utils/drawing.js` - 修改 `drawWall` 函数
- `pages/design/index.js` - 修改墙壁数据创建和处理逻辑

## 关联能力

- `base-layer-drawing` - 墙壁绘制需求
