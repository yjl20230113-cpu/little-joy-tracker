# Little Joy Tracker · 方案三正式落地文档

## 1. 文档目的

这份文档是后续把 `方案三` 落到正式业务页面时的唯一设计与实现依据。

目标不是继续做预览，而是指导下一轮把真实业务组件改造成：

- 仅改前端表现
- 不改功能
- 不改数据结构
- 不改按钮职责
- 不改页面关系
- 不改页面跳转语义

这份文档默认未来在新对话中使用。新的实现会基于：

- 当前正式业务组件
- 当前预览网页
- 本文档

如果三者冲突，以本文档为准；如果本文档没有覆盖，再回到预览网页；如果仍不明确，保留现有业务行为不变。

---

## 2. 本轮已锁定的目标方案

正式落地方向锁定为：

- `方案 B` 的详细预览页中的 `方向 C`
- 交互名：`交互 C · Editorial Focus`
- 配色名：`配色 3 · Rose Slate`

对应预览地址：

- `http://localhost:3000/preview/palette-systems/pearl-dawn`

在该页面中，后续正式实现时要对齐的是：

- `方向 C`
- `Editorial Focus`
- `Rose Slate`

不是 `Pearl Glow`
不是 `Cocoa Mist`
不是 `Compact Card Stack`
不是 `Layered Sheet Flow`

---

## 3. 不可违反的约束

### 3.1 功能约束

正式页面优化时必须保留现有业务能力：

- Joy 记录
- Cloudy 记录
- 时间线浏览
- AI 总结生成与分享
- 个人资料编辑
- Cloudy 档案袋浏览 / 重试 / 删除
- 详情页查看 / 编辑 / 删除
- 底部导航四入口

### 3.2 交互语义约束

以下内容允许改“表现方式”，不允许改“语义”：

- 返回按钮仍然返回原目标页
- 编辑按钮仍然进入原编辑状态
- 删除按钮仍然执行原删除逻辑
- 日期、人名、图片、筛选的入口仍然保留
- Joy / Cloudy 切换仍保留现有双模式关系

### 3.3 高度约束

所有手机页面必须保持统一外框高度。

固定契约：

- 预览手机画布：`402 × 874 pt`
- `safe top = 59`
- `safe side = 14`
- `safe bottom = 34`

这组值是当前项目的实现基线。后续正式业务页面要沿用同一手机画布节奏：

- 外层壳高度固定
- 顶栏高度固定
- 底栏高度固定
- 页面滚动只发生在内容区
- 禁止页面外框随内容变高

### 3.4 品牌约束

正式落地后必须清晰区分：

- `小美好 / Joy`
- `小烦恼 / Cloudy`

这不是同色系深浅变化。
必须是同一品牌骨架下的两种情绪气候。

---

## 4. iPhone 17 Pro 设计基线

### 4.1 官方事实

基于 Apple 官方规格页，`iPhone 17 Pro` 当前公开的关键硬件事实包括：

- `6.3-inch` 显示屏
- `2622 × 1206` 分辨率
- 机身尺寸约 `150.0 × 71.9 mm`

这些数据用于确定本项目继续采用“窄边框、长纵向、单手可读、底部优先”的 iPhone 级交互结构。

### 4.2 本项目的实现契约

Apple 官方规格页给出的是设备级尺寸与像素，不直接等同于网页预览里的 `pt` 画布。

因此本项目后续实现时，一律采用当前预览系统已经落下来的内部契约：

- `PhoneCanvas = 402 × 874 pt`
- 所有静态预览与正式移动壳都对齐这个比例

这条规则属于项目级规范，不再重新推导。

### 4.3 Apple 交互原则如何转译到本项目

后续正式 UI 必须遵守以下 iPhone 风格原则：

1. 顶部 chrome 更薄，不能抢正文。
2. 底部导航和工具操作属于稳定层，不要随页面风格漂移。
3. 内容层应在视觉上“流过”顶部和底部材质层，而不是被厚重色块生硬切开。
4. 控件要呈现材质感、分层感和轻量感，而不是用大色块堆砌。
5. 主要动作要强，但不能粗暴；要依靠锚点色、位置和秩序，不依靠大面积高饱和背景。

---

## 5. 当前正式业务页面的功能骨架

