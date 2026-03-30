export type PaletteSystem = {
  appBg: string;
  topBarBg: string;
  topBarBorder: string;
  panelBg: string;
  panelAltBg: string;
  cardBg: string;
  cardSoftBg: string;
  anchor: string;
  anchorSoft: string;
  anchorContrast: string;
  joyAccent: string;
  joyAccentSoft: string;
  joySurface: string;
  joyHighlight: string;
  cloudyAccent: string;
  cloudyAccentSoft: string;
  cloudySurface: string;
  cloudyHighlight: string;
  navBg: string;
  navActiveBg: string;
  focusRing: string;
  textStrong: string;
  textMuted: string;
  borderSoft: string;
  shadowColor: string;
};

export type ScreenBlueprintId =
  | "joy-entry"
  | "cloudy-entry"
  | "timeline"
  | "insight"
  | "profile"
  | "cloudy-archive"
  | "healing-letter"
  | "joy-detail";

export type ScreenBlueprint = {
  id: ScreenBlueprintId;
  title: string;
  tone: "joy" | "cloudy" | "shared";
  summary: string;
  densityNote: string;
};

export type PalettePreviewSpec = {
  id: string;
  name: string;
  subtitle: string;
  direction: string;
  contrastNote: string;
  referenceLabel?: string;
  detailRouteSlug?: string;
  palette: PaletteSystem;
  screens: ScreenBlueprint[];
};

export type PhoneCanvasSpec = {
  id: string;
  width: number;
  height: number;
  safeTop: number;
  safeSide: number;
  safeBottom: number;
};

export type DetailedScreenSpec = ScreenBlueprint & {
  topBarAction: string;
  primaryAction: string;
  secondaryActions: string;
  linkFlow: string;
  interactionPattern: string;
  staticCue: string;
};

export type PearlDawnDetailedDirectionSpec = {
  id: string;
  name: string;
  interactionName: string;
  interactionSummary: string;
  colorName: string;
  colorSummary: string;
  emphasis: string;
  palette: PaletteSystem;
  guidelines: Array<{
    title: string;
    body: string;
  }>;
  screens: DetailedScreenSpec[];
};

export const iphone17ProCanvasSpec: PhoneCanvasSpec = {
  id: "iphone-17-pro",
  width: 402,
  height: 874,
  safeTop: 59,
  safeSide: 14,
  safeBottom: 34,
};

export const screenBlueprints: ScreenBlueprint[] = [
  {
    id: "joy-entry",
    title: "Joy 记录页",
    tone: "joy",
    summary: "更薄的欢迎卡、问题卡与输入面板，保留原功能入口。",
    densityNote: "顶部、输入区和底部主操作轨道整体收紧，更像精致原生应用。",
  },
  {
    id: "cloudy-entry",
    title: "Cloudy 记录页",
    tone: "cloudy",
    summary: "把旧版大面积情绪底板改成包裹型冷静气候。",
    densityNote: "日期、引导语、文本区和主操作按钮统一缩小 12%–20%。",
  },
  {
    id: "timeline",
    title: "时间线列表页",
    tone: "shared",
    summary: "筛选条更细，列表卡更短，纵向节奏更轻。",
    densityNote: "缩略图、标题、时间信息全部更紧凑，避免旧版卡片过厚。",
  },
  {
    id: "insight",
    title: "AI 总结页",
    tone: "joy",
    summary: "保留总结、关键词、建议结构，但去掉厚重块面。",
    densityNote: "模块层级更薄，重点内容由主压色和卡片光感来组织。",
  },
  {
    id: "profile",
    title: "个人中心页",
    tone: "shared",
    summary: "头像卡、邮箱区、刷新与退出更像轻量 iPhone 面板。",
    densityNote: "按钮与信息卡体量统一下调，形成原生设置页秩序。",
  },
  {
    id: "cloudy-archive",
    title: "Cloudy 档案袋",
    tone: "cloudy",
    summary: "让档案袋像轻冷色纸页，而不是大片紫色画布。",
    densityNote: "日期标题与归档卡更薄更整洁，强化“收纳感”而非“压迫感”。",
  },
  {
    id: "healing-letter",
    title: "Healing Letter",
    tone: "cloudy",
    summary: "信件页改成更轻的纸感分段结构，阅读压力更低。",
    densityNote: "段落容器更短，标题与正文呼吸更充分。",
  },
  {
    id: "joy-detail",
    title: "Joy 详情页",
    tone: "joy",
    summary: "图片区、元信息、感悟区都保留，但换成更纤细的卡片组织。",
    densityNote: "内容卡从厚面板改为薄层叠，提升高级感与透气感。",
  },
];

