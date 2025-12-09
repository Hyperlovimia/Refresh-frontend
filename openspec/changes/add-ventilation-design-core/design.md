# Design: 通风分析设计核心功能

## Context

通风分析系统是一个基于微信小程序的房间布局建模工具。用户通过网格化画布绘制房间结构（墙壁、房间、门窗），系统将布局数据发送给后端进行通风分析。

**约束条件**：
- 必须使用原生微信小程序（无编译框架）
- 后端为 Flask，运行在 localhost:5000
- 需要支持设计的保存/加载

**利益相关方**：
- 最终用户：进行房间布局设计
- 后端算法：接收布局数据进行通风分析

## Goals / Non-Goals

### Goals

1. 实现可交互的网格画布系统
2. 支持基础层元素（墙壁、房间、门、窗）的绘制
3. 支持元素的选择与删除
4. 实现设计数据的保存与加载

### Non-Goals

1. 本次不实现家具层功能
2. 本次不实现通风分析热力图
3. 不实现画布缩放/平移
4. 不实现撤销/重做功能

## Decisions

### Decision 1: Canvas 2D API

**选择**：使用微信小程序 Canvas 2D API

**理由**：
- 官方推荐，性能优于旧版 Canvas
- 支持离屏渲染
- API 与 Web Canvas 更接近

**替代方案**：
- 旧版 Canvas API：已废弃，不推荐
- WebGL：过于复杂，不适合 2D 绘制

### Decision 2: 格子坐标系统

**选择**：元素位置使用格子坐标（非像素坐标）

**数据结构**：
```javascript
// 墙壁：从 (startX, startY) 到 (endX, endY) 的线段
{ type: 'wall', startX: 0, startY: 0, endX: 5, endY: 0 }

// 房间：左上角 (x, y)，宽 width 格，高 height 格
{ type: 'room', x: 1, y: 1, width: 4, height: 3 }

// 门/窗：位置 (x, y)，方向 direction
{ type: 'door', x: 2, y: 0, direction: 'horizontal' }
{ type: 'window', x: 0, y: 2, direction: 'vertical' }
```

**理由**：
- 便于后端网格计算
- 简化碰撞检测
- 自动网格吸附

### Decision 3: 分层渲染架构

**选择**：三层分离渲染（baseLayer → furnitureLayer → overlayLayer）

**实现方式**：
- 使用单个 Canvas，按顺序绘制
- 每层维护独立的元素数组
- 全量重绘（未做脏区域优化）

**理由**：
- 简单易实现
- 便于后续扩展
- 20x20 网格性能足够

### Decision 4: 页面结构

**选择**：单页面 + 页面级组件

**目录结构**：
```
pages/design/
├── index.wxml          # 主页面
├── index.js            # 主逻辑
├── index.json          # 配置（引用 TDesign 组件）
├── index.less          # 样式
└── utils/
    ├── grid.js         # 网格计算工具
    └── drawing.js      # 绘制工具函数
```

**理由**：
- 避免过度组件化
- 减少组件间通信开销
- 工具函数便于测试

## Risks / Trade-offs

### Risk 1: Canvas 性能

**风险**：大量元素时渲染卡顿

**缓解**：
- 限制网格大小为 20x20
- 使用 requestAnimationFrame
- 预留脏区域渲染扩展点

### Risk 2: 触摸事件处理复杂度

**风险**：拖拽绘制逻辑复杂

**缓解**：
- 明确定义 touchstart/touchmove/touchend 状态机
- 使用格子坐标简化计算

### Risk 3: 数据同步

**风险**：本地缓存与后端数据不一致

**缓解**：
- 保存时同时更新本地和后端
- 加载时优先从后端获取

## Migration Plan

本次为新增功能，无需迁移。

## Open Questions

1. **门窗尺寸**：门窗是占 1 格还是多格？
   - 建议：占 1 格，简化实现

2. **颜色方案**：各元素的渲染颜色？
   - 建议：参考 PRD 中的 UI 设计（墙壁深灰、房间浅灰、门棕色、窗蓝色）

3. **后端服务启动**：是否需要在小程序中提示后端服务状态？
   - 建议：首次保存/加载失败时提示
