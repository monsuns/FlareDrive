# FlareDrive

Cloudflare R2 文件管理器，基于 Cloudflare Pages + Pages Functions + R2。支持网页端浏览/上传/预览，以及标准 WebDAV 协议访问。

## 功能

- 登录认证（Basic Auth，凭证存 sessionStorage）
- 文件/文件夹浏览，**网格 / 列表**视图切换
- 按名称 / 大小 / 修改时间**排序**
- **在线预览**：图片、视频、音频、PDF、文本、Markdown、JSON（可折叠树）
- **多选 + 批量操作**：删除 / 下载 / 重命名（右键或长按进入多选）
- 上传**进度悬浮窗**（多文件各一个进度条，完成自动消失）
- **分片上传**大文件（绕过 Workers 100MB 请求体限制）
- 拖拽上传
- WebDAV 协议端

## 部署

### 前置条件
- Cloudflare 账户，R2 已开通，至少创建一个 bucket
- 构建环境 Node 20+（推荐 22）

### Cloudflare Pages
1. Fork / 导入本仓库到你的 GitHub
2. Cloudflare Pages → 创建项目 → 连接 GitHub 仓库
   - Framework preset：`None`
   - Build command：`npm run build`
   - Build output directory：`build`
   - Environment variables：
     - `WEBDAV_USERNAME` = 你的用户名
     - `WEBDAV_PASSWORD` = 你的密码（**建议设为 Secret 加密类型**，不要用明文）
3. 部署完成后，绑定 R2 bucket 到变量 `BUCKET`
   （Settings → Functions → R2 bucket bindings → binding 名填 `BUCKET`，选你的 bucket）
4. 触发一次新部署使 binding 生效
5. （可选）绑定自定义域名

### Wrangler CLI
```bash
npm install
npm run build
npx wrangler pages deploy build --project-name flaredrive
```

## 本地开发
```bash
npm install
npm run dev        # Vite 前端，localhost:3000，/webdav 代理到 8788

# 另开一个终端跑本地 Functions + R2 模拟
npx wrangler pages dev build --r2 BUCKET \
  -b WEBDAV_USERNAME=test -b WEBDAV_PASSWORD=test --port 8788
```

## WebDAV 访问

Endpoint：`https://<your-domain>/webdav`

客户端配置：

| 字段 | 值 |
|------|-----|
| 服务器 / URL | `https://<your-domain>/webdav`（注意带 `/webdav`） |
| 用户名 | `WEBDAV_USERNAME` 的值 |
| 密码 | `WEBDAV_PASSWORD` 的值 |
| 协议 | HTTPS / WebDAV |
| 端口 | 443（默认，留空） |

支持的方法：`PROPFIND` `GET` `PUT` `MKCOL` `COPY` `MOVE` `DELETE` `HEAD` `OPTIONS`（不含 `LOCK` / `PROPPATCH`）。

限制：
- 单文件 < 100MB（Cloudflare Workers 请求体限制），更大的文件请用网页端分片上传
- 不支持文件锁，Office 文档需下载改完再传

## 技术栈

- 前端：React 18 + MUI 5 + Vite 8（构建输出 `build/`）
- 后端：Cloudflare Pages Functions（TypeScript），R2 存储
- 预览：react-markdown（Markdown）、react-json-tree（JSON）、浏览器原生（PDF / 图片 / 视频 / 音频）

## 致谢

WebDAV 代码基于 [r2-webdav](https://github.com/abersheeran/r2-webdav)（@abersheeran），本项目 fork 自 [longern/FlareDrive](https://github.com/longern/FlareDrive)。
