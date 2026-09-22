# RuleHub ⚡

**RuleHub** is a lightweight, high-performance Cloudflare Worker service for hosting, managing, and distributing proxy routing rule lists. It is designed to work seamlessly with **[Leaf](https://github.com/eycorsican/leaf)** and **[Rog](https://github.com/rikaaa0928/rog)**, supporting **Cloudflare's native GitHub continuous deployment**.

---

## 🌟 Key Features

- **Edge-Native Performance**: Powered by Cloudflare Workers and globally distributed Workers KV with millisecond-level response times.
- **One-Time Admin Token Initialization**: Upon first visit, the system generates a cryptographically secure Admin Token. Subsequent visits require this token to log in.
- **Intuitive Web Dashboard**:
  - View, search, and manage routing lists.
  - Live statistics: valid rules count, total lines, and update timestamps.
  - Built-in configuration generator for Leaf (`EXTERNAL-SUFFIX`, `EXTERNAL-KEYWORD`) and Rog (`[[router.data]]`).
- **Flexible Access Control**:
  - **Protected Lists**: Configure an access secret key per list. Clients must provide `https://<domain>/rules/<name>?auth=<key>`.
  - **Public Lists**: Leave the secret key empty to allow public access without authentication.
- **Zero Frontend Build Pipeline**: The responsive SPA frontend is embedded directly within the Worker, eliminating build complexities.
- **Cloudflare Native Git Deployment**: Directly connect your GitHub repository in Cloudflare Dashboard for zero-configuration continuous deployments on every `git push`.

---

## 🚀 Native Cloudflare Deployment from GitHub

No GitHub Actions required. Cloudflare handles the entire build and deployment pipeline natively:

### Step 1: Create KV Namespace in Cloudflare
1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Compute (Workers) & Pages** $\to$ **KV**.
3. Click **Create a namespace**, enter `RULES_KV`, and click **Add**.

---

### Step 2: Push to Your GitHub Repository
Create a repository on GitHub (e.g. `rule-hub`) and push your code:
```bash
cd rule-hub
git remote add origin git@github.com:<your-username>/rule-hub.git
git push -u origin main
```

---

### Step 3: Connect GitHub Repository in Cloudflare
1. Go to Cloudflare Dashboard $\to$ **Compute (Workers) & Pages** $\to$ **Overview**.
2. Click **Create** $\to$ **Worker** $\to$ select **Connect to Git** (or **Import from Git**).
3. Select your `rule-hub` repository.
4. Set Build Settings:
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: (Leave empty or `pnpm run build`)
   - **Deploy command**: (Leave empty)
5. Add KV Binding:
   - Go to your Worker's **Settings** $\to$ **Bindings**.
   - Click **Add** $\to$ **KV Namespace**:
     - **Variable name**: `RULES_KV` (exact case)
     - **KV namespace**: select the `RULES_KV` namespace created in Step 1.
   - Click **Save and deploy**.

Once deployed, Cloudflare gives you a URL like `https://rule-hub.<account>.workers.dev`. Any subsequent push to `main` will automatically trigger Cloudflare's native build and deployment!

---

## 🛠️ Getting Started

1. Open your deployed Cloudflare Worker URL in a browser.
2. **First Login / Initialization**:
   - RuleHub will display a setup screen and generate an **Admin Token**.
   - **Save this token securely** in your password manager!
   - Click **Initialize & Enter Dashboard**.
3. **Create a Rule List**:
   - Click **+ New Rule List**.
   - Enter an identifier `name` (e.g., `proxy-domains`).
   - Select format (`domain-suffix`, `domain-keyword`, `cidr`, `plain`).
   - (Optional) Set an **Access Secret Key** or leave empty for public access.
   - Enter or paste domain/IP rules (one per line; lines starting with `#` are treated as comments).
   - Click **Save Rule List**.

---

## 🔌 Client Integration

### Rule URLs

- **Protected List**: `https://<your-worker-domain>/rules/<name>?auth=<key>`
- **Public List**: `https://<your-worker-domain>/rules/<name>`

*(Both `GET /rules/:name` and `GET /raw/:name` return raw `text/plain` content).*

---

### 1. Leaf Integration (`leaf.conf`)

Add remote rules into the `[Rule]` section of your `leaf.conf`:

```ini
[Rule]
# Remote domain suffix rule with 1-hour auto-refresh & 3-retry backoff
EXTERNAL-SUFFIX,https://rule-hub.example.workers.dev/rules/proxy-domains?auth=secret123,PROXY,interval=3600

# Remote domain keyword rule
EXTERNAL-KEYWORD,https://rule-hub.example.workers.dev/rules/keyword-rules?auth=secret123,PROXY,interval=3600

# Fallback direct
FINAL,DIRECT
```

---

### 2. Rog Integration (`rog.toml`)

Define the remote route data and route rule in your `rog.toml`:

```toml
# Remote route data definition
[[router.data]]
name = "proxy-domains"
format = "domain-suffix"
url = "https://rule-hub.example.workers.dev/rules/proxy-domains?auth=secret123"
interval = 3600

# Routing rule
[[router.rule]]
name = "proxy-domains"
select = "proxy_outbound"
```

---

## 📡 API Reference

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/` | `GET` | No | Web Dashboard UI |
| `/rules/:name` | `GET` | If key set | Raw rule list content (`text/plain`) |
| `/api/status` | `GET` | No | Check if system is initialized |
| `/api/setup` | `POST` | No | Initial setup: register admin token |
| `/api/login` | `POST` | No | Authenticate admin token |
| `/api/lists` | `GET` | Admin Bearer | Retrieve all rule list metadata |
| `/api/lists` | `POST` | Admin Bearer | Create a new rule list |
| `/api/lists/:name` | `GET` | Admin Bearer | Get rule list detail including content |
| `/api/lists/:name` | `PUT` | Admin Bearer | Update rule list |
| `/api/lists/:name` | `DELETE` | Admin Bearer | Delete rule list |
| `/api/reset-token` | `POST` | Admin Bearer | Change current admin token |

---

## 🧪 Testing

```bash
cd rule-hub
pnpm test
pnpm run typecheck
```

---

## 📄 License

MIT
