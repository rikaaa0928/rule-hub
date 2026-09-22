# RuleHub ⚡

**RuleHub** 是一个专为 **[Leaf](https://github.com/eycorsican/leaf)** 与 **[Rog](https://github.com/rikaaa0928/rog)** 设计的轻量级、高性能路由规则分发与托管服务，基于 **Cloudflare Workers** 与 **Workers KV** 构建，支持从 GitHub 一键自动化部署。

---

## 🌟 核心特性

- **全球边缘低延迟**：运行于 Cloudflare Edge 网络，基于 Workers KV 存储，毫秒级响应，零冷启动延迟。
- **首次登录自动生成管理 Token**：
  - 首次访问控制面板时，系统自动生成高强度的管理 Token（支持自定义）；
  - 初始化后，后续访问均需使用该管理 Token 登录验证。
- **可视化控制面板 (Web Dashboard)**：
  - 规则列表的增、删、改、查（CRUD）；
  - 支持按格式（`domain-suffix` / `domain-keyword` / `cidr` / `plain`）筛选与关键字检索；
  - 实时统计有效规则行数（自动剔除 `#` 开头的注释与空行）；
  - 一键复制完整订阅链接、在线查看 Raw 内容；
  - **内置配置生成器**：一键生成 Leaf（`EXTERNAL-SUFFIX` / `EXTERNAL-KEYWORD`）和 Rog（`[[router.data]]`）的配置代码片段。
- **灵活的权限控制**：
  - **私有保护列表**：配置访问密钥（Secret Key），客户端必须通过 `https://xxx.xxx.xxx/rules/${name}?auth=${key}` 访问；
  - **公开共享列表**：无需配置密钥即可直接免密公开拉取。
- **纯边缘零构建依赖**：前端 SPA 界面直接由 Worker 内联输出，无需复杂的 Node 前端打包流程。
- **GitHub 自动部署**：内置 GitHub Actions Workflow，向 `main` 分支推送即可自动部署至 Cloudflare。

---

## 🚀 部署至 Cloudflare

### 方式一：通过 GitHub Actions 自动化部署（推荐）

1. **在 Cloudflare 创建 KV 命名空间**：
   - 登录 Cloudflare Dashboard $\to$ **Workers & Pages** $\to$ **KV**。
   - 创建名为 `RULES_KV` 的命名空间，并复制生成的 **Namespace ID**。
2. **修改配置文件**：
   - 在 `wrangler.toml` 中将 `id` 替换为你的 KV ID：
     ```toml
     [[kv_namespaces]]
     binding = "RULES_KV"
     id = "你的_KV_NAMESPACE_ID"
     ```
3. **配置 GitHub 仓库 Secrets**：
   - 进入你的 GitHub 仓库 $\to$ **Settings** $\to$ **Secrets and variables** $\to$ **Actions**：
     - `CLOUDFLARE_API_TOKEN`：具有 `Worker:Edit` 权限的 Cloudflare API Token。
     - `CLOUDFLARE_ACCOUNT_ID`：你的 Cloudflare 账户 ID（可在 Workers 控制台右下角复制）。
4. **提交代码到 GitHub**：
   - 推送代码到 `main` 分支即可自动触发 `.github/workflows/deploy.yml` 构建与部署。

---

### 方式二：本地命令行（CLI）部署

```bash
cd rule-hub

# 1. 安装依赖
pnpm install

# 2. 创建 KV 命名空间（首次）
npx wrangler kv:namespace create RULES_KV

# 将终端输出中的 namespace id 填入 wrangler.toml
# [[kv_namespaces]]
# binding = "RULES_KV"
# id = "<your-kv-id>"

# 3. 部署到 Cloudflare Workers
pnpm run deploy
```

---

## 🛠️ 使用指南

1. 在浏览器中打开 Worker 分配的域名（例如 `https://rule-hub.<你的前缀>.workers.dev`）。
2. **首次登录 / 系统初始化**：
   - 页面会弹出初始化引导并自动生成一个 **Admin Token**；
   - **请务必复制并妥善保存此 Token**（后续登录控制面板的唯一凭据，丢失不可找回）；
   - 点击 **Initialize & Enter Dashboard** 即可完成初始化并进入控制台。
3. **创建规则列表**：
   - 点击 **+ New Rule List**；
   - 填写列表名称（如 `streaming-proxy`，仅限英文字母、数字、短横线与下划线）；
   - 选择规则格式（如 `domain-suffix`、`domain-keyword` 等）；
   - （可选）设置访问密钥，或留空作为公开列表；
   - 在多行编辑框中输入规则列表（一行一条，`#` 开头为注释）；
   - 点击 **Save Rule List** 即可生效。

---

## 🔌 客户端配置指南

### 规则获取地址格式

- **带密钥保护**：`https://<你的Worker域名>/rules/<列表名>?auth=<密钥>`
- **公开列表**：`https://<你的Worker域名>/rules/<列表名>`

*(支持 `/rules/:name` 与 `/raw/:name`，返回标准 `text/plain; charset=utf-8`)*

---

### 1. 在 Leaf 中使用 (`leaf.conf`)

利用 Leaf 的动态远程规则功能（支持 3 次退避重试与自动周期拉取）：

```ini
[Rule]
# 后缀匹配规则：1 小时（3600秒）自动刷新一次，失败自动退避重试
EXTERNAL-SUFFIX,https://rule-hub.example.workers.dev/rules/proxy-domains?auth=mysecret,PROXY,interval=3600

# 关键字匹配规则
EXTERNAL-KEYWORD,https://rule-hub.example.workers.dev/rules/keyword-rules?auth=mysecret,PROXY,interval=3600

# 兜底规则
FINAL,DIRECT
```

---

### 2. 在 Rog 中使用 (`rog.toml`)

利用 Rog 的动态远程路由数据集（内置 Trie 倒序前缀树匹配与 3 次退避重试）：

```toml
# 定义远程路由数据源
[[router.data]]
name = "proxy-domains"
format = "domain-suffix"
url = "https://rule-hub.example.workers.dev/rules/proxy-domains?auth=mysecret"
interval = 3600

# 配置路由规则
[[router.rule]]
name = "proxy-domains"
select = "proxy_outbound"
```

---

## 📡 API 接口参考

| 接口 | 方法 | 鉴权方式 | 说明 |
|---|---|---|---|
| `/` | `GET` | 无 | Web 控制面板界面 |
| `/rules/:name` | `GET` | 依配置（`?auth=`） | 获取纯文本规则内容 (`text/plain`) |
| `/api/status` | `GET` | 无 | 检查系统初始化状态 |
| `/api/setup` | `POST` | 无 | 首次初始化 Admin Token |
| `/api/login` | `POST` | 无 | 校验 Admin Token |
| `/api/lists` | `GET` | Admin Bearer | 获取所有规则列表元信息 |
| `/api/lists` | `POST` | Admin Bearer | 创建规则列表 |
| `/api/lists/:name` | `GET` | Admin Bearer | 获取指定规则列表详情及内容 |
| `/api/lists/:name` | `PUT` | Admin Bearer | 更新规则列表 |
| `/api/lists/:name` | `DELETE` | Admin Bearer | 删除规则列表 |
| `/api/reset-token` | `POST` | Admin Bearer | 修改管理 Token |

---

## 🧪 自动化测试

```bash
cd rule-hub
pnpm test          # 运行 9 项端到端流程与鉴权自动化测试
pnpm run typecheck # TypeScript 类型检查
```

---

## 📄 License

MIT
