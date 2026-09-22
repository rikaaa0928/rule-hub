import {
  changeAdminToken,
  deleteList,
  getAllLists,
  getListDetail,
  getListRawContent,
  isInitialized,
  saveList,
  setupAdminToken,
  timingSafeEqual,
  verifyAdminToken,
} from './storage';
import { ApiResponse, Env, RuleFormat } from './types';
import { renderAppHtml } from './ui';

function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
    },
  });
}

function corsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function extractAdminToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = request.headers.get('X-Admin-Token');
  if (customHeader) {
    return customHeader.trim();
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (!env.RULES_KV) {
      return new Response(
        'RULES_KV binding is missing. Please configure KV in wrangler.toml or Cloudflare dashboard.',
        { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
      return corsPreflightResponse();
    }

    // 1. Web UI Dashboard
    if (path === '/' || path === '/index.html' || path === '/admin') {
      return new Response(renderAppHtml(), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // 2. Client Raw Rules Endpoint: /rules/:name or /raw/:name
    // Format: https://<domain>/rules/<name>?auth=<key>
    if (path.startsWith('/rules/') || path.startsWith('/raw/')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const listName = decodeURIComponent(parts[1]);
        const result = await getListRawContent(env.RULES_KV, listName);

        if (!result) {
          return new Response('Rule list not found', {
            status: 404,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        const { meta, content } = result;

        // If list is protected by an auth key, verify it
        if (meta.auth_key && meta.auth_key.length > 0) {
          const authQuery = url.searchParams.get('auth') || '';
          const bearer = await extractAdminToken(request);
          const providedKey = authQuery || bearer || '';

          if (!timingSafeEqual(providedKey, meta.auth_key)) {
            return new Response('Unauthorized: invalid or missing auth token', {
              status: 401,
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'WWW-Authenticate': 'Bearer realm="RuleHub"',
              },
            });
          }
        }

        const etag = `W/"${meta.updated_at.toString(16)}-${content.length.toString(16)}"`;
        const ifNoneMatch = request.headers.get('If-None-Match');
        if (ifNoneMatch && ifNoneMatch === etag) {
          return new Response(null, { status: 304, headers: { ETag: etag } });
        }

        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=60',
            'ETag': etag,
            'Last-Modified': new Date(meta.updated_at).toUTCString(),
            'Access-Control-Allow-Origin': '*',
            'X-Rule-Count': meta.rule_count.toString(),
            'X-Rule-Format': meta.format,
          },
        });
      }
    }

    // 3. Status Check (Public)
    if (path === '/api/status' && method === 'GET') {
      const initialized = await isInitialized(env.RULES_KV);
      return jsonResponse({
        success: true,
        data: { initialized },
      });
    }

    // 4. Initial Setup (Admin token initialization)
    if (path === '/api/setup' && method === 'POST') {
      try {
        const body = (await request.json()) as { token?: string };
        const token = body?.token?.trim();
        if (!token) {
          return jsonResponse({ success: false, error: 'Token cannot be empty' }, 400);
        }
        await setupAdminToken(env.RULES_KV, token);
        return jsonResponse({
          success: true,
          message: 'Admin token initialized successfully',
        });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message || 'Setup failed' }, 400);
      }
    }

    // 5. Admin Login Verification
    if (path === '/api/login' && method === 'POST') {
      const body = (await request.json()) as { token?: string };
      const token = body?.token?.trim();
      if (!token) {
        return jsonResponse({ success: false, error: 'Token is required' }, 400);
      }
      const valid = await verifyAdminToken(env.RULES_KV, token);
      if (!valid) {
        return jsonResponse({ success: false, error: 'Invalid admin token' }, 401);
      }
      return jsonResponse({
        success: true,
        message: 'Login successful',
      });
    }

    // --- Protected Admin API Endpoints ---
    if (path.startsWith('/api/')) {
      const adminToken = await extractAdminToken(request);
      if (!adminToken) {
        return jsonResponse({ success: false, error: 'Unauthorized: missing admin token' }, 401);
      }

      const isValidAdmin = await verifyAdminToken(env.RULES_KV, adminToken);
      if (!isValidAdmin) {
        return jsonResponse({ success: false, error: 'Unauthorized: invalid admin token' }, 401);
      }

      // GET /api/lists: get all lists
      if (path === '/api/lists' && method === 'GET') {
        const lists = await getAllLists(env.RULES_KV);
        return jsonResponse({ success: true, data: lists });
      }

      // POST /api/lists: create new list
      if (path === '/api/lists' && method === 'POST') {
        try {
          const body = (await request.json()) as {
            name: string;
            description?: string;
            format?: RuleFormat;
            auth_key?: string | null;
            content?: string;
          };

          if (!body.name) {
            return jsonResponse({ success: false, error: 'List name is required' }, 400);
          }

          const format = body.format || 'domain-suffix';
          const list = await saveList(env.RULES_KV, body.name, {
            description: body.description,
            format,
            auth_key: body.auth_key,
            content: body.content || '',
          });

          return jsonResponse({ success: true, data: list }, 201);
        } catch (err: any) {
          return jsonResponse({ success: false, error: err.message || 'Failed to create list' }, 400);
        }
      }

      // GET /api/lists/:name
      if (path.startsWith('/api/lists/') && method === 'GET') {
        const name = decodeURIComponent(path.substring('/api/lists/'.length));
        const list = await getListDetail(env.RULES_KV, name);
        if (!list) {
          return jsonResponse({ success: false, error: 'List not found' }, 404);
        }
        return jsonResponse({ success: true, data: list });
      }

      // PUT /api/lists/:name
      if (path.startsWith('/api/lists/') && method === 'PUT') {
        const name = decodeURIComponent(path.substring('/api/lists/'.length));
        try {
          const body = (await request.json()) as {
            description?: string;
            format?: RuleFormat;
            auth_key?: string | null;
            content?: string;
          };

          const list = await saveList(env.RULES_KV, name, {
            description: body.description,
            format: body.format || 'domain-suffix',
            auth_key: body.auth_key,
            content: body.content ?? '',
          });

          return jsonResponse({ success: true, data: list });
        } catch (err: any) {
          return jsonResponse({ success: false, error: err.message || 'Failed to update list' }, 400);
        }
      }

      // DELETE /api/lists/:name
      if (path.startsWith('/api/lists/') && method === 'DELETE') {
        const name = decodeURIComponent(path.substring('/api/lists/'.length));
        const deleted = await deleteList(env.RULES_KV, name);
        if (!deleted) {
          return jsonResponse({ success: false, error: 'List not found' }, 404);
        }
        return jsonResponse({ success: true, message: 'Deleted successfully' });
      }

      // POST /api/reset-token: update admin token
      if (path === '/api/reset-token' && method === 'POST') {
        const body = (await request.json()) as { current_token?: string; new_token?: string };
        const current = body.current_token?.trim();
        const next = body.new_token?.trim();

        if (!current || !next) {
          return jsonResponse({ success: false, error: 'Both current_token and new_token are required' }, 400);
        }

        const success = await changeAdminToken(env.RULES_KV, current, next);
        if (!success) {
          return jsonResponse({ success: false, error: 'Incorrect current admin token' }, 400);
        }

        return jsonResponse({ success: true, message: 'Admin token changed successfully' });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
