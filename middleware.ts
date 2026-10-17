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

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname

  if (PUBLIC_PATHS.has(path)) return next()

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

const LOGO = `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe2a1"/><stop offset=".55" stop-color="#e8a83a"/><stop offset="1" stop-color="#a8571a"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="15" fill="#0b0e15" stroke="rgba(255,255,255,.08)"/><path d="M32 9 50 16v13c0 12-7.8 20.6-18 24.6C21.8 49.6 14 41 14 29V16z" fill="none" stroke="url(#g)" stroke-width="3.6" stroke-linejoin="round"/><path d="M26 42V22h8.2a6.2 6.2 0 0 1 0 12.4H26" fill="none" stroke="url(#g)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`

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
             <button type="button" class="eye" aria-label="Show password" onclick="var i=document.getElementById('pw');i.type=i.type==='password'?'text':'password'">◉</button>
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
<meta name="theme-color" content="#07080c">
<title>PudyRSL — Locked</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO)}">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100%;background:#05060a;color:#e9ebf3;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
  body{min-height:100vh;display:grid;place-items:center;padding:24px;overflow:hidden;
    background:
      radial-gradient(700px 420px at 18% -5%, rgba(232,168,58,.16), transparent 60%),
      radial-gradient(620px 420px at 95% 0%, rgba(122,60,255,.13), transparent 60%),
      radial-gradient(700px 500px at 50% 120%, rgba(242,85,74,.08), transparent 60%),
      #05060a}
  .grid{position:fixed;inset:0;pointer-events:none;opacity:.4;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 15%,transparent 70%);mask-image:radial-gradient(ellipse at 50% 30%,#000 15%,transparent 70%)}
  .card{position:relative;width:100%;max-width:400px;padding:36px 32px 30px;border-radius:22px;
    background:linear-gradient(180deg,rgba(25,30,43,.82),rgba(12,15,22,.9));border:1px solid rgba(255,255,255,.07);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 40px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(246,196,99,.04);
    animation:rise .6s cubic-bezier(.22,1,.36,1) both}
  .brand{display:flex;flex-direction:column;align-items:center;gap:14px;margin-bottom:26px;text-align:center}
  .logo{filter:drop-shadow(0 0 22px rgba(232,168,58,.35));animation:float 6s ease-in-out infinite}
  h1{margin:0;font-family:"Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;font-size:30px;letter-spacing:.06em;font-weight:700}
  h1 .gold{background:linear-gradient(100deg,#fff1cf,#f6c463 40%,#e8a83a 65%,#ffdc96);-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{margin:4px 0 0;font-size:13px;color:#6f788e;letter-spacing:.04em}
  h2{font-size:17px;margin:0 0 6px}
  .muted{color:#a1a9bd;font-size:14px;margin:0 0 14px}
  ol{margin:0;padding-left:20px;color:#a1a9bd;font-size:14px;line-height:1.7}
  code{background:rgba(255,255,255,.07);padding:2px 6px;border-radius:6px;color:#ffdc96}
  label{display:block;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6f788e;margin-bottom:8px}
  .field{position:relative}
  input[type=password],input[type=text]{width:100%;height:48px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(5,6,10,.7);color:#fff;padding:0 46px 0 16px;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s}
  input[type=password]:focus,input[type=text]:focus{border-color:rgba(246,196,99,.6);box-shadow:0 0 0 4px rgba(246,196,99,.12)}
  .eye{position:absolute;right:8px;top:8px;width:32px;height:32px;border:0;border-radius:8px;background:transparent;color:#6f788e;cursor:pointer;font-size:14px}
  .eye:hover{color:#f6c463;background:rgba(255,255,255,.05)}
  .remember{display:flex;align-items:center;gap:9px;margin:16px 0 20px;font-size:13px;font-weight:500;letter-spacing:0;text-transform:none;color:#a1a9bd;cursor:pointer}
  .remember input{accent-color:#e8a83a;width:16px;height:16px}
  .unlock{width:100%;height:48px;border-radius:12px;border:1px solid rgba(255,220,150,.5);cursor:pointer;font-size:15px;font-weight:700;letter-spacing:.02em;color:#1b1206;
    background:linear-gradient(180deg,#f6c463,#d8952b);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 12px 30px -12px rgba(232,168,58,.7);transition:transform .1s,filter .15s}
  .unlock:hover{filter:brightness(1.08)}
  .unlock:active{transform:translateY(1px)}
  .error{color:#ff8a8a;font-size:13px;margin:10px 0 0}
  .shake{animation:shake .45s ease}
  .foot{margin-top:22px;text-align:center;font-size:11.5px;color:#4b5366;letter-spacing:.05em}
  @keyframes rise{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(3px)}30%,50%,70%{transform:translateX(-6px)}40%,60%{transform:translateX(6px)}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
</head>
<body>
<div class="grid"></div>
<main class="card">
  <div class="brand">
    <div class="logo">${LOGO}</div>
    <div>
      <h1><span class="gold">Pudy</span>RSL</h1>
      <p class="sub">Private progression companion</p>
    </div>
  </div>
  ${body}
  <div class="foot">🔒 Private · Raid: Shadow Legends</div>
</main>
</body>
</html>`
}
