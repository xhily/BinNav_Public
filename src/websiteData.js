// 网站数据 - 通过管理后台更新于 2025/7/4 10:42:06
export const websiteData = [
  {
    "id": 40,
    "name": "Newbie Village",
    "description": "二进制博客",
    "url": "https://blog.nbvil.com/",
    "category": "author",
    "tags": [
      "个人博客",
      "教程分享",
      "开发心得"
    ],
    "icon": "/default_icon.png"
  },
  {
    "id": 45,
    "name": "知乎专栏",
    "description": "二进制-知乎",
    "url": "https://www.zhihu.com/people/mrblack-41-9",
    "category": "author",
    "tags": [
      "知乎专栏",
      "技术文章"
    ],
    "icon": "/default_icon.png"
  },
  {
    "id": 1751596898467,
    "name": "B站",
    "description": "作者B站频道，不定期上传视频教程",
    "url": "https://space.bilibili.com/3546865807133625",
    "category": "author",
    "tags": [
      "视频"
    ],
    "icon": "/default_icon.png"
  },
  {
    "id": 41,
    "name": "GitHub Projects",
    "description": "作者开源项目",
    "url": "https://github.com/sindricn",
    "category": "recommended",
    "tags": [
      "开源项目"
    ],
    "icon": "/default_icon.png"
  },
  {
    "id": 33,
    "name": "VS Code",
    "description": "微软开发的代码编辑器",
    "url": "https://code.visualstudio.com",
    "category": "dev_tools",
    "tags": [
      "代码编辑器",
      "开发工具",
      "微软"
    ],
    "icon": "/assets/.png",
    "popularity": 93
  },
  {
    "id": 47,
    "name": "GitHub",
    "description": "全球最大的代码托管平台",
    "url": "https://github.com",
    "category": "friend_links",
    "tags": [
      "代码托管",
      "开源",
      "协作"
    ],
    "icon": "/assets/dev_tools_icon.png",
    "popularity": 95
  }
];

// 分类定义 - 支持二级分类
export const categories = [
  {
    "id": "author",
    "name": "作者专栏",
    "icon": "/assets/tech_blogger_avatar.png",
    "special": true,
    "subcategories": []
  },
  {
    "id": "recommended",
    "name": "常用推荐",
    "icon": "/assets/tools_icon.png",
    "color": "bg-blue-500",
    "subcategories": []
  },
  {
    "id": "design_resources",
    "name": "素材资源",
    "icon": "/assets/tools_icon.png",
    "color": "bg-pink-500",
    "subcategories": []
  },
  {
    "id": "dev_tools",
    "name": "开发工具",
    "icon": "/assets/dev_tools_icon.png",
    "color": "bg-gray-500",
    "subcategories": []
  },
  {
    "id": "friend_links",
    "name": "友情链接",
    "icon": "/assets/network_icon.png",
    "color": "bg-pink-500",
    "subcategories": []
  }
];

// 搜索引擎配置
export const searchEngines = [
  { id: "bing", name: "必应", url: "https://www.bing.com/search?q=", color: "bg-blue-600" },
  { id: "baidu", name: "百度", url: "https://www.baidu.com/s?wd=", color: "bg-red-600" },
  { id: "google", name: "谷歌", url: "https://www.google.com/search?q=", color: "bg-green-600" },
  { id: "internal", name: "站内搜索", url: "", color: "bg-purple-600" }
];

// 推荐内容配置
export const recommendations = [
  {
    id: 1,
    title: "阿里云",
    description: "点击领取2000元限量云产品优惠券",
    url: "https://aliyun.com",
    type: "sponsor",
    color: "from-blue-50 to-blue-100"
  },
  {
    id: 2,
    title: "设计资源",
    description: "高质量设计素材网站推荐",
    url: "#design_resources",
    type: "internal",
    color: "from-green-50 to-green-100"
  }
];

// 热门标签
export const popularTags = [
  "设计工具", "免费素材", "UI设计", "前端开发", "图标库", "配色方案",
  "设计灵感", "原型工具", "代码托管", "学习平台", "社区论坛", "创业资讯"
];

// 网站统计信息
export const siteStats = {
  totalSites: websiteData.length,
  totalCategories: categories.length,
  totalTags: [...new Set(websiteData.flatMap(site => site.tags || []))].length,
  lastUpdated: "2025-07-04"
};