function createPalette(input: Partial<PaletteSystem> & {
  appBg: string;
  joyAccent: string;
  joyAccentSoft: string;
  cloudyAccent: string;
  cloudyAccentSoft: string;
  anchor: string;
  textStrong: string;
  textMuted: string;
}) {
  return {
    topBarBg: "rgba(255, 250, 246, 0.88)",
    topBarBorder: "rgba(121, 93, 78, 0.14)",
    panelBg: "rgba(255, 251, 248, 0.9)",
    panelAltBg: "rgba(247, 240, 235, 0.9)",
    cardBg: "rgba(255, 253, 250, 0.94)",
    cardSoftBg: "rgba(248, 241, 236, 0.92)",
    anchorSoft: "rgba(75, 53, 45, 0.1)",
    anchorContrast: "#fffaf6",
    joySurface: "rgba(255, 250, 244, 0.96)",
    joyHighlight: "rgba(245, 229, 208, 0.98)",
    cloudySurface: "rgba(244, 247, 249, 0.96)",
    cloudyHighlight: "rgba(223, 231, 236, 0.96)",
    navBg: "rgba(255, 250, 247, 0.94)",
    navActiveBg: "rgba(75, 53, 45, 0.12)",
    focusRing: "rgba(75, 53, 45, 0.16)",
    borderSoft: "rgba(121, 93, 78, 0.14)",
    shadowColor: "rgba(83, 57, 47, 0.16)",
    ...input,
  } satisfies PaletteSystem;
}

const creamAirPalette = createPalette({
  appBg: "#f7f1e6",
  anchor: "#5c4738",
  joyAccent: "#d7aa72",
  joyAccentSoft: "#f7e4c9",
  cloudyAccent: "#90b8c4",
  cloudyAccentSoft: "#dfeef2",
  joySurface: "rgba(255, 249, 241, 0.96)",
  joyHighlight: "rgba(250, 235, 207, 0.98)",
  cloudySurface: "rgba(239, 246, 249, 0.96)",
  cloudyHighlight: "rgba(215, 231, 236, 0.98)",
  textStrong: "#362b25",
  textMuted: "#7d6d62",
});

const pearlDawnPalette = createPalette({
  appBg: "#f4ece6",
  anchor: "#4b352d",
  anchorSoft: "rgba(75, 53, 45, 0.11)",
  anchorContrast: "#fff8f4",
  topBarBg: "rgba(252, 246, 240, 0.9)",
  topBarBorder: "rgba(126, 97, 82, 0.16)",
  panelBg: "rgba(255, 250, 246, 0.92)",
  panelAltBg: "rgba(247, 239, 233, 0.92)",
  cardBg: "rgba(255, 252, 248, 0.96)",
  cardSoftBg: "rgba(247, 239, 233, 0.9)",
  joyAccent: "#c9935f",
  joyAccentSoft: "#f1ddc8",
  joySurface: "rgba(255, 249, 244, 0.97)",
  joyHighlight: "rgba(246, 228, 201, 0.98)",
  cloudyAccent: "#8ea4b3",
  cloudyAccentSoft: "#dfe7ec",
  cloudySurface: "rgba(243, 246, 249, 0.98)",
  cloudyHighlight: "rgba(220, 229, 236, 0.98)",
  navBg: "rgba(255, 249, 245, 0.95)",
  navActiveBg: "rgba(75, 53, 45, 0.13)",
  focusRing: "rgba(75, 53, 45, 0.18)",
  textStrong: "#332824",
  textMuted: "#71635d",
  borderSoft: "rgba(126, 97, 82, 0.16)",
  shadowColor: "rgba(88, 61, 48, 0.18)",
});

