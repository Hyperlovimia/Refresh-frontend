# 任务清单：fix-wall-drawing-logic

## 任务列表

### 1. 修改墙壁绘制函数 ✅
- **文件**: `pages/design/utils/drawing.js`
- **内容**:
  - ✅ 修改 `drawWall` 函数，改用 `fillRect()` 填充整个网格区域
  - ✅ 支持两种数据格式：`{x, y, width, height}` 和 `{startX, startY, endX, endY}`
  - ✅ 墙壁颜色改为黑色 `#000000`
- **验证**: 墙壁在画布上显示为填满网格的实心矩形

### 2. 检查并修改墙壁数据创建逻辑 ✅
- **文件**: `pages/design/index.js`
- **内容**:
  - ✅ 修改 `finishWall` 函数使用 `{x, y, width, height}` 格式创建墙壁数据
  - ✅ 修改 `renderPreview` 函数使用填充方式预览墙壁
  - ✅ 修改 `detectDoorWindowDirection` 函数兼容两种数据格式
  - ✅ 修改 `isPointOnWall` 函数兼容两种数据格式
  - ✅ 修改 `isPointNearWall` 函数兼容两种数据格式
  - ✅ 修改渲染调用使用黑色 `#000000` 绘制墙壁
- **验证**: 新绘制的墙壁数据格式正确

### 3. 回归测试 ✅
- **内容**:
  - ✅ 测试墙壁绘制是否填满网格
  - ✅ 测试墙壁选中状态显示（红色填充+深红边框）
  - ✅ 测试墙壁删除功能（兼容两种格式）
  - ✅ 测试设计保存和加载功能（兼容旧数据）
- **验证**: 所有墙壁相关功能正常工作

## 依赖关系

```
任务1 (修改绘制函数) ✅
    ↓
任务2 (检查数据格式) ✅
    ↓
任务3 (回归测试) ✅
```

## 已完成的修改

### `pages/design/utils/drawing.js`
- 重写 `drawWall` 函数使用 `fillRect()` 填充
- 支持 `{x, y, width, height}` 和 `{startX, startY, endX, endY}` 两种格式自动转换
- 默认颜色改为黑色 `#000000`
- 选中状态使用红色 `#f44336` 填充 + 深红色 `#c62828` 边框

### `pages/design/index.js`
- `finishWall`: 改为生成 `{x, y, width, height}` 格式的墙壁数据
- `renderPreview`: 改为使用填充方式预览墙壁
- `detectDoorWindowDirection`: 兼容两种墙壁数据格式
- `isPointOnWall`: 兼容两种墙壁数据格式
- `isPointNearWall`: 兼容两种墙壁数据格式
- 渲染调用: 使用黑色 `#000000` 绘制墙壁

## 预期成果

✅ **已完成**：修复后，墙壁在设计画布上显示为填满整个网格单元格的实心矩形，与原始系统 (`tmp/源/index.html`) 的视觉效果一致。

## 向后兼容性

所有修改都保持了向后兼容：
- `drawWall` 函数自动识别和转换旧格式数据
- 墙壁检测函数兼容两种数据格式
- 新绘制的墙壁使用新格式，旧设计文件可正常加载和显示
