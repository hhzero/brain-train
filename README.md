# Brain Train 项目

这是一个使用 Next.js 14 构建的现代化前端应用项目。

## 技术栈

- **前端框架**: 
  - Next.js 14.1.0
  - React 18.2.0
  - TypeScript 5.3.3

- **样式和UI**: 
  - TailwindCSS 3.4.1
  - Radix UI 组件库
  - shadcn/ui 设计系统
  - 自定义组件

- **国际化**:
  - next-intl 3.11.3
  - 支持多种语言 (英语、德语、法语、西班牙语、俄语、日语、阿拉伯语、波斯语)

- **功能和工具**:
  - 暗黑模式支持 (next-themes)
  - 图表库 (recharts)
  - 日期处理 (date-fns, react-day-picker)
  - 图标库 (react-icons)

- **开发工具**:
  - ESLint
  - Prettier
  - PostCSS
  - Autoprefixer

## 项目结构

```
brain_train/
├── src/                      # 源代码目录
│   ├── app/                  # 应用主目录
│   │   ├── [locale]/         # 国际化路由
│   │   │   ├── components/    # 页面组件
│   │   │   ├── about/         # 关于页面
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── layout.tsx     # 应用布局
│   │   │   └── globals.css    # 全局样式
│   │   └── icons/            # 图标资源
│   ├── i18n.ts              # 国际化配置
│   ├── middleware.ts        # Next.js 中间件
│   └── navigation.ts        # 导航相关工具
├── lib/                     # 工具库
│   └── utils.ts             # 通用工具函数
├── messages/                # 国际化消息
│   ├── en.json              # 英文翻译
│   ├── de.json              # 德文翻译
│   └── ...                  # 其他语言翻译
├── public/                  # 静态资源
├── components.json          # shadcn/ui 组件配置
├── tailwind.config.ts       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目依赖和脚本
```

## 开发指南

首先，运行开发服务器:

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 项目特点

- 现代化 React 与 Next.js App Router 架构
- 多语言支持与国际化
- 响应式设计
- 黑暗模式/亮色模式切换
- 使用 shadcn/ui 与 Radix UI 的组件系统
- TailwindCSS 实现的现代化 UI

## 部署

推荐使用 [Vercel Platform](https://vercel.com) 部署此 Next.js 应用。
