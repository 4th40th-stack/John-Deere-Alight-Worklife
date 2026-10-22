#!/usr/bin/env node
/**
 * Viewport probe for the John Deere Alight Worklife target and the local clone.
 *
 * Drives headless Chrome over CDP (Chrome DevTools Protocol) so a page renders
 * at an EXACT viewport width, the Angular app finishes booting, the consent
 * banner is dismissed, and the resulting geometry can be read out.
 *
 * The in-app browser cannot do this: its window width is fixed, and the target
 * refuses to be embedded in an iframe (its frame policy rejects it), so an
 * iframe harness cannot be used against the target at all.
 *
 * Usage:
 *   node scripts/probe-viewports.mjs <url> <label> <w1,w2,...> [outDir]
 */
import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const PORT = Number(process.env.CDP_PORT || 9333)
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

const url = process.argv[2]
const label = process.argv[3]
const widths = (process.argv[4] || "1440").split(",").map(Number)
const outDir = process.argv[5] || "/tmp/az-probe"

fs.mkdirSync(outDir, { recursive: true })

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "az-cdp-"))
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    "--user-agent=" + UA,
    "about:blank",
  ],
  { stdio: "ignore" },
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getWsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      const j = await res.json()
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error("CDP did not come up")
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      }
    })
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params, sessionId }))
    })
  }
}

/**
 * Geometry probe. Runs inside the page, pierces shadow DOM, and returns the
 * boxes the layout is actually built from.
 */
const GEOMETRY_FN = `(() => {
  const all = [];
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      const b = el.getBoundingClientRect();
      if (b.width || b.height) all.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document.body);
  const box = (el) => { if(!el) return null; const b = el.getBoundingClientRect();
    return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const cls = (el) => (el && el.className && el.className.baseVal !== undefined ? el.className.baseVal : (el && el.className) || '').toString();
  const hasCls = (el, c) => cls(el).split(/\\s+/).includes(c);
  const byCls = (c) => all.find(e => hasCls(e, c));
  const byClsAll = (c) => all.filter(e => hasCls(e, c));
  const byText = (t) => all.find(e => (e.innerText||'').trim() === t);
  // The panel is the ANCESTOR of the "Enter your User ID." line. Selecting by
  // class alone can match a hidden pre-auth template and report the wrong box.
  const ancestorOf = (el, pred) => { let n = el; while (n) { if (pred(n)) return n; n = n.parentElement; } return null; };
  const enterEl = byText('Enter your User ID.');
  const panel = enterEl ? (ancestorOf(enterEl, e => cls(e).split(/\s+/).includes('f-panel')) || enterEl) : null;
  const h1real = (() => {
    const cands = all.filter(e => (e.innerText||'').trim() === 'Welcome to Alight Worklife');
    return cands.find(e => !cls(e).includes('screen-reader-text')) || cands[0] || null;
  })();
  const col = byClsAll('_s-col-4')[0] || byClsAll('col-4')[0] || null;
  const out = {};
  out.vw = innerWidth; out.vh = innerHeight;
  out.scrollH = document.documentElement.scrollHeight;
  out.text = (document.body.innerText||'').replace(/\\s+/g,' ').slice(0, 260);
  // The clone has no col-4 class (it implements the same curve in CSS), so
  // fall back to its column element for a like-for-like comparison.
  out.col = box(col || byCls('login-section'));
  out.colCls = col ? cls(col).slice(0, 90) : null;
  out.panel = box(panel);
  out.panelCls = panel ? cls(panel).slice(0, 90) : null;
  out.h1box = box(h1real);
  out.h1clsReal = h1real ? cls(h1real).slice(0,90) : null;

  out.enterUserId = box(byText('Enter your User ID.'));
  out.asterisk = box(byText('* Fields marked with an asterisk (*) are required.'));
  out.userIdLabel = box(byText('User ID'));
  out.input = box(document.querySelector('input'));
  out.forgot = box(byText("Don't have User ID"));
  out.next = box(byText('Next'));
  out.va = box(byText('Virtual Assistant'));
  out.brandBar = box(byCls('brand-bar'));
  out.headerContent = box(byCls('header-content'));
  out.header = box(document.querySelector('header'));
  out.logo = box(all.find(e => e.tagName === 'IMG' && /logo|AZO_/i.test(e.src||'')));
  out.hamburger = box(byCls('f-button') && all.find(e => hasCls(e,'naked') && e.tagName==='BUTTON'));
  out.footer = box(document.querySelector('footer'));
  out.heroWrap = box(byCls('hero-container') || byCls('hero-image')?.parentElement);
  out.heroImg = box(byCls('hero-image'));
  out.mainWrap = box(byCls('main-wrapper'));
  out.imgs = all.filter(e => e.tagName === 'IMG').map(e => ({ src: (e.currentSrc||e.src||'').split('/').pop().slice(0,60), r: box(e) }));
  out.bgs = [...new Set(all.map(e => getComputedStyle(e).backgroundImage).filter(v => v && v !== 'none' && v.includes('url(')))].slice(0,10);
  out.classes = [...new Set(all.map(cls))].filter(c => /col-|grid-row|justify-|_l-|_m-|_s-|_xl-/.test(c)).slice(0, 30);
  // Header subtree: the right-hand cluster (language + Virtual Assistant) only
  // exists at >=1024px, so its exact boxes have to be read, not guessed.
  // Footer subtree + every link: needed to reproduce the target's footer nav
  // columns and to keep the zero-dead-link invariant honest.
  out.footerTree = (() => {
    const f = document.querySelector('footer');
    if (!f) return null;
    const res = [];
    // The footer lives in a web component: its real children are behind a
    // shadowRoot, so descend through BOTH light children and shadow roots.
    const walk = (el, d) => {
      if (d > 7) return;
      for (const c of el.children) {
        const b = c.getBoundingClientRect();
        if (b.width || b.height) {
          res.push({ d, t: c.tagName.toLowerCase(), c: cls(c).slice(0,70), r: box(c),
                     txt: (c.innerText||'').trim().slice(0,60) });
        }
        walk(c, d + 1);
      }
      if (el.shadowRoot) {
        for (const c of Array.from(el.shadowRoot.children)) {
          const b = c.getBoundingClientRect();
          res.push({ d, t: c.tagName.toLowerCase(), c: (cls(c)||'shadow').slice(0,70), r: box(c),
                     txt: (c.innerText||'').trim().slice(0,60) });
          walk(c, d + 1);
        }
      }
    };
    walk(f, 0);
    return res;
  })();
  out.links = all.filter(e => e.tagName === 'A').map(e => ({ h: e.getAttribute('href'), t: (e.innerText||'').trim().slice(0,48), r: box(e) }));
  out.headerKids = (() => {
    const hc = byCls('header-content');
    if (!hc) return null;
    const res = [];
    const walk = (el, d) => {
      if (d > 6) return;
      for (const c of el.children) {
        const cs = getComputedStyle(c);
        res.push({ d, t: c.tagName.toLowerCase(), c: cls(c).slice(0,80), r: box(c),
                   txt: (c.innerText||'').trim().slice(0,24), disp: cs.display, bg: cs.backgroundColor });
        walk(c, d + 1);
      }
    };
    walk(hc, 0);
    return res;
  })();
  return out;
})()`