const sageLightPalette = createPalette({
  appBg: "#edf0e9",
  anchor: "#41503e",
  joyAccent: "#95a97f",
  joyAccentSoft: "#dde6d3",
  cloudyAccent: "#9aac9f",
  cloudyAccentSoft: "#dde4dd",
  joySurface: "rgba(248, 250, 245, 0.96)",
  joyHighlight: "rgba(228, 236, 217, 0.98)",
  cloudySurface: "rgba(241, 245, 241, 0.97)",
  cloudyHighlight: "rgba(220, 227, 220, 0.98)",
  navActiveBg: "rgba(65, 80, 62, 0.12)",
  focusRing: "rgba(65, 80, 62, 0.16)",
  textStrong: "#2d352b",
  textMuted: "#677164",
  borderSoft: "rgba(114, 128, 108, 0.14)",
  shadowColor: "rgba(62, 78, 58, 0.14)",
});

const lakeMistPalette = createPalette({
  appBg: "#edf3f5",
  anchor: "#31424b",
  joyAccent: "#87b7c5",
  joyAccentSoft: "#d8eaf0",
  cloudyAccent: "#91a8b6",
  cloudyAccentSoft: "#dce6ec",
  joySurface: "rgba(245, 250, 252, 0.97)",
  joyHighlight: "rgba(220, 236, 242, 0.98)",
  cloudySurface: "rgba(240, 246, 249, 0.97)",
  cloudyHighlight: "rgba(217, 229, 236, 0.98)",
  navActiveBg: "rgba(49, 66, 75, 0.12)",
  focusRing: "rgba(49, 66, 75, 0.16)",
  textStrong: "#2b353a",
  textMuted: "#64747b",
  borderSoft: "rgba(102, 123, 133, 0.16)",
  shadowColor: "rgba(59, 82, 94, 0.16)",
});

const roseSandPalette = createPalette({
  appBg: "#f6ece6",
  anchor: "#4f342d",
  joyAccent: "#c88567",
  joyAccentSoft: "#f2d9cf",
  cloudyAccent: "#9d8a95",
  cloudyAccentSoft: "#e6dce1",
  joySurface: "rgba(255, 248, 244, 0.97)",
  joyHighlight: "rgba(247, 225, 216, 0.98)",
  cloudySurface: "rgba(245, 241, 244, 0.97)",
  cloudyHighlight: "rgba(228, 220, 226, 0.98)",
  navActiveBg: "rgba(79, 52, 45, 0.12)",
  focusRing: "rgba(79, 52, 45, 0.17)",
  textStrong: "#342625",
  textMuted: "#75615d",
  borderSoft: "rgba(127, 94, 86, 0.15)",
  shadowColor: "rgba(89, 60, 57, 0.16)",
});