当前真实业务页面的主结构没有问题，不需要改页面职责。

### 5.1 一级页面

- `QuickEntry`：Joy / Cloudy 记录
- `TimelineView`：时间线
- `InsightView`：AI 总结
- `ProfileView`：个人中心

### 5.2 二级页面 / 面板

- `CloudyArchiveView`：Cloudy 档案袋
- `EventDetailView`：详情页外层
- `EventDetailPanel`：详情编辑面板
- `CloudyLetterCard`：Cloudy 回信内容

### 5.3 共用基础组件

- `AppTopBar`
- `AppBottomNav`
- `TimelineFilters`
- `AppDatePicker`
- `AutoGrowTextarea`
- `AppToast`

正式优化时，不改这些组件的职责，只重做其视觉系统、密度系统和状态表达。

---

## 6. 方案三相对于现状的总方向

### 6.1 当前真实页面的问题

当前正式页面的问题不是功能，而是视觉结构：

- 顶栏偏厚
- 卡片偏大
- 输入区偏重
- Cloudy 大面积紫色底显得发飘
- Joy / Cloudy 的区分主要依赖底色切换，缺少真正的气候差异
- 详情页与长文页更像信息堆叠，不像高质量阅读产品

### 6.2 方案三的解决路径

`Editorial Focus` 的核心不是做得更花，而是：

- 让版式更薄
- 让阅读更安静
- 让颜色更克制
- 让重点更准
- 让 Joy / Cloudy 的差异来自整套视觉气候，而不是单一背景色

换句话说，方案三是“更精致的内容产品化”，不是“更装饰的卡片化”。

---

## 7. 方案三的视觉系统

### 7.1 主压色

主压色已经锁定：

- `深可可棕`：`#4B352D`

它是整个产品的视觉锚点，只能用于以下角色：

- 顶部标题
- 主按钮文字或主按钮底
- 重点标签
- 激活态
- 关键分隔与标题层级
- 重要图标

严禁把 `深可可棕` 扩散成大面积页面背景。

### 7.2 Joy 色组

Joy 的气候应当是“暖亮、呼吸感、带故事感”，但不能幼态。

推荐采用当前方案三已落下的配色：

- `Joy accent`: `#C17F66`
- `Joy accent soft`: `#F1D8D0`
- `Joy highlight`: `rgba(245, 221, 213, 0.98)`
- `Joy 页面底感`: 偏珍珠暖白、裸粉米、柔杏暖光

Joy 页面要呈现：

- 轻
- 温
- 细
- 亮但不刺眼

Joy 禁止再次退回纯黄大底 + 橙色大按钮的旧逻辑。

### 7.3 Cloudy 色组

Cloudy 的气候应当是“冷静、包裹、收束、被安放”，不是“情绪化的紫”。

推荐采用当前方案三已落下的配色：

- `Cloudy accent`: `#8F8595`
- `Cloudy accent soft`: `#E3DDE5`
- `Cloudy surface`: `rgba(245, 242, 246, 0.98)`
- `Cloudy highlight`: `rgba(226, 220, 230, 0.98)`

Cloudy 页面必须呈现：

- 冷静
- 纸感
- 雾感
- 收纳感

Cloudy 禁止出现：

- 大面积单层紫底
- 过饱和薰衣草色
- 像情绪海报一样的高存在感背景

### 7.4 中性骨架

Joy 与 Cloudy 虽然分色，但中性骨架必须统一：

- 同一套圆角层级
- 同一套边框透明度
- 同一套阴影逻辑
- 同一套排版比例
- 同一套底部导航结构
- 同一套顶部工具位规则

这样两种情绪才是“一个产品里的双气候”，而不是“两套 App”。

---

## 8. 方案三的交互系统

### 8.1 交互定位

方案三锁定的不是新功能，而是新的交互表现方式：

- 更薄的 chrome
- 更安静的阅读面
- 更轻的工具位
- 更主流的 sheet / rail / pill 语义
- 更接近高质量 iPhone 内容应用的单页秩序

### 8.2 全局交互规则

1. **主操作优先固定位置**
   - 保存、生成、归档等主操作优先放在底部操作轨道或明确主按钮位。
   - 不把主操作散落在多个等权按钮里。

