// Run with: npm test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import middleware, { LOGIN_PATH, LOGOUT_PATH, safeNext, sessionToken } from '../middleware.ts'

const BASE = 'https://pudyrsl.example'

function form(fields: Record<string, string>): Request {
  return new Request(`${BASE}${LOGIN_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  })
}

test('fails closed with a setup screen when PUDY_PASSWORD is missing', async () => {
  delete process.env.PUDY_PASSWORD
  const res = await middleware(new Request(`${BASE}/`))
  assert.equal(res.status, 503)
  assert.match(await res.text(), /PUDY_PASSWORD/)
})

test('locks pages and files without a session', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const page = await middleware(new Request(`${BASE}/champions/ninja`))
  assert.equal(page.status, 401)
  const body = await page.text()
  assert.match(body, /PudyRSL/)
  assert.match(body, /value="\/champions\/ninja"/)

  const asset = await middleware(new Request(`${BASE}/assets/index-abc.js`))
  assert.equal(asset.status, 401)
  assert.equal(await asset.text(), 'Locked')
})

test('robots.txt stays public', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(new Request(`${BASE}/robots.txt`))
  assert.equal(res.headers.get('x-middleware-next'), '1')
})

test('the lock screen font stays public, nothing else under it', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const font = await middleware(new Request(`${BASE}/fonts/mona-sans-latin-wdth.woff2`))
  assert.equal(font.headers.get('x-middleware-next'), '1')
  const sneaky = await middleware(new Request(`${BASE}/fonts/../assets/index-abc.js`))
  assert.equal(sneaky.status, 401)
  const page = await middleware(new Request(`${BASE}/`))
  assert.match(await page.text(), /\/fonts\/mona-sans-latin-wdth\.woff2/)
})

test('wrong password shows the error again', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(form({ password: 'nope', next: '/roadmap' }))
  assert.equal(res.status, 401)
  assert.match(await res.text(), /Wrong password/)
})

test('right password sets the cookie and redirects back', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(form({ password: 'correct horse', next: '/roadmap', remember: 'on' }))
  assert.equal(res.status, 303)
  assert.equal(res.headers.get('location'), '/roadmap')
  const cookie = res.headers.get('set-cookie') ?? ''
  assert.match(cookie, /^pudy_session=[0-9a-f]{64};/)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /Max-Age=31536000/)
})

test('session without "remember" is a browser-session cookie', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(form({ password: 'correct horse', next: '/' }))
  assert.doesNotMatch(res.headers.get('set-cookie') ?? '', /Max-Age/)
})

test('a valid cookie passes through; a stale one does not', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const token = await sessionToken('correct horse')
  const ok = await middleware(new Request(`${BASE}/assets/x.js`, { headers: { cookie: `a=1; pudy_session=${token}` } }))
  assert.equal(ok.headers.get('x-middleware-next'), '1')

  const old = await sessionToken('old password')
  const stale = await middleware(new Request(`${BASE}/`, { headers: { cookie: `pudy_session=${old}` } }))
  assert.equal(stale.status, 401)
})

test('logout clears the cookie', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(new Request(`${BASE}${LOGOUT_PATH}`))
  assert.equal(res.status, 303)
  assert.match(res.headers.get('set-cookie') ?? '', /Max-Age=0/)
})

test('GET on the login path just redirects home', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(new Request(`${BASE}${LOGIN_PATH}`))
  assert.equal(res.status, 303)
  assert.equal(res.headers.get('location'), '/')
})

test('redirect targets stay on this site', () => {
  assert.equal(safeNext('//evil.example/x'), '/')
  assert.equal(safeNext('https://evil.example'), '/')
  assert.equal(safeNext('/\\evil.example'), '/')
  assert.equal(safeNext(LOGOUT_PATH), '/')
  assert.equal(safeNext('/clan-boss/hydra?x=1'), '/clan-boss/hydra?x=1')
})

test('the next field is HTML-escaped', async () => {
  process.env.PUDY_PASSWORD = 'correct horse'
  const res = await middleware(new Request(`${BASE}/%22%3E%3Cscript%3E`))
  const body = await res.text()
  assert.doesNotMatch(body, /"><script>/)
})
