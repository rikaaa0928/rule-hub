export function renderAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RuleHub - Proxy Route Rule Center</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --accent: #10b981;
      --accent-hover: #059669;
      --danger: #ef4444;
      --danger-hover: #dc2626;
      --warning: #f59e0b;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --radius: 8px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }

    header {
      background-color: var(--card-bg);
      border-bottom: 1px solid var(--card-border);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-icon {
      background: linear-gradient(135deg, #3b82f6, #10b981);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      background: var(--card-bg);
      color: var(--text);
    }
    .btn:hover { background: #2d3748; }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-accent {
      background: var(--accent);
      color: #fff;
    }
    .btn-accent:hover { background: var(--accent-hover); }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: var(--danger);
      color: #fff;
    }
    .btn-outline {
      border-color: var(--card-border);
      background: transparent;
    }
    .btn-outline:hover { background: var(--card-border); }
    .btn-sm {
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
    }

    /* Form Controls */
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.4rem;
      color: var(--text);
    }
    .form-help {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.3rem;
    }
    .form-control {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      color: var(--text);
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    textarea.form-control {
      font-family: var(--font-mono);
      resize: vertical;
      min-height: 220px;
      line-height: 1.4;
      tab-size: 2;
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 1.5rem;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-primary { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-success { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-warning { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-muted { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }
    .modal {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--card-border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* Toast */
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 99;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toast {
      background: #1e293b;
      color: #fff;
      border: 1px solid var(--card-border);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: slideIn 0.2s ease;
    }
    .toast-success { border-color: var(--accent); }
    .toast-error { border-color: var(--danger); }
    @keyframes slideIn {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* List Table */
    .list-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .list-table th, .list-table td {
      padding: 0.85rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--card-border);
    }
    .list-table th {
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .list-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    /* Code block */
    pre.code-snippet {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 0.825rem;
      color: #e2e8f0;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      position: relative;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }
    .empty-state svg {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      stroke: var(--text-muted);
    }

    .auth-box {
      max-width: 440px;
      margin: 4rem auto;
    }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 1rem 1.25rem;
    }
    .stat-val {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
    }
    .stat-lbl {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .search-input {
      max-width: 320px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <span>RuleHub</span>
    </div>
    <div class="header-actions" id="nav-actions">
      <!-- Injected dynamically -->
    </div>
  </header>

  <main id="app">
    <div class="empty-state">Loading RuleHub...</div>
  </main>

  <div id="modal-container"></div>
  <div class="toast-container" id="toast-container"></div>

  <script>
    const state = {
      initialized: false,
      token: localStorage.getItem('rulehub_admin_token') || '',
      lists: [],
      search: '',
      filterFormat: 'all',
      baseUrl: window.location.origin
    };

    function showToast(msg, type = 'success') {
      const c = document.getElementById('toast-container');
      const el = document.createElement('div');
      el.className = 'toast toast-' + type;
      el.innerHTML = (type === 'success' ? '✓ ' : '✕ ') + msg;
      c.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(100%)';
        setTimeout(() => el.remove(), 200);
      }, 3000);
    }

    async function api(path, options = {}) {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      if (state.token) {
        headers['Authorization'] = 'Bearer ' + state.token;
      }
      try {
        const res = await fetch(path, { ...options, headers });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Request failed with status ' + res.status);
        }
        return data;
      } catch (err) {
        throw err;
      }
    }

    function generateKey(length = 24) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
      let res = '';
      const bytes = new Uint8Array(length);
      window.crypto.getRandomValues(bytes);
      for (let i = 0; i < length; i++) {
        res += chars[bytes[i] % chars.length];
      }
      return res;
    }

    function copyToClipboard(text, msg = 'Copied to clipboard!') {
      navigator.clipboard.writeText(text).then(() => {
        showToast(msg);
      }).catch(err => {
        showToast('Failed to copy', 'error');
      });
    }

    function renderNav() {
      const el = document.getElementById('nav-actions');
      if (!state.initialized || !state.token) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = \`
        <button class="btn btn-outline btn-sm" onclick="openTokenModal()">🔑 Admin Token</button>
        <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
      \`;
    }

    async function checkStatus() {
      try {
        const res = await api('/api/status');
        state.initialized = res.data.initialized;
        if (!state.initialized) {
          renderSetupView();
        } else if (!state.token) {
          renderLoginView();
        } else {
          loadLists();
        }
      } catch (e) {
        document.getElementById('app').innerHTML = \`
          <div class="card auth-box">
            <h2 style="color:var(--danger); margin-bottom:0.5rem">Error connecting to KV</h2>
            <p style="color:var(--text-muted); font-size:0.875rem;">\${e.message}</p>
            <p style="margin-top:1rem; font-size:0.8rem; color:var(--text-muted);">Please make sure your <code>RULES_KV</code> binding is configured in Cloudflare Dashboard or <code>wrangler.toml</code>.</p>
          </div>
        \`;
      }
    }

    function renderSetupView() {
      const generated = generateKey(32);
      document.getElementById('app').innerHTML = \`
        <div class="card auth-box">
          <h2 style="margin-bottom: 0.5rem">Welcome to RuleHub!</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem">
            This is your first time setting up RuleHub. A secure Admin Token has been generated below.
          </p>

          <div class="form-group">
            <label class="form-label">Initial Admin Token</label>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" id="setup-token" class="form-control" style="font-family:var(--font-mono); font-size:0.825rem;" value="\${generated}" />
              <button type="button" class="btn btn-outline btn-sm" onclick="copyToClipboard(document.getElementById('setup-token').value)">Copy</button>
            </div>
            <div class="form-help" style="color:var(--warning)">
              ⚠️ Please save this Admin Token securely now! It will be required for all future logins and cannot be recovered if lost.
            </div>
          </div>

          <button class="btn btn-primary" style="width:100%" onclick="submitSetup()">Initialize & Enter Dashboard</button>
        </div>
      \`;
      renderNav();
    }

    async function submitSetup() {
      const token = document.getElementById('setup-token').value.trim();
      if (!token) return showToast('Token cannot be empty', 'error');
      try {
        await api('/api/setup', {
          method: 'POST',
          body: JSON.stringify({ token })
        });
        state.token = token;
        localStorage.setItem('rulehub_admin_token', token);
        state.initialized = true;
        showToast('Initialization successful!');
        renderNav();
        loadLists();
      } catch (e) {
        showToast(e.message, 'error');
      }
    }

    function renderLoginView() {
      document.getElementById('app').innerHTML = \`
        <div class="card auth-box">
          <h2 style="margin-bottom: 0.5rem">Admin Login</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem">
            Enter your Admin Token to manage routing rules.
          </p>

          <div class="form-group">
            <label class="form-label">Admin Token</label>
            <input type="password" id="login-token" class="form-control" placeholder="Paste your admin token here" />
          </div>

          <button class="btn btn-primary" style="width:100%" onclick="submitLogin()">Log In</button>
        </div>
      \`;
      renderNav();
    }

    async function submitLogin() {
      const token = document.getElementById('login-token').value.trim();
      if (!token) return showToast('Please enter your admin token', 'error');
      try {
        await api('/api/login', {
          method: 'POST',
          body: JSON.stringify({ token })
        });
        state.token = token;
        localStorage.setItem('rulehub_admin_token', token);
        showToast('Login successful!');
        renderNav();
        loadLists();
      } catch (e) {
        showToast(e.message, 'error');
      }
    }

    function logout() {
      state.token = '';
      localStorage.removeItem('rulehub_admin_token');
      renderLoginView();
    }

    async function loadLists() {
      renderNav();
      document.getElementById('app').innerHTML = '<div class="empty-state">Loading routing rules...</div>';
      try {
        const res = await api('/api/lists');
        state.lists = res.data || [];
        renderDashboard();
      } catch (e) {
        if (e.message.includes('Unauthorized') || e.message.includes('token')) {
          logout();
          return;
        }
        showToast(e.message, 'error');
      }
    }

    function renderDashboard() {
      const totalRules = state.lists.reduce((acc, l) => acc + (l.rule_count || 0), 0);
      const publicCount = state.lists.filter(l => !l.auth_key).length;
      const protectedCount = state.lists.filter(l => !!l.auth_key).length;

      const filtered = state.lists.filter(l => {
        const matchSearch = !state.search || l.name.toLowerCase().includes(state.search.toLowerCase()) || (l.description && l.description.toLowerCase().includes(state.search.toLowerCase()));
        const matchFormat = state.filterFormat === 'all' || l.format === state.filterFormat;
        return matchSearch && matchFormat;
      });

      let contentHtml = '';
      if (filtered.length === 0) {
        contentHtml = \`
          <div class="empty-state">
            <p>No routing rule lists found.</p>
            <button class="btn btn-primary" style="margin-top:1rem;" onclick="openEditModal()">+ Create Your First Rule List</button>
          </div>
        \`;
      } else {
        const rows = filtered.map(l => {
          const authUrl = state.baseUrl + '/rules/' + l.name + (l.auth_key ? '?auth=' + encodeURIComponent(l.auth_key) : '');
          const isProtected = !!l.auth_key;
          const authBadge = isProtected 
            ? \`<span class="badge badge-warning" title="Protected by auth key">🔒 Protected</span>\`
            : \`<span class="badge badge-success" title="Publicly accessible">🟢 Public</span>\`;
          
          const formatBadge = \`<span class="badge badge-primary">\${l.format}</span>\`;
          const updatedDate = new Date(l.updated_at).toLocaleString();

          return \`
            <tr>
              <td>
                <div style="font-weight:600; font-size:0.95rem; display:flex; align-items:center; gap:0.5rem;">
                  \${l.name}
                  \${authBadge}
                  \${formatBadge}
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                  \${l.description || 'No description'}
                </div>
              </td>
              <td>
                <span style="font-weight:600;">\${l.rule_count}</span>
                <span style="font-size:0.75rem; color:var(--text-muted)"> / \${l.total_lines} lines</span>
              </td>
              <td style="font-size:0.8rem; color:var(--text-muted);">
                \${updatedDate}
              </td>
              <td style="text-align:right;">
                <div style="display:inline-flex; gap:0.4rem;">
                  <button class="btn btn-outline btn-sm" onclick="copyToClipboard('\${authUrl}', 'URL copied!')" title="Copy full fetch URL">📋 Copy URL</button>
                  <button class="btn btn-outline btn-sm" onclick="openSnippetModal('\${l.name}')" title="View Leaf & Rog config">⚙️ Config</button>
                  <button class="btn btn-outline btn-sm" onclick="openEditModal('\${l.name}')" title="Edit list">✏️ Edit</button>
                  <a class="btn btn-outline btn-sm" href="\${authUrl}" target="_blank" title="View raw text">↗️ Raw</a>
                  <button class="btn btn-danger btn-sm" onclick="confirmDelete('\${l.name}')" title="Delete list">🗑️</button>
                </div>
              </td>
            </tr>
          \`;
        }).join('');

        contentHtml = \`
          <div class="card" style="padding:0; overflow-x:auto;">
            <table class="list-table">
              <thead>
                <tr>
                  <th>Rule List Name</th>
                  <th>Valid Rules</th>
                  <th>Last Updated</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                \${rows}
              </tbody>
            </table>
          </div>
        \`;
      }

      document.getElementById('app').innerHTML = \`
        <div class="stats-bar">
          <div class="stat-card">
            <div class="stat-lbl">Total Rule Lists</div>
            <div class="stat-val">\${state.lists.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Total Valid Rules</div>
            <div class="stat-val">\${totalRules.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Access Protection</div>
            <div class="stat-val" style="font-size:1.15rem; margin-top:0.3rem;">
              <span style="color:#6ee7b7">🟢 \${publicCount} Public</span> / 
              <span style="color:#fcd34d">🔒 \${protectedCount} Key</span>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div style="display:flex; gap:0.75rem; align-items:center; flex:1;">
            <input type="text" class="form-control search-input" placeholder="Search rules..." value="\${state.search}" oninput="handleSearch(this.value)" />
            <select class="form-control" style="max-width:170px;" onchange="handleFormatFilter(this.value)">
              <option value="all" \${state.filterFormat === 'all' ? 'selected' : ''}>All Formats</option>
              <option value="domain-suffix" \${state.filterFormat === 'domain-suffix' ? 'selected' : ''}>domain-suffix</option>
              <option value="domain-keyword" \${state.filterFormat === 'domain-keyword' ? 'selected' : ''}>domain-keyword</option>
              <option value="cidr" \${state.filterFormat === 'cidr' ? 'selected' : ''}>cidr</option>
              <option value="plain" \${state.filterFormat === 'plain' ? 'selected' : ''}>plain</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="openEditModal()">+ New Rule List</button>
        </div>

        \${contentHtml}
      \`;
    }

    function handleSearch(val) {
      state.search = val;
      renderDashboard();
    }

    function handleFormatFilter(val) {
      state.filterFormat = val;
      renderDashboard();
    }

    async function openEditModal(name = '') {
      let isNew = !name;
      let detail = {
        name: '',
        description: '',
        format: 'domain-suffix',
        auth_key: '',
        content: '# One rule per line. Lines starting with # are comments.\\n'
      };

      if (!isNew) {
        try {
          const res = await api('/api/lists/' + encodeURIComponent(name));
          detail = res.data;
        } catch (e) {
          return showToast(e.message, 'error');
        }
      }

      const modalHtml = \`
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
          <div class="modal">
            <div class="modal-header">
              <h3>\${isNew ? 'Create New Rule List' : 'Edit Rule List: ' + detail.name}</h3>
              <button class="btn btn-outline btn-sm" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">List Identifier Name *</label>
                <input type="text" id="modal-name" class="form-control" value="\${detail.name}" \${isNew ? '' : 'disabled'} placeholder="e.g. streaming-proxy, direct-domains" />
                <div class="form-help">1-64 alphanumeric characters, hyphens, or underscores.</div>
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                <div class="form-group">
                  <label class="form-label">Rule Format</label>
                  <select id="modal-format" class="form-control">
                    <option value="domain-suffix" \${detail.format === 'domain-suffix' ? 'selected' : ''}>domain-suffix (Domain suffix / FQDN)</option>
                    <option value="domain-keyword" \${detail.format === 'domain-keyword' ? 'selected' : ''}>domain-keyword (Domain substring)</option>
                    <option value="cidr" \${detail.format === 'cidr' ? 'selected' : ''}>cidr (IP ranges)</option>
                    <option value="plain" \${detail.format === 'plain' ? 'selected' : ''}>plain (General text list)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Description (optional)</label>
                  <input type="text" id="modal-desc" class="form-control" value="\${detail.description || ''}" placeholder="Brief note" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Access Secret Key (optional)</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="text" id="modal-auth-key" class="form-control" value="\${detail.auth_key || ''}" placeholder="Leave empty for public access" />
                  <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-auth-key').value = generateKey(16)">🎲 Random</button>
                  <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-auth-key').value = ''">Clear</button>
                </div>
                <div class="form-help">
                  If set, clients must request with <code>?auth=\${'<key>'}</code>. If empty, the list is publicly accessible.
                </div>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <label class="form-label" style="margin-bottom:0;">Rules Content</label>
                  <span id="content-stats" style="font-size:0.75rem; color:var(--text-muted)"></span>
                </div>
                <textarea id="modal-content" class="form-control" placeholder="example.com&#10;google.com&#10;# Comments start with #" oninput="updateContentStats(this.value)">\${detail.content || ''}</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
              <button class="btn btn-primary" onclick="submitSaveList('\${isNew ? '' : detail.name}')">Save Rule List</button>
            </div>
          </div>
        </div>
      \`;
      document.getElementById('modal-container').innerHTML = modalHtml;
      updateContentStats(detail.content || '');
    }

    function updateContentStats(text) {
      const lines = text.split('\\n');
      let valid = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
          valid++;
        }
      }
      document.getElementById('content-stats').textContent = \`Valid Rules: \${valid} | Lines: \${lines.length}\`;
    }

    async function submitSaveList(existingName) {
      const name = (existingName || document.getElementById('modal-name').value).trim();
      if (!name) return showToast('Name is required', 'error');

      const format = document.getElementById('modal-format').value;
      const description = document.getElementById('modal-desc').value.trim();
      const auth_key = document.getElementById('modal-auth-key').value.trim() || null;
      const content = document.getElementById('modal-content').value;

      try {
        if (existingName) {
          await api('/api/lists/' + encodeURIComponent(existingName), {
            method: 'PUT',
            body: JSON.stringify({ format, description, auth_key, content })
          });
          showToast('Updated successfully!');
        } else {
          await api('/api/lists', {
            method: 'POST',
            body: JSON.stringify({ name, format, description, auth_key, content })
          });
          showToast('Created successfully!');
        }
        closeModal();
        loadLists();
      } catch (e) {
        showToast(e.message, 'error');
      }
    }

    async function confirmDelete(name) {
      if (!confirm(\`Are you sure you want to delete rule list "\${name}"? This cannot be undone.\`)) {
        return;
      }
      try {
        await api('/api/lists/' + encodeURIComponent(name), { method: 'DELETE' });
        showToast('Deleted successfully!');
        loadLists();
      } catch (e) {
        showToast(e.message, 'error');
      }
    }

    function openSnippetModal(name) {
      const item = state.lists.find(l => l.name === name);
      if (!item) return;
      const url = state.baseUrl + '/rules/' + item.name + (item.auth_key ? '?auth=' + encodeURIComponent(item.auth_key) : '');

      let leafRuleType = 'EXTERNAL-SUFFIX';
      if (item.format === 'domain-keyword') {
        leafRuleType = 'EXTERNAL-KEYWORD';
      }

      const leafSnippet = \`[Rule]
# External remote rule with 3 retries and 1-hour (3600s) auto refresh
\${leafRuleType},\${url},PROXY,interval=3600\`;

      const rogSnippet = \`# In rog.toml:
[[router.data]]
name = "\${item.name}"
format = "\${item.format}"
url = "\${url}"
interval = 3600

[[router.rule]]
name = "\${item.name}"
select = "PROXY"\`;

      window.currentSnippets = {
        url: url,
        leaf: leafSnippet,
        rog: rogSnippet
      };

      const modalHtml = \`
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
          <div class="modal">
            <div class="modal-header">
              <h3>Client Configuration Snippets</h3>
              <button class="btn btn-outline btn-sm" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div style="margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <span style="font-weight:600; font-size:0.875rem;">Fetch URL</span>
                  <button class="btn btn-outline btn-sm" onclick="copyToClipboard(window.currentSnippets.url)">Copy URL</button>
                </div>
                <pre class="code-snippet">\${url}</pre>
              </div>

              <div style="margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <span style="font-weight:600; font-size:0.875rem;">Leaf Config (leaf.conf)</span>
                  <button class="btn btn-outline btn-sm" onclick="copyToClipboard(window.currentSnippets.leaf)">Copy Leaf</button>
                </div>
                <pre class="code-snippet">\${leafSnippet}</pre>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <span style="font-weight:600; font-size:0.875rem;">Rog Config (rog.toml)</span>
                  <button class="btn btn-outline btn-sm" onclick="copyToClipboard(window.currentSnippets.rog)">Copy Rog</button>
                </div>
                <pre class="code-snippet">\${rogSnippet}</pre>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onclick="closeModal()">Close</button>
            </div>
          </div>
        </div>
      \`;
      document.getElementById('modal-container').innerHTML = modalHtml;
    }

    function openTokenModal() {
      const modalHtml = \`
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
          <div class="modal" style="max-width:500px;">
            <div class="modal-header">
              <h3>Admin Token Settings</h3>
              <button class="btn btn-outline btn-sm" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Current Admin Token</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="password" id="cur-token-view" class="form-control" value="\${state.token}" readonly />
                  <button type="button" class="btn btn-outline btn-sm" onclick="togglePasswordVisibility('cur-token-view')">👁️</button>
                  <button type="button" class="btn btn-outline btn-sm" onclick="copyToClipboard(state.token)">Copy</button>
                </div>
              </div>

              <hr style="border:0; border-top:1px solid var(--card-border); margin:1.25rem 0;" />

              <h4 style="font-size:0.875rem; margin-bottom:0.75rem;">Change Admin Token</h4>
              <div class="form-group">
                <label class="form-label">New Admin Token</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="text" id="new-token-val" class="form-control" placeholder="Enter new admin token" />
                  <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('new-token-val').value = generateKey(32)">🎲 Random</button>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
              <button class="btn btn-primary" onclick="submitChangeToken()">Update Token</button>
            </div>
          </div>
        </div>
      \`;
      document.getElementById('modal-container').innerHTML = modalHtml;
    }

    function togglePasswordVisibility(id) {
      const el = document.getElementById(id);
      el.type = el.type === 'password' ? 'text' : 'password';
    }

    async function submitChangeToken() {
      const newToken = document.getElementById('new-token-val').value.trim();
      if (!newToken) return showToast('New token cannot be empty', 'error');
      try {
        await api('/api/reset-token', {
          method: 'POST',
          body: JSON.stringify({ current_token: state.token, new_token: newToken })
        });
        state.token = newToken;
        localStorage.setItem('rulehub_admin_token', newToken);
        showToast('Admin Token updated successfully!');
        closeModal();
      } catch (e) {
        showToast(e.message, 'error');
      }
    }

    function closeModal() {
      document.getElementById('modal-container').innerHTML = '';
    }

    // Initialize
    checkStatus();
  </script>
</body>
</html>`;
}
