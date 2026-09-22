export interface Env {
  RULES_KV: KVNamespace;
}

export type RuleFormat = 'domain-suffix' | 'domain-keyword' | 'cidr' | 'plain';

export interface RuleListMeta {
  name: string;
  description?: string;
  format: RuleFormat;
  auth_key?: string | null;
  rule_count: number;
  total_lines: number;
  created_at: number;
  updated_at: number;
}

export interface RuleListDetail extends RuleListMeta {
  content: string;
}

export interface AdminAuthState {
  hash: string;
  salt: string;
  created_at: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
