# design-persistence Specification

## Purpose
TBD - created by archiving change add-ventilation-design-core. Update Purpose after archive.
## Requirements
### Requirement: 本地缓存保存

系统 SHALL 支持将当前设计数据保存到微信小程序本地缓存。

#### Scenario: 保存到本地缓存

- **WHEN** 用户修改设计（绘制或删除元素）
- **THEN** 系统自动将设计数据保存到 `wx.setStorageSync('current_design', data)`
- **AND** 保存的数据包含 baseLayer、gridSize、cellSize 等字段

### Requirement: 本地缓存加载

系统 SHALL 支持从微信小程序本地缓存恢复设计数据。

#### Scenario: 页面加载时恢复

- **WHEN** 用户进入设计页面
- **THEN** 系统尝试从 `wx.getStorageSync('current_design')` 读取数据
- **AND** 如果数据存在，恢复设计状态并渲染画布
- **AND** 如果数据不存在，初始化空白设计

### Requirement: 后端保存

系统 SHALL 支持将设计数据发送到后端服务器保存为文件。

#### Scenario: 保存设计到后端

- **WHEN** 用户点击"保存"按钮
- **THEN** 系统发送 POST 请求到 `http://localhost:5000/api/designs`
- **AND** 请求体包含 name、baseLayer、gridSize、cellSize 等字段
- **AND** 显示加载提示

#### Scenario: 保存成功

- **WHEN** 后端返回 `{ success: true, file_name: "xxx.json" }`
- **THEN** 系统显示"保存成功: xxx.json"提示
- **AND** 更新本地缓存

#### Scenario: 保存失败

- **WHEN** 后端返回错误或网络失败
- **THEN** 系统显示"保存失败"错误提示
- **AND** 提示用户检查后端服务是否启动

### Requirement: 文件列表获取

系统 SHALL 支持从后端获取已保存的设计文件列表。

#### Scenario: 获取文件列表

- **WHEN** 用户点击"加载"按钮
- **THEN** 系统发送 GET 请求到 `http://localhost:5000/api/files`
- **AND** 显示加载提示

#### Scenario: 显示文件列表

- **WHEN** 后端返回文件列表数组
- **THEN** 系统显示文件选择弹窗
- **AND** 列表按修改时间倒序排列
- **AND** 每项显示文件名和修改时间

### Requirement: 后端加载

系统 SHALL 支持从后端加载指定的设计文件。

#### Scenario: 加载设计文件

- **WHEN** 用户在文件列表中选择某个文件
- **THEN** 系统发送 POST 请求到 `http://localhost:5000/api/designs/load`
- **AND** 请求体包含 `{ file_name: "xxx.json" }`

#### Scenario: 加载成功

- **WHEN** 后端返回 `{ success: true, design: {...} }`
- **THEN** 系统用返回的数据替换当前设计
- **AND** 重新渲染画布
- **AND** 更新本地缓存
- **AND** 显示"加载成功"提示

#### Scenario: 加载失败

- **WHEN** 后端返回错误或文件不存在
- **THEN** 系统显示"加载失败"错误提示

### Requirement: 设计数据格式

系统 SHALL 使用统一的数据格式进行保存和加载。

#### Scenario: 数据格式定义

- **WHEN** 保存或加载设计数据
- **THEN** 数据格式符合以下结构：
  ```json
  {
    "name": "设计名称",
    "baseLayer": {
      "walls": [{ "startX": 0, "startY": 0, "endX": 5, "endY": 0 }],
      "rooms": [{ "x": 1, "y": 1, "width": 4, "height": 3 }],
      "doors": [{ "x": 2, "y": 0, "direction": "horizontal" }],
      "windows": [{ "x": 0, "y": 2, "direction": "vertical" }]
    },
    "gridSize": 20,
    "cellSize": 30
  }
  ```