export const paletteSystemsPreviewSpec: PalettePreviewSpec[] = [
  {
    id: "cream-air",
    name: "A. Cream Air",
    subtitle: "参考图主导；奶油底、雾蓝卡、浅杏按钮，最轻最细。",
    direction: "借鉴参考图的奶油底、轻雾感和更精致的结构比例。",
    contrastNote: "小美好偏奶油杏光，小烦恼偏雾蓝灰米。",
    referenceLabel: "参考图气质方案",
    palette: creamAirPalette,
    screens: screenBlueprints.map((screen) => ({ ...screen })),
  },
  {
    id: "pearl-dawn",
    name: "B. Pearl Dawn",
    subtitle: "香槟米、珍珠白、深可可棕主压色，整体更有高级感与秩序。",
    direction: "以深可可棕压住层级，让暖亮与冷静都落在同一高端骨架里。",
    contrastNote: "小美好偏香槟杏金，小烦恼偏雾蓝灰纸感，区别清楚但不割裂。",
    detailRouteSlug: "pearl-dawn",
    palette: pearlDawnPalette,
    screens: screenBlueprints.map((screen) => ({ ...screen })),
  },
  {
    id: "sage-light",
    name: "C. Sage Light",
    subtitle: "燕麦白、鼠尾草、温苔绿，更安静、更疗愈。",
    direction: "用植物气息替代旧版偏黄与偏紫的冲突关系。",
    contrastNote: "小美好偏柔苔绿，小烦恼偏鼠尾草冷灰。",
    palette: sageLightPalette,
    screens: screenBlueprints.map((screen) => ({ ...screen })),
  },
  {
    id: "lake-mist",
    name: "D. Lake Mist",
    subtitle: "象牙白、湖雾蓝、银沙灰，最接近 iOS 原生轻感。",
    direction: "整体最克制，强调透气和原生式秩序。",
    contrastNote: "小美好偏清晨湖蓝，小烦恼偏石板雾灰。",
    palette: lakeMistPalette,
    screens: screenBlueprints.map((screen) => ({ ...screen })),
  },
  {
    id: "rose-sand",
    name: "E. Rose Sand",
    subtitle: "暖白沙、玫瑰米、焦糖铜，保留温度但更精致。",
    direction: "更有品牌记忆点，但依然避开厚重和俗气的暖粉调。",
    contrastNote: "小美好偏柔杏玫瑰，小烦恼偏冷灰玫紫。",
    palette: roseSandPalette,
    screens: screenBlueprints.map((screen) => ({ ...screen })),
  },
];

const baseDetailedScreenMeta: Record<
  ScreenBlueprintId,
  Omit<DetailedScreenSpec, keyof ScreenBlueprint | "interactionPattern" | "staticCue">
> = {
  "joy-entry": {
    topBarAction: "右上切换到小烦恼；保留品牌标题与轻提示。",
    primaryAction: "底部主操作轨道：保存到小美好。",
    secondaryActions: "人物胶囊、日期胶囊、图片入口。",
    linkFlow: "右上按钮 -> Cloudy 记录页；底栏 -> 日志/社区/个人中心。",
  },
  "cloudy-entry": {
    topBarAction: "左上返回小美好；右侧仅保留帮助型轻动作。",
    primaryAction: "底部主操作轨道：放入档案袋。",
    secondaryActions: "日期胶囊、语气提示、静态 sheet 入口。",
    linkFlow: "主按钮 -> Cloudy 档案袋；返回按钮 -> Joy 记录页。",
  },
  timeline: {
    topBarAction: "顶栏只保留标题与轻量功能点，不叠加厚按钮。",
    primaryAction: "主按钮是 AI 总结；次主按钮是档案袋入口。",
    secondaryActions: "人物筛选、时间范围、起止日期。",
    linkFlow: "列表卡 -> Joy 详情；档案袋按钮 -> Cloudy 档案袋；AI 按钮 -> AI 总结。",
  },
  insight: {
    topBarAction: "顶栏显示 AI 视图身份，不抢主内容。",
    primaryAction: "生成总结 / 保存分享 保持同一主按钮语言。",
    secondaryActions: "人物筛选、时间范围、轻分享提示。",
    linkFlow: "底栏可回到首页/日志/社区/个人中心；分享保持静态表达。",
  },
  profile: {
    topBarAction: "编辑在右上主位；刷新和退出位于内容区。",
    primaryAction: "编辑/保存为同一主按钮位切换。",
    secondaryActions: "头像更换、邮箱信息、刷新系统版本。",
    linkFlow: "底栏维持全局切换；不新增新的业务入口。",
  },
  "cloudy-archive": {
    topBarAction: "返回和删除模式控制置于顶栏，形成二级视图秩序。",
    primaryAction: "查看回信作为列表卡主动作；删除为危险次动作。",
    secondaryActions: "日期与状态胶囊；失败态保留重试位。",
    linkFlow: "归档卡 -> Healing Letter；返回 -> 时间线。",
  },
  "healing-letter": {
    topBarAction: "返回与编辑/收藏保持轻工具位，不打断阅读。",
    primaryAction: "本页弱化 CTA，强调阅读和记录引导。",
    secondaryActions: "段落导航、标注、静态阅读辅助。",
    linkFlow: "返回 -> Cloudy 档案袋；文末记录引导 -> Joy 记录页。",
  },
  "joy-detail": {
    topBarAction: "返回、编辑、删除保持顶部动作组一致。",
    primaryAction: "编辑保存是主动作；删除为危险动作。",
    secondaryActions: "人物、日期、图片替换与 AI 微光分组。",
    linkFlow: "返回 -> 时间线；编辑仍停留本页；底栏回到主视图。",
  },
};

