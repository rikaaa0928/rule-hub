# RuleHub ⚡

**RuleHub** 是一个专为 **[Leaf](https://github.com/eycorsican/leaf)** 与 **[Rog](https://github.com/rikaaa0928/rog)** 设计的轻量级、高性能路由规则分发与托管服务，基于 **Cloudflare Workers** 与 **Workers KV** 构建，支持通过 **Cloudflare 自带的 GitHub 集成** 进行原生自动持续部署（Git Push 即发布）。

---

## 🌟 核心特性

- **全球边缘低延迟**：运行于 Cloudflare Edge 网络，基于 Workers KV 存储，毫秒级响应，零冷启动延迟。
- **首次登录自动生成管理 Token**：
  - 首次访问控制面板时，系统自动生成高强度的管理 Token（支持自定义）；
  - 初始化后，后续访问均需使用该管理 Token 登录验证。
- **可视化控制面板 (Web Dashboard)**：
  - 规则列表的增、删、改、查（CRUD）；
  - 支持按格式（`domain-suffix` / `domain-keyword` / `cidr` / `plain`）筛选与关键字检索；
  - 实时统计有效规则条数（自动剔除 `#` 开头的注释与空行）；
  - 一键复制完整订阅链接、在线查看 Raw 内容；
  - **内置配置生成器**：一键生成 Leaf（`EXTERNAL-SUFFIX` / `EXTERNAL-KEYWORD`）和 Rog（`[[router.data]]`）的配置代码片段。
- **灵活的权限控制**：
  - **私有保护列表**：配置访问密钥（Secret Key），客户端必须通过 `https://xxx.xxx.xxx/rules/${name}?auth=${key}` 访问；
  - **公开共享列表**：无需配置密钥即可直接免密公开拉取。
- **纯边缘零构建依赖**：前端 SPA 界面直接由 Worker 内联输出，无需打包静态资源。
- **Cloudflare 原生 Git 部署**：直接连接 GitHub 仓库，由 Cloudflare 官方构建基础设施负责全自动部署。

---

## 🚀 Cloudflare 原生从 GitHub 部署步骤

无需配置任何 GitHub Actions，直接在 Cloudflare 控制台连接 GitHub 仓库：

### 第一步：在 Cloudflare 创建 KV 命名空间
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 左侧导航栏进入 **Compute (Workers) & Pages** $\to$ **KV**。
3. 点击 **Create a namespace**（创建命名空间），名称填写：`RULES_KV`，点击 **Add**。

---

### 第二步：推送到你的 GitHub 仓库
在 GitHub 上创建一个新仓库（如 `rule-hub`），然后推送本地代码：
```bash
cd rule-hub
git remote add origin git@github.com:你的用户名/rule-hub.git
git push -u origin main
```

---

### 第三步：在 Cloudflare 控制台连接 GitHub 仓库
1. 在 Cloudflare 控制台左侧进入 **Compute (Workers) & Pages** $\to$ **Overview**。
2. 点击 **Create**（创建）按钮，选择 **Workers**（或 Import from Git / Connect to Git）。
3. 选择 **Connect to Git**（连接到 Git），授权并选择你在 GitHub 创建的 `rule-hub` 仓库。
4. 构建设置（Build Settings）：
   - **Production branch**：`main`
   - **Framework preset**：选择 `None`
   - **Build command**：留空或填写 `pnpm run build`
   - **Deploy command**：留空（使用默认的 Worker 部署）
5. 绑定 KV 命名空间（Bindings）：
   - 进入该 Worker 的 **Settings**（设置） $\to$ **Bindings**（绑定）。
   - 点击 **Add** $\to$ **KV Namespace**：
     - **Variable name**（变量名）：填写 `RULES_KV`（必须完全一致，大写）
     - **KV namespace**：选择刚才创建的 `RULES_KV`
   - 点击 **Save and deploy**（保存并部署）。

部署完成后，Cloudflare 会分配一个类似 `https://rule-hub.<你的前缀>.workers.dev` 的在线域名。后续每次向 `main` 分支 `git push`，Cloudflare 都会自动拉取并部署最新版本！

---

## 🛠️ 使用指南

1. 打开 Worker 分配的域名（如 `https://rule-hub.xxx.workers.dev`）。
2. **首次登录 / 系统初始化**：
   - 页面会弹出初始化引导并自动生成一个 **Admin Token**；
   - **请务必复制并妥善保存此 Token**（后续登录控制面板的唯一凭据，丢失不可找回）；
   - 点击 **Initialize & Enter Dashboard** 即可完成初始化并进入控制台。
3. **创建规则列表**：
   - 点击 **+ New Rule List**；
   - 填写列表名称（如 `proxy-domains`，仅限英文字母、数字、短横线与下划线）；
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

## 🧪 本地测试

```bash
cd rule-hub
pnpm test          # 运行 9 项端到端流程与鉴权自动化测试
pnpm run typecheck # TypeScript 类型检查
```

---

## 📄 License

MIT