2. **次操作工具化**
   - 编辑、删除、分享、返回属于工具位。
   - 它们应该轻量、明确、不会抢正文。

3. **筛选与选择胶囊化**
   - 人物、日期、范围、模式等入口统一做成更薄的 pill / compact picker。
   - 不再使用厚重的大块选择器。

4. **详情页阅读优先**
   - 长文和详情页优先保证阅读体验。
   - 工具操作靠边，正文占主导。

5. **列表页节奏优先**
   - 时间线和档案袋列表依赖纵向节奏、日期标题、元信息轻量化。
   - 列表卡不应成为一块块厚重白砖。

6. **状态通过层级表达**
   - 激活、选中、编辑中、加载中优先通过位置、边框、锚点色和轻材质来表达。
   - 不靠夸张色块或复杂动画。

### 8.3 动效建议

正式业务页面允许增加微动效，但只做 iPhone 风格的轻动效：

- press / hover：`120–180ms`
- 面板进入：`180–240ms`
- 列表卡渐入：`160–220ms`
- easing：偏 `ease-out`

动效目标是提升质感，不是制造存在感。

---

## 9. 页面级实现蓝图

本节是正式落地时最重要的部分。

### 9.1 `QuickEntry` · Joy 记录页

#### 要保留的功能

- 上传图片
- 选人物
- 选日期
- 记录 moment
- 记录 reason
- 保存
- 进入 Cloudy

#### 方案三落地方式

- 顶栏收薄，右侧 `进入小烦恼` 变成轻工具胶囊，不再像厚按钮。
- 欢迎语与引导语改成短 editorial intro，不再做大块头部色板。
- 图片上传区从“主视觉巨卡”降级为“内容型媒体位”，仍保留入口和状态。
- 人物与日期并排变成薄胶囊选择器。
- 两个输入区采用纸感分段，不用厚重面板。
- 保存按钮进入底部操作轨道，成为页面唯一明确主动作。

#### 视觉目标

- 让记录动作更像“落下一段内容”，而不是“填写一个表单”。

### 9.2 `QuickEntry` · Cloudy 记录页

#### 要保留的功能

- Cloudy 文本输入
- 日期
- 返回 Joy
- 放入档案袋
- AI 回信相关状态

#### 方案三落地方式

- Cloudy 页面从“整页紫底”改成“冷调纸页 + 雾面层级”。
- 引导语放进纸感前言区域，减少压迫感。
- 输入区像一张安静铺开的纸，不像大型对话框。
- `放入档案袋` 固定为底部主操作轨道。
- 回到 Joy 使用轻工具胶囊，不与主操作同权。

#### 视觉目标

- 感觉像“被收纳和承接”，不是“进入另一种强烈主题色页面”。

### 9.3 `TimelineView` · 时间线

#### 要保留的功能

- 按人物筛选
- 按时间范围筛选
- AI 总结入口
- Cloudy 档案袋入口
- 打开事件详情

#### 方案三落地方式

- 筛选区做成更薄的 editorial filter rail。
- `AI 总结` 和 `档案袋` 变成两种层级明确的行动条，不再像厚实体按钮。
- 日期标题更像章节分隔。
- 列表卡改成“缩略图 + 标题 + 一段摘要 + 时间”的轻信息卡。
- 卡片留白增加，但总体高度降低。

#### 视觉目标

- 更像日签与记忆摘要流，不像厚卡片流。

### 9.4 `InsightView` · AI 总结

#### 要保留的功能

- 人物和时间筛选
- 生成总结
- 展示情绪天气
- 展示关键词
- 展示人格画像
- 展示建议
- 分享

#### 方案三落地方式

- 开头改成专题页前言，不再像多个业务模块堆叠。
- 生成按钮保留，但主按钮体量收紧。
- 情绪天气保留重点地位，但视觉上更像文章封面信息块。
- 关键词减少彩虹糖感，改为统一秩序下的轻标签。
- 建议卡更像阅读卡片，不像功能卡。
- 分享按钮归入结尾工具区。

#### 视觉目标

- 像一页高质量疗愈报告，而不是“AI 面板集合”。

### 9.5 `ProfileView` · 个人中心

#### 要保留的功能

- 查看头像
- 上传头像
- 查看和编辑昵称
- 查看邮箱
- 刷新应用
- 退出登录

