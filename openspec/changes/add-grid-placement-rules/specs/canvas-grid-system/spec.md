# canvas-grid-system 规范变更

## ADDED Requirements

### Requirement: 网格单元状态管理

系统 SHALL 维护每个网格单元的占用状态和房间内部属性。

#### Scenario: 查询单元格元素

- **WHEN** 系统需要检查网格单元的占用状态
- **THEN** 系统返回该单元格当前的元素（如果有）
- **AND** 返回 null 如果单元格为空

#### Scenario: 设置单元格元素

- **WHEN** 系统在网格单元放置元素
- **THEN** 系统更新该单元格的元素引用
- **AND** 标记该单元格为已占用

#### Scenario: 清除单元格

- **WHEN** 系统从网格单元移除元素
- **THEN** 系统清除该单元格的元素引用
- **AND** 标记该单元格为空闲

#### Scenario: 查询房间内部状态

- **WHEN** 系统需要检查网格单元是否在房间内部
- **THEN** 系统返回该单元格的 Room_Interior 属性值

#### Scenario: 设置房间内部状态

- **WHEN** 房间边界发生变化
- **THEN** 系统重新计算受影响单元格的 Room_Interior 属性
- **AND** 更新所有相关单元格的状态

### Requirement: 多格元素占用跟踪

系统 SHALL 跟踪多格元素占用的所有网格单元。

#### Scenario: 计算多格元素占用

- **WHEN** 系统需要确定多格元素占用的所有单元格
- **THEN** 系统根据元素的 x、y、width、height 和 direction 计算所有占用单元
- **AND** 返回完整的单元格坐标列表

#### Scenario: 识别多格元素

- **WHEN** 系统需要判断元素是否为多格元素
- **THEN** 系统检查元素的 width 和 height 属性
- **AND** 如果 width > 1 或 height > 1，返回 true
- **AND** 否则返回 false
