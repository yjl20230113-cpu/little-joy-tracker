
# Little Joy Tracker / 小美好记录器

一个面向移动端场景的私密记录型 PWA，用来收集生活里的“小美好”，也接住情绪低落时的“阴天时刻”。

项目核心目标很明确：

- 打开就能记，尽量减少操作层级
- 让记录适合 iPhone 主屏使用场景
- 用 Supabase 做账号、数据和图片存储
- 用 AI 帮用户做总结、洞察和温柔反馈

目前这是一个持续迭代中的产品原型，已经具备可运行的主流程与多项 AI 辅助能力。

## 功能亮点

- 快速记录：登录后直接进入速记页，可选择人物、日期、文字和图片。
- 时间线回顾：按日期聚合查看记录，并支持按人物与时间范围筛选。
- 单条记录洞察：为一条记录生成更细的 AI 洞察内容。
- AI 总结报告：基于一段时间内的记录生成关键词、情绪天气、人格画像和建议。
- 阴天模式：除了“记录小美好”，也支持记录低落时刻，并生成“解忧卡片”。
- 自动配图：当记录没有上传图片时，可基于文本内容生成 Unsplash 配图建议。
- PWA 体验：支持 Web App Manifest、主屏安装与更新检测，更贴近移动端使用方式。
- 个人资料：支持用户昵称、头像与应用刷新提醒。

## 技术栈

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase
  - Auth
  - Postgres
  - Storage
- DeepSeek API
- Unsplash API
- Vitest + Testing Library

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制一份 `.env.example` 到 `.env.local`，然后填写真实值。

```bash
cp .env.example .env.local
```

Windows PowerShell 也可以直接手动复制文件内容。

### 3. 准备 Supabase

这个项目依赖 Supabase 的账号系统、数据库和对象存储。

你至少需要准备：

- 开启 Email / Password 登录
- 配置一个图片 bucket，默认名称是 `joy-images`
- 让应用可访问 `profiles`、`persons`、`events` 这些表
- 执行仓库根目录的 [supabase-sql.md](./supabase-sql.md) 中的增量迁移

说明：

- `supabase-sql.md` 当前收录的是已实现功能所需的增量 SQL，包含标题、单条 AI 洞察、自动配图、阴天模式和用户资料等字段或表。
- 如果你是从零新建 Supabase 项目，建议先补齐基础表结构，再按文件中的迁移顺序执行。

### 4. 启动开发服务器

```bash
npm run dev
```

默认会启动 Next.js 开发环境。启动后访问：

- [http://localhost:3000](http://localhost:3000)

### 5. 常用脚本

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## 环境变量

| 变量名 | 是否必需 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 匿名公钥 |
| `NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET` | 否 | 图片存储 bucket 名称，默认 `joy-images` |
| `DEEPSEEK_API_KEY` | 否 | AI 总结、单条洞察、阴天分析、标题生成所需 |
| `UNSPLASH_ACCESS_KEY` | 否 | 自动配图功能所需 |

补充说明：

- 不配置 `DEEPSEEK_API_KEY` 时，所有依赖 AI 的 API 路由都会不可用。
- 不配置 `UNSPLASH_ACCESS_KEY` 时，自动配图功能不可用，但其他流程仍可运行。

## 项目结构

```text
src/
  app/                  Next.js 页面与 API 路由
  components/           UI 组件
  lib/                  业务逻辑、Supabase 客户端、AI 结果处理
public/                 PWA 资源、图标与 Service Worker
docs/                   过程文档与交接记录
scripts/                开发脚本
supabase-sql.md         Supabase 增量迁移说明
```

## 关键页面与能力

- `/`：应用主入口，包含速记、时间线、AI 总结、个人资料等核心流程
- `/events/[id]`：记录详情页
- `/api/summary`：生成时间段 AI 总结
- `/api/event-insight`：生成单条记录洞察
- `/api/cloudy-analysis`：生成阴天模式疗愈卡片
- `/api/memory-title`：生成记录短标题
- `/api/generate-auto-image`：生成 Unsplash 自动配图结果
- `/preview/*`：一些界面风格与布局预览页面

## 文档参考

如果你想继续扩展这个项目，可以先看这些文档：

- [little-joy-tracker-prd.md](./little-joy-tracker-prd.md)
- [little-joy-tracker-designSpec.md](./little-joy-tracker-designSpec.md)
- [little-joy-tracker-ui-guidelines.md](./little-joy-tracker-ui-guidelines.md)

## 部署建议

推荐部署到 Vercel，并配合 Supabase 使用。

部署时请注意：

- 在 Vercel 中同步配置所有环境变量
- 如果执行了新的 Supabase 迁移，记得刷新 API schema cache
- PWA 资源和图标已经在仓库中准备好，可直接随构建产物发布

## 适合谁

这个项目适合：

- 想做一款有情绪温度的个人记录产品的人
- 想用 Next.js + Supabase 快速搭一个移动优先 Web App 的人
- 想研究“记录 + AI 洞察 + PWA”组合产品形态的人

如果你准备把它继续做成正式产品，这个仓库已经具备一个比较完整的原型基础。