#### 方案三落地方式

- 个人中心从“大面板设置页”调整为“个人档案卡 + 轻设置动作”。
- 头像、昵称、邮箱形成主档案区。
- 编辑按钮变轻工具动作，但依旧明确。
- 刷新与退出作为独立行动区，层级弱于主档案区。

#### 视觉目标

- 更像个人卡片档案，而不是工具页。

### 9.6 `CloudyArchiveView` · 档案袋

#### 要保留的功能

- 列表浏览
- 查看回信
- 重试失败项
- 删除

#### 方案三落地方式

- 页面整体转为冷调纸册感。
- 顶部说明像档案卷宗前言。
- 日期标题和状态 pill 更薄、更克制。
- 查看回信入口更内敛，避免抢正文。
- 删除模式保留，但视觉上工具化，不再大声警告式存在。

#### 视觉目标

- 像一本被整理好的安静档案册。

### 9.7 `Healing Letter` · Cloudy 回信详情

#### 要保留的功能

- 长文阅读
- 回到上级
- 可能存在的底部引导动作

#### 方案三落地方式

- 强化 editorial 长文布局。
- 标题、正文、段落、留白都按阅读优先重新组织。
- 卡片数量减少，更多依靠段落和纸感 section 形成秩序。
- 工具按钮薄化并固定在阅读不受打扰的位置。

#### 视觉目标

- 这是方案三的品牌记忆页之一，必须有沉浸感。

### 9.8 `EventDetailView` / `EventDetailPanel` · Joy 详情页

#### 要保留的功能

- 返回
- 编辑
- 删除
- 查看图片 / 人物 / 日期 / 内容 / 感悟

#### 方案三落地方式

- 详情页改为阅读优先的内容页。
- 图片保留，但不再让厚卡片包裹所有内容。
- 人物、日期等元信息轻量化。
- 编辑和删除退到工具位。
- 内容与感悟采用 editorial section 组织。

#### 视觉目标

- 更像一篇私人记录页，而不是一张大卡片详情。

---

## 10. 共用组件重构规范

### 10.1 `AppTopBar`

- 更薄
- 材质更轻
- 标题更稳
- 左右工具位统一尺寸和圆角
- Joy / Cloudy 只通过轻微气候差异区分，不改结构

### 10.2 `AppBottomNav`

- 始终固定
- 高度统一
- 背景保持半浮层质感
- 激活态依赖锚点色与轻底色，不使用夸张块面
- 各 tab 视觉重量一致

### 10.3 `TimelineFilters`

- 过滤器控件统一窄胶囊
- 预设时间范围更细
- 自定义日期不再显得像大型表单块

### 10.4 `AppDatePicker`

- 维持当前逻辑
- 改为更轻的 iPhone 风格选择器视觉
- 输入位与图标比例要缩小

### 10.5 `AutoGrowTextarea`

- 保留自动增长逻辑
- 视觉上更像纸感输入区
- focus 态只使用轻边框 + 轻阴影 + 锚点色，不用重描边

### 10.6 `CloudyLetterCard`

- 保留内容逻辑与 emphasis 逻辑
- Cloudy 场景下改为更轻、更可读、更分段的长文纸页

---

## 11. 正式实施时的文件改造范围

后续真实落地时，优先修改以下文件：

- `src/components/AppTopBar.tsx`
- `src/components/AppBottomNav.tsx`
- `src/components/TimelineFilters.tsx`
- `src/components/AppDatePicker.tsx`
- `src/components/AutoGrowTextarea.tsx`
- `src/components/QuickEntry.tsx`
- `src/components/TimelineView.tsx`
- `src/components/InsightView.tsx`
- `src/components/ProfileView.tsx`
- `src/components/CloudyArchiveView.tsx`
- `src/components/CloudyLetterCard.tsx`
- `src/components/EventDetailView.tsx`
- `src/components/EventDetailPanel.tsx`

如果需要新增纯展示层 token 或样式辅助文件，可以新增，但必须满足：

- 不搬动业务逻辑
- 不改事件处理函数语义
- 不破坏现有 props 契约

---

## 12. 实施顺序

下一轮正式落地建议按以下顺序进行：

1. 先统一壳层规则  
   `AppTopBar / AppBottomNav / app shell / content viewport / fixed height`

