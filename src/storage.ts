import { AdminAuthState, Env, RuleFormat, RuleListDetail, RuleListMeta } from './types';

const ADMIN_AUTH_KEY = 'sys:admin_auth';
const LIST_INDEX_KEY = 'sys:list_index';
const META_PREFIX = 'meta:';
const DATA_PREFIX = 'data:';

// Helper: Calculate line stats
export function analyzeContent(content: string): { ruleCount: number; totalLines: number } {
  const lines = content.split('\n');
  let ruleCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
      ruleCount++;
    }
  }
  return { ruleCount, totalLines: lines.length };
}

// Web Crypto SHA-256 hashing with salt
export async function hashToken(token: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${token}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Generate random secure token
export function generateSecureToken(byteLength = 24): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Auth state operations
export async function isInitialized(kv: KVNamespace): Promise<boolean> {
  const auth = await kv.get<AdminAuthState>(ADMIN_AUTH_KEY, 'json');
  return !!auth && !!auth.hash;
}

export async function setupAdminToken(kv: KVNamespace, token: string): Promise<void> {
  const alreadyInit = await isInitialized(kv);
  if (alreadyInit) {
    throw new Error('System already initialized');
  }
  const salt = generateSecureToken(16);
  const hash = await hashToken(token, salt);
  const authState: AdminAuthState = {
    hash,
    salt,
    created_at: Date.now(),
  };
  await kv.put(ADMIN_AUTH_KEY, JSON.stringify(authState));
}

export async function verifyAdminToken(kv: KVNamespace, token: string): Promise<boolean> {
  const auth = await kv.get<AdminAuthState>(ADMIN_AUTH_KEY, 'json');
  if (!auth || !auth.hash || !auth.salt) {
    return false;
  }
  const calculatedHash = await hashToken(token, auth.salt);
  return timingSafeEqual(calculatedHash, auth.hash);
}

export async function changeAdminToken(
  kv: KVNamespace,
  currentToken: string,
  newToken: string
): Promise<boolean> {
  const verified = await verifyAdminToken(kv, currentToken);
  if (!verified) {
    return false;
  }
  const salt = generateSecureToken(16);
  const hash = await hashToken(newToken, salt);
  const authState: AdminAuthState = {
    hash,
    salt,
    created_at: Date.now(),
  };
  await kv.put(ADMIN_AUTH_KEY, JSON.stringify(authState));
  return true;
}

// List operations
export async function getAllLists(kv: KVNamespace): Promise<RuleListMeta[]> {
  const names = (await kv.get<string[]>(LIST_INDEX_KEY, 'json')) || [];
  if (names.length === 0) {
    return [];
  }

  // Fetch all meta in parallel
  const metas = await Promise.all(
    names.map(name => kv.get<RuleListMeta>(`${META_PREFIX}${name}`, 'json'))
  );

  const result: RuleListMeta[] = [];
  const validNames: string[] = [];

  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    if (meta) {
      result.push(meta);
      validNames.push(meta.name);
    }
  }

  // Self-heal index if any deleted or missing
  if (validNames.length !== names.length) {
    await kv.put(LIST_INDEX_KEY, JSON.stringify(validNames));
  }

  // Sort by updated_at descending
  return result.sort((a, b) => b.updated_at - a.updated_at);
}

export async function getListMeta(kv: KVNamespace, name: string): Promise<RuleListMeta | null> {
  return await kv.get<RuleListMeta>(`${META_PREFIX}${name}`, 'json');
}

export async function getListDetail(kv: KVNamespace, name: string): Promise<RuleListDetail | null> {
  const meta = await getListMeta(kv, name);
  if (!meta) {
    return null;
  }
  const content = (await kv.get(`${DATA_PREFIX}${name}`)) || '';
  return {
    ...meta,
    content,
  };
}

export async function getListRawContent(
  kv: KVNamespace,
  name: string
): Promise<{ content: string; meta: RuleListMeta } | null> {
  const meta = await getListMeta(kv, name);
  if (!meta) {
    return null;
  }
  const content = (await kv.get(`${DATA_PREFIX}${name}`)) || '';
  return { content, meta };
}

export async function saveList(
  kv: KVNamespace,
  name: string,
  params: {
    description?: string;
    format: RuleFormat;
    auth_key?: string | null;
    content: string;
  }
): Promise<RuleListDetail> {
  const normalizedName = name.trim();
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(normalizedName)) {
    throw new Error('Name must be 1-64 characters alphanumeric, hyphen, or underscore');
  }

  const { ruleCount, totalLines } = analyzeContent(params.content);
  const now = Date.now();
  const existingMeta = await getListMeta(kv, normalizedName);

  const meta: RuleListMeta = {
    name: normalizedName,
    description: params.description?.trim() || '',
    format: params.format,
    auth_key: params.auth_key?.trim() || null,
    rule_count: ruleCount,
    total_lines: totalLines,
    created_at: existingMeta ? existingMeta.created_at : now,
    updated_at: now,
  };

  // Save meta and content
  await kv.put(`${META_PREFIX}${normalizedName}`, JSON.stringify(meta));
  await kv.put(`${DATA_PREFIX}${normalizedName}`, params.content);

  // Update index if new
  if (!existingMeta) {
    const names = (await kv.get<string[]>(LIST_INDEX_KEY, 'json')) || [];
    if (!names.includes(normalizedName)) {
      names.push(normalizedName);
      await kv.put(LIST_INDEX_KEY, JSON.stringify(names));
    }
  }

  return {
    ...meta,
    content: params.content,
  };
}

export async function deleteList(kv: KVNamespace, name: string): Promise<boolean> {
  const meta = await getListMeta(kv, name);
  if (!meta) {
    return false;
  }
  await kv.delete(`${META_PREFIX}${name}`);
  await kv.delete(`${DATA_PREFIX}${name}`);

  const names = (await kv.get<string[]>(LIST_INDEX_KEY, 'json')) || [];
  const updatedNames = names.filter(n => n !== name);
  await kv.put(LIST_INDEX_KEY, JSON.stringify(updatedNames));

  return true;
}