/** Dismiss the Ketch consent banner so it does not cover the page. */
const DISMISS_FN = `(() => {
  const b = Array.from(document.querySelectorAll('button')).find(x => /Reject Cookies/i.test(x.innerText||''));
  if (b) { b.click(); return 'rejected'; }
  const banner = document.getElementById('ketch-banner');
  if (banner) { banner.remove(); return 'removed'; }
  return 'none';
})()`

async function main() {
  const wsUrl = await getWsUrl()
  const ws = new WebSocket(wsUrl)
  await new Promise((r) => ws.addEventListener("open", r))
  const cdp = new CDP(ws)

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" })
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true })
  await cdp.send("Page.enable", {}, sessionId)
  await cdp.send("Runtime.enable", {}, sessionId)

  const rows = []
  for (const w of widths) {
    await cdp.send("Emulation.setDeviceMetricsOverride",
      { width: w, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId)
    await cdp.send("Page.navigate", { url }, sessionId)

    // Wait for the app to boot: dismiss consent, then require a real header,
    // a real panel and settled webfonts.
    let geo = null
    for (let i = 0; i < 100; i++) {
      await sleep(400)
      try { await cdp.send("Runtime.evaluate", { expression: DISMISS_FN }, sessionId) } catch {}
      try {
        const r = await cdp.send("Runtime.evaluate", { expression: GEOMETRY_FN, returnByValue: true }, sessionId)
        geo = r.result && r.result.value
      } catch {}
      const ready =
        geo && geo.vw === w && geo.panel && geo.enterUserId && geo.brandBar &&
        geo.brandBar[3] > 0 && geo.text && geo.text.length > 60
      if (ready) {
        try {
          await cdp.send("Runtime.evaluate",
            { expression: "document.fonts.ready.then(()=>true)", awaitPromise: true }, sessionId)
        } catch {}
        const r2 = await cdp.send("Runtime.evaluate", { expression: GEOMETRY_FN, returnByValue: true }, sessionId)
        geo = r2.result && r2.result.value
        break
      }
    }
    const shot = await cdp.send("Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true }, sessionId)
    fs.writeFileSync(path.join(outDir, `${label}-${w}.png`), Buffer.from(shot.data, "base64"))
    fs.writeFileSync(path.join(outDir, `${label}-${w}.json`), JSON.stringify(geo, null, 2))
    const col = geo?.col, pan = geo?.panel
    rows.push({
      w,
      col: col ? `${col[0]},${col[1]} ${col[2]}x${col[3]}` : null,
      colPct: col ? +(col[2] / w * 100).toFixed(1) : null,
      panel: pan ? `${pan[0]},${pan[1]} ${pan[2]}x${pan[3]}` : null,
      panelPct: pan ? +(pan[2] / w * 100).toFixed(1) : null,
      h1: geo?.h1box ? geo.h1box.join(",") : null,
      va: geo?.va ? geo.va.join(",") : null,
      bar: geo?.brandBar ? geo.brandBar.join(",") : null,
      logo: geo?.logo ? geo.logo.join(",") : null,
      input: geo?.input ? geo.input.join(",") : null,
      scrollH: geo?.scrollH,
    })
  }
  console.log(JSON.stringify(rows, null, 1))
  fs.writeFileSync(path.join(outDir, `${label}-summary.json`), JSON.stringify(rows, null, 2))

  ws.close()
  chrome.kill("SIGKILL")
  await sleep(300)
  process.exit(0)
}

main().catch((e) => {
  console.error("probe failed:", e.message)
  try { chrome.kill("SIGKILL") } catch {}
  process.exit(1)
})
