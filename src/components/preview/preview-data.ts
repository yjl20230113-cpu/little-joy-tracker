import type { LucideIcon } from "lucide-react";
import {
  BookHeart,
  Compass,
  Footprints,
  NotebookPen,
  Orbit,
  Pencil,
  Quote,
  Search,
  SmilePlus,
  Sparkles,
  UserRound,
} from "lucide-react";

export type PreviewNavItem = {
  id: "today" | "discover" | "journey" | "profile";
  label: string;
  icon: LucideIcon;
};

export type PreviewFeatureCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  icon: LucideIcon;
  badge?: string;
  accent: "apricot" | "pearl" | "gold";
};

export type PreviewContentCard = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  accent: "sun" | "lavender" | "mint";
};

export type PreviewQuoteCard = {
  title: string;
  content: string;
  source: string;
};

export type TodayPreviewData = {
  greeting: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  hero: {
    title: string;
    description: string;
    cta: string;
    icon: LucideIcon;
  };
  featureCards: PreviewFeatureCard[];
  quote: PreviewQuoteCard;
  recommendations: PreviewContentCard[];
  navItems: PreviewNavItem[];
  fabLabel: string;
};

export const todayPreviewData: TodayPreviewData = {
  greeting: "Hi，今天也要温柔一点。",
  title: "心情驿站",
  subtitle: "把今天的情绪安放成一页轻软、可呼吸的小记录。",
  searchPlaceholder: "搜索今天的心情",
  hero: {
    title: "心情记录",
    description: "与自己相处，释放情绪力量",
    cta: "记录",
    icon: SmilePlus,
  },
  featureCards: [
    {
      id: "three-good-things",
      eyebrow: "能量充电屋",
      title: "每天三件开心事",
      description: "用积极体验给自己充电",
      meta: "单节练习 3分钟",
      icon: Sparkles,
      accent: "apricot",
    },
    {
      id: "gratitude",
      eyebrow: "能量充电屋",
      title: "感恩日记",
      description: "记录陪伴与相遇，收获美好",
      meta: "单节练习 5分钟",
      icon: BookHeart,
      accent: "pearl",
    },
    {
      id: "affirmation",
      eyebrow: "今日推荐",
      title: "自我肯定练习",
      description: "一句轻声提醒，让内心重新站稳",
      meta: "单节练习 4分钟",
      icon: Orbit,
      badge: "NEW",
      accent: "gold",
    },
  ],
  quote: {
    title: "每日一句",
    content:
      "自己的生命依靠其他的生命得以维持，一旦忘记这一点，人就会变得傲慢；一旦记住这一点，人就会重新看见自己与世界之间的温柔连接。",
    source: "《生命与味觉》",
  },
  recommendations: [
    {
      id: "breathing",
      title: "焦虑自助手册",
      subtitle: "用 54321 法，让注意力慢慢落回当下",
      meta: "9分钟",
      accent: "sun",
    },
    {
      id: "boundary",
      title: "高敏感人格必备",
      subtitle: "建立边界感，温和地保护自己的需求",
      meta: "8分钟",
      accent: "lavender",
    },
    {
      id: "journey",
      title: "小旅伴随笔",
      subtitle: "把今天的小发现，写成一句会发光的话",
      meta: "4分钟",
      accent: "mint",
    },
  ],
  navItems: [
    { id: "today", label: "今日", icon: NotebookPen },
    { id: "discover", label: "探索", icon: Compass },
    { id: "journey", label: "足迹", icon: Footprints },
    { id: "profile", label: "我的", icon: UserRound },
  ],
  fabLabel: "新建记录",
};

export const previewIcons = {
  Pencil,
  Quote,
  Search,
};
