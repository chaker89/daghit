const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(path, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => imports[name] ?? require(name), module, module.exports);
  return module.exports;
}
const { createApiClient } = load('packages/api-client/src/index.ts');
test('authenticated requests attach bearer token; public requests do not', async () => {
  const previous = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => { calls.push({ url, options }); return new Response('{"ok":true}'); };
  try {
    const request = createApiClient({ baseUrl: 'https://example.test/api/', getToken: () => 'secret', onUnauthorized() {} });
    await request('/me', { authenticated: true }); await request('/discovery');
    assert.equal(calls[0].url, 'https://example.test/api/me');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer secret');
    assert.equal(calls[1].options.headers.Authorization, undefined);
  } finally { global.fetch = previous; }
});
test('401 invalidates the token used by that request; 403 does not', async () => {
  const previous = global.fetch; const invalidated = [];
  const request = createApiClient({ baseUrl: 'https://example.test', getToken: () => 'old-session', onUnauthorized: token => invalidated.push(token) });
  try {
    global.fetch = async () => new Response('', { status: 401 });
    await assert.rejects(request('/me', { authenticated: true }), error => error.status === 401);
    global.fetch = async () => new Response('', { status: 403 });
    await assert.rejects(request('/owner', { authenticated: true }), error => error.status === 403);
    assert.deepEqual(invalidated, ['old-session']);
  } finally { global.fetch = previous; }
});
test('missing config or missing session never makes a network request', async () => {
  const request = createApiClient({ baseUrl: '', getToken: () => null, onUnauthorized() {} });
  await assert.rejects(request('/auth/login'), /not connected/);
  const protectedRequest = createApiClient({ baseUrl: 'https://example.test', getToken: () => null, onUnauthorized() {} });
  await assert.rejects(protectedRequest('/me', { authenticated: true }), error => error.status === 401);
});
const jwt = payload => `${Buffer.from(JSON.stringify({alg:'RS256'})).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
function sessions() {
  const storage = new Map();
  const api = load('apps/mobile/src/auth/session.ts', {
    'expo-secure-store': { setItemAsync: async (k,v) => storage.set(k,v), getItemAsync: async k => storage.get(k) ?? null, deleteItemAsync: async k => storage.delete(k) },
    'react-native': { Platform: { OS: 'android' } },
  });
  return { api, storage };
}
test('JWT rejects expired/unknown claims and preserves combined capabilities', () => {
  const { api } = sessions();
  assert.throws(() => api.decodeSession(jwt({ userId:'u', type:'owner', exp:1 })));
  assert.throws(() => api.decodeSession(jwt({ userId:'u', type:'superuser', exp:Date.now()/1000+60 })));
  const session = api.decodeSession(jwt({ sub:'u', type:['member','owner'], exp:Date.now()/1000+60 }));
  assert.equal(session.userId, 'u'); assert.deepEqual(session.types, ['member','owner']);
});
test('logout clears persisted credentials and wins over a pending login', async () => {
  const { api, storage } = sessions();
  const token = jwt({ userId:'u', type:'member', exp:Date.now()/1000+60 });
  await api.signInToken(token); assert.equal(storage.get('daghit.accessToken'), token);
  const login = api.signInToken(token); const logout = api.signOut();
  await assert.rejects(login, /session changed/); await logout;
  assert.equal(api.getSession(), null); assert.equal(storage.size, 0);
});
test('startup restores a valid stored session and removes an expired one', async () => {
  const { api, storage } = sessions();
  storage.set('daghit.accessToken', jwt({ userId:'restored-user', type:'member', exp:Date.now()/1000+60 }));
  await api.restoreSession(); assert.equal(api.getSession().userId, 'restored-user');
  await api.signOut();
  storage.set('daghit.accessToken', jwt({ userId:'expired-user', type:'member', exp:1 }));
  await api.restoreSession(); assert.equal(api.getSession(), null); assert.equal(storage.size, 0);
});
