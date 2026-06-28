# FlareDrive

Cloudflare R2 文件管理器：Pages（静态前端）+ Pages Functions（WebDAV 后端）+ R2（存储）。
线上：https://dav.monsuns.com · 仓库：https://github.com/monsuns/FlareDrive

## 构建
- **Vite 8**（已从 CRA 迁移，别再用 react-scripts），`npm run build` → `build/`
- Node 22（Pages v3 默认，无 .nvmrc）
- `tsc --noEmit && vite build`，tsconfig `include: ["src"]`（根目录的 `utils/s3.ts` 等孤立文件已删，别再加回）

## 部署（Cloudflare Pages）
- 项目名 `flaredrive`，build_image v3，dest_dir `build`
- R2 binding：变量名 **`BUCKET`** → R2 bucket `webdav`
- 环境变量：`WEBDAV_USERNAME`、`WEBDAV_PASSWORD`（**设为 Secret 加密类型**，别用 plain_text）
- 自定义域 `dav.monsuns.com`，git push `main` 自动部署
- 配置变更（env/binding/build version）后**必须触发新部署**才生效

## 后端 functions/webdav/
- `[[path]].ts`：catch-all 路由，Basic Auth（`WEBDAV_USERNAME`/`WEBDAV_PASSWORD`），`WEBDAV_PUBLIC_READ` 未设
- 支持方法：PROPFIND / GET / PUT / MKCOL / COPY / MOVE / DELETE / HEAD / OPTIONS（**无 LOCK/PROPPATCH**）
- `parseBucketPath`：`env[hostname首段] || env["BUCKET"]` → binding 名必须精确 `BUCKET`（曾因前导空格 `" BUCKET"` 导致 404）

## 前端 src/
- React 18 + MUI 5 + Vite
- 认证：`src/app/auth.ts`，凭证存 sessionStorage，`authFetch` 注入 Basic Auth 头，401 广播全局事件回弹登录
- WebDAV 操作：`src/app/transfer.ts`（fetchPath / downloadFile / multipartUpload，全走 authFetch）
- 预览：`src/PreviewDialog.tsx` + `src/app/preview.ts`（getPreviewKind）——image/video/audio/pdf/text/md/json
- `vite.config.ts`：manualChunks 拆 mui / markdown vendor

## 本地开发
```bash
npm run dev        # Vite :3000，proxy /webdav → :8788
npx wrangler pages dev build --r2 BUCKET \
  -b WEBDAV_USERNAME=test -b WEBDAV_PASSWORD=test --port 8788
```

## WebDAV 客户端
- endpoint `https://dav.monsuns.com/webdav`（**带 `/webdav`**）
- 单文件 < 100MB（Workers 请求体限制），更大用网页分片上传

## 红线
- 凭证不硬编码：后端用 env，前端用 sessionStorage
- build 输出 `build/`，别改（Pages dest_dir 配 build）
- MUI icon import 用 **named barrel**（`import { X } from "@mui/icons-material"`），别用子路径 default（Vite interop 会 React #130）
- R2 binding 名精确 `BUCKET`（无空格）
