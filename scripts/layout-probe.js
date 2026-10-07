// Layout probe for the mobile-first phase (docs/superpowers/specs/2026-10-07-mobile-first-design.md §6.1).
// Run with Chrome DevTools MCP on any page of the app's own origin (the routes load in same-origin iframes):
//   1. evaluate_script  () => { window.PROBE = { vw: 1280, vh: 900 } }      (optional: routes: [...] to narrow)
//   2. evaluate_script  with this whole file as `function` and `filePath` = where the JSON should be saved
// Output: a lib/layout-audit.ts `Snapshot`. Compare/audit it with `node scripts/layout-diff.ts`.
// Static routes mirror lib/route-inventory.ts (tests/layout-audit.test.ts keeps them in sync).
async () => {
  const ROUTES = [
    "/", "/account", "/bang-gia", "/blog", "/cong-cu-dam-cuoi", "/demo", "/dieu-khoan",
    "/qr-tien-mung", "/quyen-rieng-tu", "/studio", "/tao-thiep-cuoi",
    "/templates", "/thiep-cuoi-online-mien-phi", "/tin-nhan-moi-cuoi",
    "/tro-giup", "/ung-ho", "/thiet-ke-thiep-rieng", "/cong-cu/tao-qr", "/cong-cu/nen-anh", "/cong-cu/nen-video",
    "/cong-cu/save-the-date", "/cong-cu/tin-nhan-moi", "/cong-cu/danh-sach-khach",
    "/templates/song-hy", "/templates/song-hy?preview=1", "/blog/cach-lam-thiep-cuoi-online", "/khong-co-trang-nay",
  ];
  const PROPS = ["font-size", "line-height", "font-family", "font-weight", "letter-spacing", "color", "background-color", "padding", "margin", "gap", "display", "grid-template-columns", "flex-direction", "border-radius"];
  const cfg = { vw: 1280, vh: 900, routes: ROUTES, settle: 1500, ...(window.PROBE || {}) };
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META"]);
  const TAPPABLE = "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex='-1'])";
  const TEXT_INPUT = "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]), select, textarea";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n.tagName !== "BODY"; n = n.parentElement) {
      const cls = [...n.classList].join(".");
      const same = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [n];
      parts.unshift(`${n.tagName.toLowerCase()}${cls ? "." + cls : ""}${same.length > 1 ? ":" + (same.indexOf(n) + 1) : ""}`);
    }
    return parts.join(">");
  };

  const load = (src) =>
    new Promise((resolve) => {
      const f = document.createElement("iframe");
      f.style.cssText = `position:fixed;left:0;top:0;width:${cfg.vw}px;height:${cfg.vh}px;border:0;opacity:0;pointer-events:none;z-index:-1`;
      f.onload = () => resolve(f);
      f.src = src;
      document.body.appendChild(f);
    });

  async function measure(route) {
    const f = await load(route);
    const win = f.contentWindow;
    const doc = f.contentDocument;
    // A classic scrollbar eats into the layout width: widen the frame so the page lays out at exactly cfg.vw.
    const gutter = cfg.vw - doc.documentElement.clientWidth;
    if (gutter > 0) {
      f.style.width = `${cfg.vw + gutter}px`;
      await wait(300);
    }
    await doc.fonts.ready;
    await wait(cfg.settle);
    const els = [];
    const taps = [];
    const inputs = [];
    for (const el of doc.body.querySelectorAll("*")) {
      if (SKIP.has(el.tagName) || el.ownerSVGElement) continue;
      const cs = win.getComputedStyle(el);
      if (cs.display === "none") continue;
      const p = pathOf(el);
      els.push({ p, o: [el.offsetLeft ?? 0, el.offsetTop ?? 0, el.offsetWidth ?? 0, el.offsetHeight ?? 0], s: PROPS.map((k) => cs.getPropertyValue(k)) });
      const r = el.getBoundingClientRect();
      const shown = cs.visibility !== "hidden" && r.width >= 2 && r.height >= 2 && !el.closest("[hidden], [inert], [aria-hidden='true']");
      if (shown && el.matches(TAPPABLE)) {
        // A hit area grown with ::after { position: absolute; inset: -Npx } counts towards the target size.
        const after = win.getComputedStyle(el, "::after");
        const grow = (side) => (after.content !== "none" && after.position === "absolute" ? Math.max(0, -parseFloat(after[side]) || 0) : 0);
        taps.push({
          p,
          w: Math.round(r.width + grow("left") + grow("right")),
          h: Math.round(r.height + grow("top") + grow("bottom")),
          inText: el.tagName === "A" && cs.display === "inline" && !!el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== ""),
        });
      }
      if (shown && el.matches(TEXT_INPUT)) inputs.push({ p, fs: parseFloat(cs.fontSize) });
    }
    const broken = [...doc.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc);
    const h1 = doc.querySelector("h1");
    let h1Lines = null;
    if (h1 && h1.offsetHeight) {
      const hs = win.getComputedStyle(h1);
      h1Lines = Math.round(h1.offsetHeight / (parseFloat(hs.lineHeight) || parseFloat(hs.fontSize) * 1.2));
    }
    const out = { route, clientWidth: doc.documentElement.clientWidth, scrollWidth: doc.documentElement.scrollWidth, broken, h1Lines, els, taps, inputs };
    f.remove();
    return out;
  }

  const routes = [];
  for (const r of cfg.routes) routes.push(await measure(r));
  return { vw: cfg.vw, vh: cfg.vh, props: PROPS, routes };
}
