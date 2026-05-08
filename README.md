
## 部署形态（当前）

- **前端**：Netlify（Vite + React 单页应用）
- **后端**：Render（Fastify API）
- **数据库**：Supabase（PostgreSQL，`DATABASE_URL` 直连）

前端通过同源 `/api/*` 调用后端：本地开发由 Vite 代理；线上由 Netlify rewrite 转发到 Render。

---

## 本地运行

在项目根目录：

```bash
npm run install:all
```

### 1) 配置 Supabase（Postgres）

在 `server` 目录创建 `.env`，写入 Supabase 提供的连接串：

```bash
DATABASE_URL=postgresql://...your-supabase-connection-string...?sslmode=require
```

### 2) 创建表结构（Drizzle）

在 `server` 目录执行：

```bash
npm run db:push
```

### 3) 初始化示例数据

在项目根目录执行：

```bash
npm run seed
```

会向 `DATABASE_URL` 指向的数据库写入示例家庭、孩子、目标、任务、成长记录。

### 4) 启动后端 API（Fastify）

```bash
cd server
npm run dev
```

默认监听：`http://127.0.0.1:3000`

### 5) 启动前端 Web（Vite）

```bash
cd web
npm run dev
```

默认地址：`http://127.0.0.1:5173`  
开发环境下，`/api` 会代理到 `http://127.0.0.1:3000`（见 `web/vite.config.ts`）。

---

## 线上部署（Netlify + Render + Supabase）

### Render（后端）

- **Root Directory**：`server`
- **Build Command**：`npm install && npm run build`
- **Start Command**：`npm run start`
- **Environment Variables**：
  - `DATABASE_URL`: Supabase Postgres 连接串
  - `PORT`: Render 会注入（Fastify 读取 `process.env.PORT`）

### Netlify（前端）

- **Base directory**：`web`
- **Build command**：`npm install && npm run build`
- **Publish directory**：`dist`

#### Netlify 转发 `/api/*` 到 Render

因为前端代码用相对路径请求（例如 `fetch("/api/families")`），线上需要在 Netlify 配置一条 rewrite：

- **Rule**：`/api/*  https://<你的-render-服务域名>/api/:splat  200`

可在 Netlify 的 Redirects 配置里添加，或在项目里添加 `web/public/_redirects`（若你选择用文件方式）：

```txt
/api/*  https://<你的-render-服务域名>/api/:splat  200
```

---

## 数据库（Supabase / Postgres）

表结构由 `server/src/db/schema.ts` 定义，使用 Drizzle `db:push` 对齐到 Supabase。

主要表：
- `families`
- `children`
- `goals`
- `tasks`
- `growth_logs`
- `risks`
- `risk_suppressions`