function createDetailedScreens(
  interactionPattern: string,
  staticCueByScreen: Record<ScreenBlueprintId, string>,
): DetailedScreenSpec[] {
  return screenBlueprints.map((screen) => ({
    ...screen,
    ...baseDetailedScreenMeta[screen.id],
    interactionPattern,
    staticCue: staticCueByScreen[screen.id],
  }));
}

export const pearlDawnDetailedPreviewSpec: PearlDawnDetailedDirectionSpec[] = [
  {
    id: "compact-card-stack",
    name: "方向 A",
    interactionName: "交互 A · Compact Card Stack",
    interactionSummary:
      "轻顶栏、紧凑卡片、细胶囊筛选与底部主操作轨道，让记录效率和精致感同时成立。",
    colorName: "配色 1 · Pearl Glow",
    colorSummary:
      "深可可棕压住标题、按钮和激活态；Joy 走香槟杏金，Cloudy 走雾蓝灰纸感。",
    emphasis: "适合做主推版本：结构最清晰，视觉最稳，最适合先定主方向。",
    palette: pearlDawnPalette,
    guidelines: [
      {
        title: "顶栏规则",
        body: "所有顶栏统一使用薄玻璃层 + 深可可棕文字，控制重量，不再用厚按钮堆叠。",
      },
      {
        title: "按钮规则",
        body: "主按钮统一落在底部轨道，次按钮改用细胶囊；危险动作始终降低饱和度。",
      },
      {
        title: "Joy / Cloudy 分色",
        body: "Joy 使用暖香槟和杏金高光；Cloudy 使用雾蓝灰与珍珠冷白，靠气候区分情绪。",
      },
    ],
    screens: createDetailedScreens("轻顶栏 + 紧凑卡片 + 底部主操作轨道", {
      "joy-entry": "欢迎卡和每日一问都更薄，主按钮压在底部，整体像高端 journaling app。",
      "cloudy-entry": "文本区被冷静纸感卡片包裹，不再整页染色。",
      timeline: "筛选、AI 总结、档案袋按同一节奏下沉，列表卡强调效率阅读。",
      insight: "重点内容分成薄层级卡片，由主压色控制视线停留点。",
      profile: "信息区更像 iPhone 设置页的精致卡组，不再空旷。",
      "cloudy-archive": "归档列表更薄更静，回信入口被控制在统一主按钮语言里。",
      "healing-letter": "阅读页以轻分段承载长文，避免重面板压迫。",
      "joy-detail": "图片、元信息、感悟和 AI 微光保持清晰分层。",
    }),
  },
  {
    id: "layered-sheet-flow",
    name: "方向 B",
    interactionName: "交互 B · Layered Sheet Flow",
    interactionSummary:
      "把人物、日期、图片、二级操作都表现为更轻的 sheet / drawer 语义，强调包裹感与层级。",
    colorName: "配色 2 · Cocoa Mist",
    colorSummary:
      "以深可可棕稳定品牌秩序，Joy 更暖奶油，Cloudy 更冷石板雾蓝，区分最清晰。",
    emphasis: "适合小烦恼线：层级更现代，更像 2026 年流行的柔性 sheet 交互。",
    palette: createPalette({
      ...pearlDawnPalette,
      appBg: "#f2ebe5",
      joyAccent: "#bf8a56",
      joyAccentSoft: "#f0dcc7",
      joyHighlight: "rgba(245, 225, 196, 0.98)",
      cloudyAccent: "#7f98a8",
      cloudyAccentSoft: "#d9e3e9",
      cloudySurface: "rgba(240, 245, 248, 0.98)",
      cloudyHighlight: "rgba(214, 226, 234, 0.98)",
    }),
    guidelines: [
      {
        title: "层级规则",
        body: "二级动作全部使用半浮层或抽屉语义，页面主画布保持干净。",
      },
      {
        title: "拇指区规则",
        body: "主操作更靠近底部安全区，人物/日期/媒体操作更靠近输入上下文。",
      },
      {
        title: "Cloudy 语言",
        body: "Cloudy 页面优先使用雾蓝灰 sheet 与冷调卡片，强调“放下、安放、回收”。",
      },
    ],
    screens: createDetailedScreens("浮层胶囊 + sheet 语义 + 主操作贴近拇指区", {
      "joy-entry": "人物、日期和图片入口被做成轻 sheet 提示，输入更聚焦。",
      "cloudy-entry": "底部主操作和辅助语都像半展开 drawer，安定感更强。",
      timeline: "筛选条和 AI / 档案袋入口都像轻浮层，而不是厚按钮。",
      insight: "总结生成与分享是两级操作关系，主次更清楚。",
      profile: "编辑头像、姓名、刷新都被组织成更现代的面板式静态布局。",
      "cloudy-archive": "回信详情像从列表中拉出的一层轻纸页。",
      "healing-letter": "阅读页底部引导像沉底操作轨道，减少打断。",
      "joy-detail": "编辑控件被视作内容上的二级浮层，而不是生硬的大工具条。",
    }),
  },
  {
    id: "editorial-focus",
    name: "方向 C",
    interactionName: "交互 C · Editorial Focus",
    interactionSummary:
      "顶栏更薄、阅读面更安静，详情页和信件页更像高端 editorial 产品的沉浸版式。",
    colorName: "配色 3 · Rose Slate",
    colorSummary:
      "深可可棕维持锚点，Joy 带一点玫瑰杏温度，Cloudy 走灰紫石板与云雾白，情绪张力更强。",
    emphasis: "适合详情与长文页：更高级、更有故事感，但依旧不改功能语义。",
    palette: createPalette({
      ...pearlDawnPalette,
      appBg: "#f5ece8",
      joyAccent: "#c17f66",
      joyAccentSoft: "#f1d8d0",
      joyHighlight: "rgba(245, 221, 213, 0.98)",
      cloudyAccent: "#8f8595",
      cloudyAccentSoft: "#e3dde5",
      cloudySurface: "rgba(245, 242, 246, 0.98)",
      cloudyHighlight: "rgba(226, 220, 230, 0.98)",
    }),
    guidelines: [
      {
        title: "版式规则",
        body: "标题、正文、分段留白像杂志排版，卡片数量减少，但节奏更高级。",
      },
      {
        title: "工具位规则",
        body: "返回、编辑、分享都缩成轻工具位，不与正文争夺注意力。",
      },
      {
        title: "情绪分色",
        body: "Joy 用玫瑰杏和柔金做温度层；Cloudy 用灰紫石板和雾白做收束层。",
      },
    ],
    screens: createDetailedScreens("薄 chrome + 纸感分段 + 阅读优先工具位", {
      "joy-entry": "欢迎和问题区更像一页短 editorial intro，减少组件感。",
      "cloudy-entry": "输入页像一张静静铺开的纸，帮助情绪下沉。",
      timeline: "列表卡更像日签摘要，主标题和时间的节奏被重新整理。",
      insight: "AI 报告更像一页专题摘要，重点由排版和锚点色控制。",
      profile: "资料页不再像操作面板，而更像个人卡片档案。",
      "cloudy-archive": "档案袋像一本冷调纸册，回信入口更克制。",
      "healing-letter": "长文页获得最强沉浸感，适合做品牌记忆点。",
      "joy-detail": "详情页强调图片与文字之间的留白关系，整体更高级。",
    }),
  },
];
