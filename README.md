# Go Bili 前端

Go Bili 的 Web 客户端，基于 Vue 3、TypeScript 和 Vite 构建。项目提供视频浏览、搜索、播放与投稿，以及用户登录、个人资料、关注、收藏、评论和播放历史等功能。

## 功能

- 视频列表、详情播放和标题搜索
- 用户名密码登录、注册和 GitHub OAuth 登录
- Access Token 自动携带与过期刷新
- 视频点赞、收藏和评论
- 用户关注、粉丝与关注列表
- 播放进度上报和历史记录管理
- 个人资料与密码修改
- MP4 视频及封面上传

## 技术栈

- Vue 3 + TypeScript
- Vite 8
- Vue Router
- Pinia
- Axios
- Naive UI
- Day.js、Mitt

## 环境要求

- Node.js 20.19+ 或 22.12+
- npm（仓库已提交 `package-lock.json`）
- 已启动的 Go Bili 后端，默认监听 `http://localhost:3000`

## 本地开发

```bash
npm ci
npm run dev
```

启动后访问 Vite 输出的地址，通常为 <http://localhost:5173>。

开发服务器会将以下请求转发至 `http://localhost:3000`：

- `/api`：后端接口
- `/uploads`：后端本地静态资源

如后端地址不同，请修改 [`vite.config.ts`](./vite.config.ts) 中的 `BACKEND`。

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 类型检查并构建生产版本
npm run build

# 本地预览生产构建
npm run preview
```

生产构建输出到 `dist/`。

## 页面路由

| 路径 | 页面 | 登录要求 |
| --- | --- | --- |
| `/` | 首页、视频列表 | 否 |
| `/video/:id` | 视频详情 | 否 |
| `/search?title=关键词` | 搜索结果 | 否 |
| `/upload` | 视频投稿 | 上传和发布时需要 |
| `/my/edit` | 编辑个人资料 | 是 |
| `/my/History` | 播放历史 | 是 |
| `/my/favorites` | 我的收藏 | 是 |
| `/my/following` | 我的关注 | 是 |
| `/my/followers` | 我的粉丝 | 是 |
| `/oauth/callback` | GitHub OAuth 回调落地页 | 否 |

## 认证与接口约定

前端使用同源相对路径请求后端。登录成功后，Access Token 和 Refresh Token 会保存到浏览器 `localStorage`；Axios 请求拦截器会自动添加：

```http
Authorization: Bearer <access-token>
```

接口返回 `401` 时，客户端会尝试通过 `/api/auth/refreshTokens` 刷新令牌并重放原请求。刷新失败会清除本地登录状态并跳转到登录页。

## 目录结构

```text
go_bili_qd/
├─ public/              # 无需构建处理的静态资源
├─ src/
│  ├─ api/              # 后端 API 封装与类型
│  ├─ assets/           # 样式资源
│  ├─ components/       # 公共组件
│  ├─ router/           # 页面路由
│  ├─ store/            # Pinia 状态
│  ├─ utils/            # Axios 实例与工具函数
│  ├─ views/            # 页面组件
│  ├─ App.vue
│  └─ main.ts
├─ index.html
├─ package.json
└─ vite.config.ts
```

## 生产部署

先构建静态文件：

```bash
npm ci
npm run build
```

仓库上级目录的 Nginx 配置会把 `dist/` 挂载为站点根目录，并将 `/api/`、`/uploads/` 反向代理到后端。在 Windows 上也可以从上级目录运行 `deploy.bat`，它会重新构建前端并重启 Nginx 容器。

部署完整项目时，请结合上级目录的 `docker-compose.prod.yml` 和后端 README 使用。
