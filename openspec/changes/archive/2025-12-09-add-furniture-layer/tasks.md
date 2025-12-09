## 1. 图层切换 UI

- [x] 1.1 在 index.wxml 添加图层切换按钮组（基础层/家具层/叠加层）
- [x] 1.2 在 index.less 添加图层按钮样式
- [x] 1.3 在 index.js 添加 currentLayer 状态和切换逻辑

## 2. 工具栏扩展

- [x] 2.1 重构工具栏为根据图层动态显示
- [x] 2.2 添加家具层工具（风扇、椅子、桌子、床）
- [x] 2.3 添加旋转按钮（仅家具层选择模式显示）

## 3. 家具放置逻辑

- [x] 3.1 添加 furnitureLayer 数据结构（fans, chairs, tables, beds）
- [x] 3.2 实现风扇放置逻辑（含挂墙检测）
- [x] 3.3 实现椅子放置逻辑
- [x] 3.4 实现桌子放置逻辑（2x1 多格）
- [x] 3.5 实现床放置逻辑（2x3 多格）

## 4. 家具绘制

- [x] 4.1 在 drawing.js 添加 drawFan 函数
- [x] 4.2 在 drawing.js 添加 drawChair 函数
- [x] 4.3 在 drawing.js 添加 drawTable 函数
- [x] 4.4 在 drawing.js 添加 drawBed 函数

## 5. 家具选择与操作

- [x] 5.1 实现家具选择逻辑（点击检测）
- [x] 5.2 实现家具删除功能
- [x] 5.3 实现朝向旋转功能

## 6. 渲染更新

- [x] 6.1 更新 render 函数渲染家具层
- [x] 6.2 实现图层可见性控制

## 7. 数据持久化

- [x] 7.1 更新 saveToLocalCache 包含 furnitureLayer
- [x] 7.2 更新 loadFromLocalCache 恢复 furnitureLayer
- [x] 7.3 更新后端保存/加载包含 furnitureLayer

## 8. 验证

- [x] 8.1 测试图层切换功能
- [x] 8.2 测试各类家具放置
- [x] 8.3 测试风扇挂墙逻辑
- [x] 8.4 测试家具旋转
- [x] 8.5 测试保存/加载家具数据
