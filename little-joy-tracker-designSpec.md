# Little Joy Tracker (小美好记录器) - Design Spec

## 1. 项目背景与目标 (Context & Goals)
本项目是一个为情侣设计的私密“小美好”日常记录 Web App。发起人为应届生兼编程小白（AI 产品经理方向），希望通过 Vibe Coding（AI 辅助编程）方式实现从 0 到 1 的开发和部署。
*   **核心目标：** 提供极致便捷的记录体验（进门即记）、多维度的数据隔离与筛选、以及基于大模型的月度/周度情感总结。
*   **使用形态：** 基于 PWA（Progressive Web App）技术，在 iPhone Safari 中“添加到主屏幕”，实现免上架 App Store 且具备原生 App 全屏体验的应用。
*   **成本与难度要求：** 选用零成本（Zero-Cost）、对小白最友好且 AI 代码生成成功率最高的技术栈。

## 2. 技术选型 (Tech Stack)
*   **前端框架：** Next.js (App Router) + Tailwind CSS + React
*   **后端/BaaS：** Supabase 
    *   *Supabase Auth*：实现邮箱密码登录。
    *   *Supabase Postgres*：结构化数据存储。
    *   *Supabase Storage*：照片与多媒体对象存储。
*   **AI 大模型：** DeepSeek-V3 / Claude 3.5 Sonnet (通过 API 路由调用)
*   **部署平台：** Vercel (一键绑定 GitHub 部署，自动配置 HTTPS 域名)

## 3. 核心功能与交互流程 (Core UX Flows)

### 3.1 极简速记模式 (Landing & Quick Entry)
*   **进门即录入：** 用户登录后，打开应用首屏即为“新建事件卡片”，无需经过繁琐的菜单跳转。
*   **默认关联：** 顶部默认选择关联预设的“人员”（如：男朋友）。
*   **多媒体支持：** 点击照片占位符，通过 `<input type="file" accept="image/*" capture="environment" />` 直接唤起手机相机或相册。
*   **文本输入：** 包含“发生了什么？”（必填）与“理由/感悟”（选填）。
*   **提交动作：** 点击保存后，数据入库，页面平滑过渡至“首页记录流”；点击取消亦返回首页。

### 3.2 首页与时间线 (Timeline & Filters)
*   **数据隔离：** 严格限定只能拉取当前登录用户 (`user_id`) 的记录。
*   **展示方式：** 瀑布流/列表形式，按“天”作为视觉分隔聚合展示（如：2023-10-27 标题下排列该日的所有卡片）。
*   **筛选系统：**
    *   人员维度：全部、或指定单个人员。
    *   时间维度：过去一周、过去一个月、三个月、半年、一年、自定义。
*   **详情下钻：** 点击单张卡片进入详情，展示高清图片、完整文本，并在底部显示精确到**秒**的创建时间。

### 3.3 AI 情感总结 (AI Summary Engine)
*   在时间线页面，基于当前的“人员”与“时间”筛选条件，提供【生成 AI 总结】按钮。
*   提取该范围内的所有事件文本喂给大模型。
*   **结构化输出 (JSON 要求)：**
    *   `keywords`: 提炼近期高频词汇（如：晚风、火锅、电影）。
    *   `mood`: 总结这段时间的心情走势或状态。
    *   `personality`: 趣味人格侧写/称号（如：细节捕捉大师、温柔猫系女友）。
    *   `advice`: 基于记录内容给出的懂用户的温情建议。

## 4. 数据模型设计 (Data Schema)

基于关系型数据库（PostgreSQL via Supabase）构建，强调扩展性（如支持未来多图）：

**Table 1: `profiles` (用户表 - 由 Supabase Auth 自动管理扩展)**
*   `id`: UUID (Primary Key)
*   `email`: String

**Table 2: `persons` (人员分类表)**
*   `id`: UUID (Primary Key)
*   `user_id`: UUID (Foreign Key to profiles) -> 确保多用户隔离
*   `name`: String (e.g., "男朋友", "妈妈")
*   `avatar_url`: String (Optional)
*   `is_default`: Boolean (默认选中的人员)

**Table 3: `events` (小美好事件表)**
*   `id`: UUID (Primary Key)
*   `user_id`: UUID (Foreign Key to profiles)
*   `person_id`: UUID (Foreign Key to persons)
*   `content`: Text (必填内容)
*   `reason`: Text (选填理由)
*   `image_urls`: Text
