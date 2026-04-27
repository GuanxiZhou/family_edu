
## 本地运行

在项目根目录：

```bash
npm run install:all
```

### 1) 初始化示例数据

```bash
npm run seed
```

会创建/重建本地数据库并插入示例家庭、孩子、任务、记录。

### 2) 启动后端 API

```bash
cd server
npm run dev
```

默认监听：`http://127.0.0.1:3000`

### 3) 启动前端 Web

```bash
cd web
npm run dev
```

默认地址：`http://127.0.0.1:5173`  
前端已将 `/api` 代理到 `http://127.0.0.1:3000`（见 `web/vite.config.ts`）。


## 本地数据库

- **SQLite 文件**：`server/data/app.db`
- 可用「DB Browser for SQLite」打开查看表：
  - `families`
  - `children`
  - `goals`
  - `tasks`
  - `growth_logs`
  - `risks`
  - `risk_suppressions`



