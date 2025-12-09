# CLAUDE.md

## 概览

This is a WeChat MiniProgram.

## 工作原则

- **三方协作**: 你作为主AI，只负责规划与执行。`codex` MCP 负责审查逻辑/定位 bug，`gemini` MCP 负责设计前端 UI。
- **交流语言**: 文档与注释必须使用 **简体中文，UTF-8（无 BOM）** 编写。与用户中文交流，与 Codex/Gemini 英文。
- **明确需求**: 用户表达模糊时，主AI必须用多轮提问澄清，可质疑思路并提出更优解。
- **语义理解**: 
    - 外部检索：优先使用 `exa` MCP；
    - 内部检索：优先使用 `code-index` MCP；
    - 引用资料必须写明来源与用途，保持可追溯。
- **深度思考**: 复杂任务规划、复杂逻辑设计、大幅修改代码等所有复杂工作，调用 `sequential-thinking` MCP。

## 三方协作流程

需求分析 → 告知 codex/gemini 原始需求 + 初始思路 → 迭代讨论
↓
编码前 → 向 codex(后端) 或 gemini(前端) 索要代码原型
↓
实施 → 以原型为参考重写为生产级代码
↓
完成后 → codex review 代码改动

**注意**: codex/gemini 仅供参考，保持独立思考和质疑。

## Project Structure

```
./
├── app.js                 # 小程序入口脚本（注册 App）
├── app.json               # 小程序全局配置（页面路由、窗口表现等）
├── app.less               # 全局样式（Less）
├── config.js              # 项目运行时配置（API 地址等）
├── package.json           # 项目依赖与脚本（用于本地开发/管理）
├── README.md              # 项目说明文档
├── sitemap.json           # 小程序站点地图配置
├── LICENSE                # 许可证
├── project.config.json    # 微信开发者工具配置（本地）
├── project.private.config.json # 私有配置（本地）
├── request.js             # 网络请求封装（全局）
├── api/                   # API 接口定义目录
│   └── ...
├── behaviors/             # 小程序自定义行为（behaviors）
│   └── useToast.js        # 通用吐司行为封装
├── components/            # 可复用组件集合
│   ├── card/              # 示例组件：卡片
│   │   ├── index.wxml
│   │   ├── index.js
│   │   ├── index.json
│   │   └── index.less
│   └── nav/               # 示例组件：导航
│       ├── index.wxml
│       ├── index.js
│       ├── index.json
│       └── index.less
├── custom-tab-bar/        # 自定义底部 Tab 栏实现
│   ├── index.wxml
│   ├── index.js
│   ├── index.json
│   └── index.less
├── config/                # 项目配置（按功能划分）
│   └── index.js
├── miniprogram_npm/       # 第三方 npm 包（已构建到小程序可用格式）
│   ├── dayjs/             # 时间库封装
│   └── tdesign-miniprogram/ # TDesign 组件库（按组件目录组织）
├── mock/                  # 本地 Mock 数据与工具（用于离线开发）
│   ├── index.js
│   ├── mock.js
│   └── WxMock.js
├── pages/                 # 小程序页面目录（页面为小程序路由单元）
│   ├── home/
│   ├── login/
│   ├── chat/
│   └── ...
├── static/                # 静态资源（图片、字体等）
├── tmp/                   # 临时文件/开发用脚本（不应提交核心业务代码）
│   ├── app.py
│   └── index.html
├── utils/                 # 工具函数库
│   ├── eventBus.js        # 事件总线（组件间通信）
│   └── util.js            # 通用工具函数
```

## 文档索引

| 主题 | 路径 | 说明 |
|------|------|------|
| Codex | `.claude/docs/mcp-codex.md` | 后端/逻辑/Debug |
| Gemini | `.claude/docs/mcp-gemini.md` | 前端/UI/规划 |

## 架构优先级

标准化、复用官方 SDK / 社区成熟方案 > 常规搜索 > 本地资料。
禁止自研重复方案，除非已有方案无法满足需求且获特批。
引入外部能力必须确认兼容并写明复用指引。
旧有自研实现需规划替换或下线。

## 代码质量标准

### 注释要求

- **简体中文，UTF-8（无 BOM）**
- 解释意图、约束、行为。
- 禁止写“修改说明式注释”。
- 对复杂依赖必须写明设计理由。

### 设计原则

- 遵循 SOLID、DRY、关注点分离。
- 依赖倒置、接口隔离优先。

### 实现标准

- 禁止占位符或未完成实现（除非用户要求）。
- 必须删除过时代码。
- 破坏性改动无需兼容，但需给出迁移或回滚方案。
- 拒绝一切 CI、远程流水线或人工外包验证，所有验证均由本地 AI 自动执行。

## 开发哲学

- 渐进式、小步交付、每次可编译可验证。
- 简单优先、拒绝炫技。
- 风格、命名、格式必须与现有保持一致。
- 有额外解释代表过于复杂，应继续简化。

### 简单性定义

- 每个函数或类建议仅承担单一责任
- 禁止过早抽象；重复出现三次以上再考虑通用化
- 禁止使用"聪明"技巧，以可读性为先
- 如果需要额外解释，说明实现仍然过于复杂，应继续简化
