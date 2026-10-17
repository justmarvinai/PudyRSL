// PudyRSL password lock — Vercel Routing Middleware (runs on the Hobby plan).
//
// Every request needs a valid session cookie. Without it, pages get the lock
// screen and files get a bare 401. The password is the PUDY_PASSWORD
// environment variable; the cookie holds an HMAC of it, so changing the
// password signs out every device.

import { next } from '@vercel/functions'

const COOKIE = 'pudy_session'
export const LOGIN_PATH = '/__pudy/login'
export const LOGOUT_PATH = '/__pudy/logout'
const YEAR = 60 * 60 * 24 * 365
const PUBLIC_PATHS = new Set(['/robots.txt'])
// The lock screen's own font (Mona Sans, SIL OFL) must load before you sign in.
const PUBLIC_PREFIX = '/fonts/'

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname

  if (PUBLIC_PATHS.has(path) || path.startsWith(PUBLIC_PREFIX)) return next()

  const password = process.env.PUDY_PASSWORD
  if (!password) return html(lockPage({ mode: 'setup' }), 503)

  const expected = await sessionToken(password)

  if (path === LOGOUT_PATH) return redirect('/', clearCookie())

  if (path === LOGIN_PATH) {
    if (request.method !== 'POST') return redirect('/')
    const form = await request.formData().catch(() => null)
    const given = String(form?.get('password') ?? '')
    const remember = form?.get('remember') === 'on'
    const target = safeNext(String(form?.get('next') ?? '/'))
    if (given && timingSafeEqual(await sessionToken(given), expected)) {
      return redirect(target, sessionCookie(expected, remember))
    }
    await new Promise((r) => setTimeout(r, 600))
    return html(lockPage({ mode: 'login', error: true, next: target }), 401)
  }

  const cookie = readCookie(request.headers.get('cookie'), COOKIE)
  if (cookie && timingSafeEqual(cookie, expected)) return next()

  if (/\.[a-z0-9]{1,8}$/i.test(path) && !path.endsWith('.html')) {
    return new Response('Locked', { status: 401, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' } })
  }
  return html(lockPage({ mode: 'login', next: safeNext(path + url.search) }), 401)
}

// ---------- helpers ----------

export async function sessionToken(secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('pudyrsl-session-v1'))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

/** Only same-site paths; never back to the login/logout endpoints. */
export function safeNext(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/'
  if (value.startsWith(LOGIN_PATH) || value.startsWith(LOGOUT_PATH)) return '/'
  return value
}

function sessionCookie(token: string, remember: boolean): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax${remember ? `; Max-Age=${YEAR}` : ''}`
}

function clearCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

function redirect(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' })
  if (cookie) headers.set('Set-Cookie', cookie)
  return new Response(null, { status: 303, headers })
}

function html(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const LOGO = `<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><rect width="64" height="64" rx="6" fill="#f3efe6"/><path d="M17 52V12h17.5C44.2 12 50 17.6 50 26.2S44.2 40.4 34.5 40.4H27.6V52Z" fill="#0b0b0c"/><path d="M27.6 21v10.6h6c3.5 0 5.6-2 5.6-5.3S37.1 21 33.6 21Z" fill="#f3efe6"/></svg>`

export function lockPage(opts: { mode: 'login' | 'setup'; error?: boolean; next?: string }): string {
  const body =
    opts.mode === 'setup'
      ? `<h2>Set your password</h2>
         <p class="muted">PudyRSL is locked until a password is configured.</p>
         <ol>
           <li>Open your project on <b>vercel.com</b> → <b>Settings</b> → <b>Environment Variables</b>.</li>
           <li>Add <code>PUDY_PASSWORD</code> with the password you want (Production, and Preview if you use it).</li>
           <li>Redeploy (Deployments → … → Redeploy) and reload this page.</li>
         </ol>`
      : `<form method="post" action="${LOGIN_PATH}" autocomplete="on">
           <input type="hidden" name="next" value="${escapeHtml(opts.next ?? '/')}">
           <input type="text" name="username" value="PudyRSL" autocomplete="username" hidden>
           <label for="pw">Password</label>
           <div class="field${opts.error ? ' shake' : ''}">
             <input id="pw" name="password" type="password" required autofocus autocomplete="current-password" placeholder="Enter your password">
             <button type="button" class="eye" aria-label="Show password" onclick="var i=document.getElementById('pw');var show=i.type==='password';i.type=show?'text':'password';this.textContent=show?'Hide':'Show'">Show</button>
           </div>
           ${opts.error ? '<p class="error" role="alert">Wrong password — try again.</p>' : ''}
           <label class="remember"><input type="checkbox" name="remember" checked> Remember this device for a year</label>
           <button type="submit" class="unlock">Unlock</button>
         </form>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0b0c">
<title>PudyRSL — Locked</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO)}">
<link rel="preload" href="${PUBLIC_PREFIX}mona-sans-latin-wdth.woff2" as="font" type="font/woff2" crossorigin>
<style>
  @font-face{font-family:"Mona Sans";src:url(${PUBLIC_PREFIX}mona-sans-latin-wdth.woff2) format("woff2-variations");font-weight:200 900;font-stretch:75% 125%;font-display:swap}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100%;background:#0b0b0c;color:#f2f2f3;font-family:"Mona Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
  body{min-height:100vh;display:grid;place-items:center;padding:24px}
  main{width:100%;max-width:420px;animation:rise .45s cubic-bezier(.22,1,.36,1) both}
  .brand{display:flex;align-items:center;gap:14px}
  .mark{display:block;flex-shrink:0}
  .kicker{font-stretch:85%;font-weight:700;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#6c6c75}
  .rule{display:flex;align-items:center;gap:12px;margin-top:28px}
  .rule .line{height:1px;flex:1;background:#242428}
  h1{margin:18px 0 0;font-stretch:125%;font-weight:900;font-size:56px;line-height:.86;letter-spacing:-.01em;text-transform:uppercase}
  h1 span{color:#6c6c75}
  .sub{margin:14px 0 0;font-size:14px;color:#a3a3ab}
  .card{margin-top:28px;padding:22px;border-radius:4px;background:#121214;border:1px solid #242428}
  h2{font-stretch:112%;font-size:20px;font-weight:800;letter-spacing:-.02em;margin:0 0 6px}
  .muted{color:#a3a3ab;font-size:14px;margin:0 0 14px}
  ol{margin:0;padding-left:20px;color:#a3a3ab;font-size:14px;line-height:1.7}
  ol b{color:#f2f2f3}
  code{border:1px solid #34343a;padding:1px 6px;border-radius:3px;color:#f2f2f3;font-weight:700;font-size:13px}
  label{display:block;font-stretch:85%;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#6c6c75;margin-bottom:8px}
  .field{position:relative}
  input[type=password],input[type=text]{width:100%;height:46px;border-radius:4px;border:1px solid #34343a;background:#0b0b0c;color:#fff;padding:0 64px 0 14px;font:inherit;font-size:15px;outline:none;transition:border-color .12s}
  input[type=password]:focus,input[type=text]:focus{border-color:#f3efe6}
  .eye{position:absolute;right:6px;top:7px;height:32px;padding:0 10px;border:0;border-radius:3px;background:transparent;color:#a3a3ab;cursor:pointer;font:inherit;font-stretch:85%;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .eye:hover{color:#f2f2f3;background:#202024}
  .remember{display:flex;align-items:center;gap:9px;margin:16px 0 18px;font-stretch:100%;font-size:13px;font-weight:500;letter-spacing:0;text-transform:none;color:#a3a3ab;cursor:pointer}
  .remember input{accent-color:#f3efe6;width:16px;height:16px;margin:0}
  .unlock{width:100%;height:46px;border-radius:4px;border:1px solid #f3efe6;cursor:pointer;font:inherit;font-stretch:110%;font-size:14px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#0b0b0c;background:#f3efe6;transition:background-color .12s}
  .unlock:hover{background:#fff}
  .unlock:active{transform:translateY(1px)}
  .error{color:#ff5555;font-size:13px;font-weight:600;margin:10px 0 0}
  .shake{animation:shake .45s ease}
  .foot{margin-top:18px;display:flex;justify-content:space-between;font-stretch:85%;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#6c6c75}
  :focus-visible{outline:2px solid #f3efe6;outline-offset:2px}
  @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @keyframes shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(3px)}30%,50%,70%{transform:translateX(-6px)}40%,60%{transform:translateX(6px)}}
  @media (max-width:420px){h1{font-size:44px}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
</head>
<body>
<main>
  <div class="brand">
    <span class="mark">${LOGO}</span>
    <span class="kicker">Private progression companion</span>
  </div>
  <div class="rule"><span class="kicker">Locked</span><span class="line"></span></div>
  <h1>Pudy<span>RSL</span></h1>
  <p class="sub">Your Raid: Shadow Legends guide, behind a password.</p>
  <div class="card">
  ${body}
  </div>
  <div class="foot"><span>Private</span><span>Raid: Shadow Legends</span></div>
</main>
</body>
</html>`
}