2. 再统一输入与筛选组件  
   `TimelineFilters / AppDatePicker / AutoGrowTextarea`

3. 再重做一级页面  
   `QuickEntry / TimelineView / InsightView / ProfileView`

4. 最后重做二级阅读与档案页面  
   `CloudyArchiveView / CloudyLetterCard / EventDetailView / EventDetailPanel`

这样风险最低，因为先统一底层壳，再做页面，最后做细节页。

---

## 13. 验收标准

正式业务页面优化完成后，必须满足以下标准：

### 13.1 行为标准

- 所有原功能保持可用
- 所有按钮仍去原目标
- 所有编辑、删除、生成、归档逻辑不变

### 13.2 视觉标准

- Joy 与 Cloudy 一眼可分
- 不再出现旧版大面积紫底
- 每个页面更薄、更精致、更像 iPhone 内容应用
- 顶栏、卡片、选择器、底栏整体密度统一
- 所有页面高度一致

### 13.3 体验标准

- 页面更安静
- 阅读页更高级
- 主次动作更清楚
- 筛选、选择、编辑的表现更主流、更有效
- 不会因为“好看”而破坏操作效率

---

## 14. 新对话交接说明

如果在新对话中继续正式落地，直接遵守下面这组说明，不需要重新发散方案：

1. 目标已经确定：正式页面落地 `方案三`
2. 方案三指：`Pearl Dawn` 详细预览页中的 `方向 C / Editorial Focus / Rose Slate`
3. 不做方案比较，不再回到 A/B/C 竞稿阶段
4. 只改前端表现，不改功能
5. 所有页面固定同一手机高度
6. Joy 暖亮，Cloudy 冷静收束
7. 主压色固定为 `#4B352D`
8. 所有实现优先参考预览页，再按本文档细化
9. 长文页和详情页必须以阅读体验优先
10. 如果有歧义，默认选择更薄、更克制、更 editorial 的实现方式

---

## 15. 参考标准与外部依据

后续正式实现时，审美与交互依据统一来自以下来源：

### 15.1 Apple 官方规范

- Apple iPhone 17 Pro 规格页  
  `https://www.apple.com/iphone-17-pro/`

- Apple Design 总入口  
  `https://developer.apple.com/design/`

- Apple Human Interface Guidelines · Designing for iOS  
  `https://developer.apple.com/design/human-interface-guidelines/designing-for-ios`

- Apple Developer · Adopting Liquid Glass  
  `https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass`

### 15.2 当前流行设计参考

- Apple Design Awards 2025  
  `https://developer.apple.com/jp/design/awards/?cid=wwdc25-ada`

- Figma Design 频道  
  `https://www.figma.com/blog/design/`

这些来源在本项目中的使用方式不是照搬界面，而是抽取以下共性：

- 更薄的系统 chrome
- 更少但更准的重点色
- 更强的内容秩序
- 更轻的浮层与材质感
- 更主流的 pill / sheet / editorial 版式组织

---

## 16. 本文档对应的源码与预览入口

### 16.1 正式业务相关源码

- `src/components/QuickEntry.tsx`
- `src/components/TimelineView.tsx`
- `src/components/InsightView.tsx`
- `src/components/ProfileView.tsx`
- `src/components/CloudyArchiveView.tsx`
- `src/components/CloudyLetterCard.tsx`
- `src/components/EventDetailView.tsx`
- `src/components/EventDetailPanel.tsx`

### 16.2 方案三预览相关源码

- `src/app/preview/palette-systems/pearl-dawn/page.tsx`
- `src/components/preview/PearlDawnDetailedPreview.tsx`
- `src/components/preview/PearlDawnDetailedPreview.module.css`
- `src/components/preview/palette-system-data.ts`

---

## 17. 结论

后续正式落地不再需要重新讨论“选哪套方案”。

现在的唯一目标是：

在保持现有业务功能完全不变的前提下，把真实业务页面改造成：

- 方案三的视觉气候
- 方案三的 editorial 交互表达
- iPhone 17 Pro 级的固定画布秩序
- 更高级、更透气、更精致的移动端内容产品

后续实现时，只要严格遵守本文档、对照预览页，并保留现有功能语义，就可以直接进入页面优化阶段。
