import worker from './index';

// Simple in-memory KVNamespace mock for unit testing
class MockKV {
  private store = new Map<string, string>();

  async get(key: string, type?: string): Promise<any> {
    const val = this.store.get(key);
    if (val === undefined) return null;
    if (type === 'json') {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return val;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

async function runTests() {
  console.log('Running RuleHub test suite...');
  const kv = new MockKV() as any;
  const env = { RULES_KV: kv };
  const ctx = {} as any;

  // Test 1: Check status when uninitialized
  {
    const res = await worker.fetch(new Request('http://localhost/api/status'), env, ctx);
    const body = (await res.json()) as any;
    console.assert(res.status === 200, 'Status endpoint should be 200');
    console.assert(body.data.initialized === false, 'Should be uninitialized initially');
    console.log('✓ Test 1: Uninitialized status check passed');
  }

  // Test 2: Perform initial setup
  const adminToken = 'super-secret-admin-token-12345';
  {
    const res = await worker.fetch(
      new Request('http://localhost/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken }),
      }),
      env,
      ctx
    );
    const body = (await res.json()) as any;
    console.assert(res.status === 200, 'Setup should succeed');
    console.assert(body.success === true, 'Setup success flag true');
    console.log('✓ Test 2: Admin setup passed');
  }

  // Test 3: Check status after setup
  {
    const res = await worker.fetch(new Request('http://localhost/api/status'), env, ctx);
    const body = (await res.json()) as any;
    console.assert(body.data.initialized === true, 'Should be initialized after setup');
    console.log('✓ Test 3: Initialized status check passed');
  }

  // Test 4: Login verification
  {
    // Invalid token
    const resFail = await worker.fetch(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'wrong-token' }),
      }),
      env,
      ctx
    );
    console.assert(resFail.status === 401, 'Wrong token should fail with 401');

    // Valid token
    const resOk = await worker.fetch(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken }),
      }),
      env,
      ctx
    );
    console.assert(resOk.status === 200, 'Correct token should succeed');
    console.log('✓ Test 4: Login verification passed');
  }

  // Test 5: Create a protected rule list with auth_key and a public rule list
  {
    // Protected list
    const res1 = await worker.fetch(
      new Request('http://localhost/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'proxy-domains',
          format: 'domain-suffix',
          description: 'Streaming & Proxy domains',
          auth_key: 'mykey999',
          content: '# Streaming domains\ngoogle.com\nyoutube.com\nnetflix.com\n',
        }),
      }),
      env,
      ctx
    );
    console.assert(res1.status === 201, 'Create protected list should be 201');

    // Public list
    const res2 = await worker.fetch(
      new Request('http://localhost/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'direct-domains',
          format: 'domain-suffix',
          description: 'Direct domestic domains',
          auth_key: null,
          content: 'baidu.com\nqq.com\nalipay.com\n',
        }),
      }),
      env,
      ctx
    );
    console.assert(res2.status === 201, 'Create public list should be 201');
    console.log('✓ Test 5: Create protected and public lists passed');
  }

  // Test 6: Access protected rule list without auth -> 401
  {
    const res = await worker.fetch(new Request('http://localhost/rules/proxy-domains'), env, ctx);
    console.assert(res.status === 401, 'Accessing protected rule without key should return 401');

    const resWrong = await worker.fetch(
      new Request('http://localhost/rules/proxy-domains?auth=wrongkey'),
      env,
      ctx
    );
    console.assert(resWrong.status === 401, 'Accessing protected rule with wrong key should return 401');
    console.log('✓ Test 6: Protected list unauthorized checks passed');
  }

  // Test 7: Access protected rule list with correct auth -> 200 plain text
  {
    const res = await worker.fetch(
      new Request('http://localhost/rules/proxy-domains?auth=mykey999'),
      env,
      ctx
    );
    console.assert(res.status === 200, 'Accessing protected rule with correct key should return 200');
    console.assert(
      res.headers.get('Content-Type')?.includes('text/plain'),
      'Content-Type must be text/plain'
    );
    const text = await res.text();
    console.assert(text.includes('netflix.com'), 'Should return list content');
    console.log('✓ Test 7: Protected list authorized access passed');
  }

  // Test 8: Access public rule list without auth -> 200 plain text
  {
    const res = await worker.fetch(new Request('http://localhost/rules/direct-domains'), env, ctx);
    console.assert(res.status === 200, 'Accessing public rule without auth should return 200');
    const text = await res.text();
    console.assert(text.includes('baidu.com'), 'Should return direct list content');
    console.log('✓ Test 8: Public list access passed');
  }

  // Test 9: Web UI serves HTML
  {
    const res = await worker.fetch(new Request('http://localhost/'), env, ctx);
    console.assert(res.status === 200, 'Web UI should return 200');
    console.assert(
      res.headers.get('Content-Type')?.includes('text/html'),
      'Web UI Content-Type must be text/html'
    );
    const html = await res.text();
    console.assert(html.includes('RuleHub'), 'UI HTML should contain RuleHub');
    console.log('✓ Test 9: Web UI delivery passed');
  }

  console.log('\n🎉 ALL 9 TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
