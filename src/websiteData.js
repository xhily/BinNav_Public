// 网站数据 - 通过管理后台更新于 2025/7/5 13:17:32
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
    "icon": "https://icons.duckduckgo.com/ip3/nbvil.com.ico"
  },
  {
    "id": 1751598590526,
    "name": "YouTube频道",
    "description": "作者YouTube频道，定期上传视频教程",
    "url": "https://www.youtube.com/@nbvil.sindri",
    "category": "author",
    "tags": [
      "视频"
    ],
    "icon": "https://www.google.com/s2/favicons?domain=www.youtube.com&sz=32"
  },
  {
    "id": 41,
    "name": "GitHub Projects",
    "description": "作者开源项目",
    "url": "https://github.com/sindricn",
    "category": "author",
    "tags": [
      "开源项目"
    ],
    "icon": "https://www.google.com/s2/favicons?domain=github.com&sz=32"
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
    "icon": "https://www.google.com/s2/favicons?domain=bilibili.com&sz=32"
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
    "icon": "https://www.google.com/s2/favicons?domain=www.zhihu.com&sz=32"
  },
  {
    "id": 1751617129171,
    "name": "Cloudflare",
    "description": "Cloudflare以向客户提供网站安全管理、性能优化及相关的技术支持为主要业务。",
    "url": "https://www.cloudflare.com/",
    "category": "recommended",
    "tags": [
      "免费",
      "网站",
      "CDN",
      "DDOS"
    ],
    "icon": "https://www.google.com/s2/favicons?domain=cloudflare.com&sz=32"
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
    "icon": "https://www.google.com/s2/favicons?domain=code.visualstudio.com&sz=32",
    "popularity": 93
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
    "icon": "/assets/network_icon.png",
    "special": false,
    "subcategories": []
  },
  {
    "id": "dev_tools",
    "name": "开发工具",
    "icon": "/assets/innovation_icon.png",
    "special": false,
    "subcategories": []
  },
  {
    "id": "friend_links",
    "name": "友情链接",
    "icon": "/assets/social_icon.png",
    "special": false,
    "subcategories": []
  }
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
  lastUpdated: "2025-07-05"
};
