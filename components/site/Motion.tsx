"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Port of design/motion.js, the motion layer every design page loads: MỘC page veil, scroll progress, reveal on
// scroll, cursor petal trail, petal burst + magnetic pull on red CTAs, return-visit greeting. The Editor
// (design: data-lite) keeps only the veil and progress bar. Reduced motion keeps only the progress bar.
const EASE = "cubic-bezier(.2,.7,.2,1)";
const PETALS = ["--gold", "--gold-light", "--trail-sand", "--accent", "--trail-blush"];
const CTA = ["rgb(163, 22, 28)", "rgb(142, 27, 31)", "rgb(125, 15, 20)", "rgb(110, 18, 22)"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const isLite = (path: string) => /^\/studio\/[^/]+/.test(path);

function playEntry(veil: HTMLElement) {
  const mark = veil.firstElementChild as HTMLElement;
  const line = mark.lastElementChild as HTMLElement;
  veil.getAnimations().forEach((a) => a.cancel());
  veil.style.animation = "none";
  veil.style.pointerEvents = "none";
  mark.animate([{ opacity: 0, translate: "0 10px" }, { opacity: 1, translate: "0 0" }], { duration: 420, easing: EASE, fill: "both" });
  line.animate([{ scale: "0 1" }, { scale: "1 1" }], { duration: 520, easing: EASE, fill: "both" });
  veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, delay: 380, easing: EASE, fill: "forwards" });
}

export function Motion() {
  const router = useRouter();
  const pathname = usePathname();
  const veilRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const shown = useRef(pathname);
  const stuck = useRef(0);
  const lite = isLite(pathname);

  // 1. Page veil: fade in on an internal link click, navigate, fade out on the new route.
  useEffect(() => {
    if (shown.current === pathname) return;
    shown.current = pathname;
    clearTimeout(stuck.current);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) playEntry(veilRef.current!);
  }, [pathname]);

  useEffect(() => {
    const veil = veilRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onClick = (e: MouseEvent) => {
      if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault(); // next/link skips its own navigation when the click is already default-prevented
      veil.getAnimations().forEach((x) => x.cancel());
      veil.style.animation = "none";
      veil.style.pointerEvents = "auto";
      const href = url.pathname + url.search + url.hash;
      veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE, fill: "forwards" }).onfinish = () => {
        if (/^\/(api|auth)\//.test(url.pathname)) location.assign(href);
        else router.push(href);
        clearTimeout(stuck.current);
        stuck.current = window.setTimeout(() => playEntry(veil), 4000); // a navigation that never lands must not leave the page covered
      };
    };
    const onShow = (ev: PageTransitionEvent) => {
      if (!ev.persisted) return;
      veil.getAnimations().forEach((x) => x.cancel());
      veil.style.opacity = "0";
      veil.style.pointerEvents = "none";
    };
    document.addEventListener("click", onClick, true);
    addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      removeEventListener("pageshow", onShow);
    };
  }, [router]);

  // 2. Scroll progress.
  useEffect(() => {
    const bar = barRef.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // 3–6. Reveal, petals, magnetic CTA, greeting.
  useEffect(() => {
    if (lite || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = matchMedia("(pointer: fine)").matches;
    const off: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      addEventListener(t, fn, o);
      off.push(() => removeEventListener(t, fn));
    };

    // 3. Reveal on scroll. Design keys off inline styles; here the same test runs on computed styles.
    const seen = new WeakSet<Element>();
    const owned = new WeakSet<Element>();
    const anims = new WeakMap<Element, Animation>();
    const armed = new Set<Element>();
    const fire = (el: Element) => {
      anims.get(el)?.play();
      armed.delete(el);
    };
    const check = () => {
      const lim = innerHeight * 0.94;
      armed.forEach((el) => {
        if (!el.isConnected) return void armed.delete(el);
        const r = el.getBoundingClientRect();
        if ((r.top < lim && r.bottom > 0) || r.bottom <= 0) fire(el);
      });
    };
    let cr = 0;
    const queue = () => {
      if (!cr) cr = requestAnimationFrame(() => ((cr = 0), check()));
    };
    on("scroll", queue, { passive: true });
    on("resize", queue);
    const iv = setInterval(check, 600);
    const skipZone = "[data-moc-veil],[data-no-reveal],header,nav,dialog";
    const hasOwnedAncestor = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (owned.has(p)) return true;
      return false;
    };
    const inFixed = (el: Element) => {
      for (let p: Element | null = el; p && p !== document.body; p = p.parentElement) {
        const pos = getComputedStyle(p).position;
        if (pos === "fixed" || pos === "sticky") return true;
      }
      return false;
    };
    const arm = (el: Element, delay: number) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.closest(skipZone) || hasOwnedAncestor(el)) return;
      const r = el.getBoundingClientRect();
      if (!r.height || r.top < innerHeight * 0.94) return;
      const cs = getComputedStyle(el);
      if (cs.animationName !== "none" || cs.display === "none" || parseFloat(cs.opacity) < 1 || inFixed(el)) return;
      owned.add(el);
      const t = el.tagName;
      let kf: Keyframe[];
      let dur = 950;
      if (t === "H1" || t === "H2") {
        kf = [
          { opacity: 0, translate: "0 44px", clipPath: "inset(100% -10% -30% -10%)" },
          { opacity: 1, translate: "0 0", clipPath: "inset(-30% -10% -30% -10%)" },
        ];
        dur = 1150;
      } else if (t === "IMG") {
        kf = [
          { opacity: 0, scale: "1.08", clipPath: "inset(10% 10% 10% 10% round 14px)" },
          { opacity: 1, scale: "1", clipPath: "inset(0% 0% 0% 0% round 0px)" },
        ];
        dur = 1200;
      } else {
        kf = [
          { opacity: 0, translate: "0 30px", filter: "blur(4px)" },
          { opacity: 1, translate: "0 0", filter: "blur(0px)" },
        ];
      }
      const an = el.animate(kf, { duration: dur, delay, easing: EASE, fill: "backwards" });
      an.pause();
      an.currentTime = 0;
      anims.set(el, an);
      armed.add(el);
    };
    // ponytail: computed-style scan of every block element, fine at marketing-page DOM sizes; tag the grids if it gets slow
    const scan = () => {
      document.body.querySelectorAll("main div, main section, main ul, main ol, main form").forEach((box) => {
        const cs = getComputedStyle(box);
        if (!(cs.display === "grid" || cs.display === "inline-grid" || (cs.display === "flex" && cs.flexWrap === "wrap"))) return;
        Array.from(box.children).forEach((c, i) => arm(c, (i % 8) * 85));
      });
      document.querySelectorAll("h1,h2,h3,p,blockquote,img,li,[data-reveal]").forEach((el) => arm(el, 0));
    };
    let tmr = 0;
    const later = () => {
      clearTimeout(tmr);
      tmr = window.setTimeout(scan, 140);
    };
    const mo = new MutationObserver(later);
    mo.observe(document.body, { childList: true, subtree: true });
    later();

    // 4. Petal layer: cursor trail + burst on red CTAs.
    const layer = document.createElement("div");
    layer.className = "moc-petals";
    document.body.appendChild(layer);
    const petal = (x: number, y: number, size: number) => {
      const p = document.createElement("i");
      Object.assign(p.style, {
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
        width: `${size}px`,
        height: `${size * 1.3}px`,
        background: `var(${PETALS[(Math.random() * PETALS.length) | 0]})`,
      });
      layer.appendChild(p);
      return p;
    };
    if (fine) {
      let lx = 0, ly = 0, lt = 0;
      on("pointermove", (e) => {
        const now = performance.now();
        if (now - lt < 45 || Math.hypot(e.clientX - lx, e.clientY - ly) < 30 || layer.childElementCount > 36) return;
        lx = e.clientX;
        ly = e.clientY;
        lt = now;
        const p = petal(lx, ly, rnd(6, 10));
        p.animate(
          [
            { opacity: 0.85, translate: "0 0", rotate: "0deg" },
            { opacity: 0, translate: `${rnd(-30, 30)}px ${rnd(50, 90)}px`, rotate: `${rnd(-200, 200)}deg` },
          ],
          { duration: rnd(1000, 1500), easing: "cubic-bezier(.3,.6,.4,1)" },
        ).onfinish = () => p.remove();
      }, { passive: true });
    }
    const isCTA = (el: Element | null): el is HTMLElement =>
      !!el && (el.hasAttribute("data-burst") || CTA.includes(getComputedStyle(el).backgroundColor));
    const onDown = (e: PointerEvent) => {
      const b = (e.target as Element).closest?.("a,button,[data-burst]") ?? null;
      if (!isCTA(b)) return;
      for (let i = 0, n = 14; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + rnd(-0.2, 0.2);
        const d = rnd(46, 96);
        const p = petal(e.clientX, e.clientY, rnd(7, 12));
        p.animate(
          [
            { opacity: 1, translate: "0 0", rotate: "0deg", scale: ".4" },
            { opacity: 0, translate: `${Math.cos(ang) * d}px ${Math.sin(ang) * d + 24}px`, rotate: `${rnd(-240, 240)}deg`, scale: "1" },
          ],
          { duration: rnd(700, 1000), easing: "cubic-bezier(.15,.7,.3,1)" },
        ).onfinish = () => p.remove();
      }
    };
    document.addEventListener("pointerdown", onDown);
    off.push(() => document.removeEventListener("pointerdown", onDown));

    // 5. Magnetic red CTAs.
    let loop = 0;
    if (fine) {
      let cur: HTMLElement | null = null, tx = 0, ty = 0, x = 0, y = 0;
      const step = () => {
        x += (tx - x) * 0.18;
        y += (ty - y) * 0.18;
        if (cur) cur.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        if (Math.abs(tx - x) + Math.abs(ty - y) > 0.05) loop = requestAnimationFrame(step);
        else {
          loop = 0;
          if (cur && !tx && !ty) {
            cur.style.translate = "";
            cur = null;
          }
        }
      };
      const kick = () => {
        if (!loop) loop = requestAnimationFrame(step);
      };
      on("pointermove", (e) => {
        const b = (e.target as Element).closest?.("a,button") ?? null;
        if (isCTA(b)) {
          if (cur && cur !== b) {
            cur.style.translate = "";
            x = y = 0;
          }
          cur = b;
          const r = b.getBoundingClientRect();
          tx = Math.max(-10, Math.min(10, (e.clientX - r.left - r.width / 2) * 0.22));
          ty = Math.max(-7, Math.min(7, (e.clientY - r.top - r.height / 2) * 0.3));
          kick();
        } else if (cur) {
          tx = ty = 0;
          kick();
        }
      }, { passive: true });
      off.push(() => {
        if (cur) cur.style.translate = "";
      });
    }

    return () => {
      off.forEach((f) => f());
      clearInterval(iv);
      clearTimeout(tmr);
      cancelAnimationFrame(cr);
      cancelAnimationFrame(loop);
      mo.disconnect();
      layer.remove();
      // leave nothing half-revealed when the next route mounts
      armed.forEach((el) => anims.get(el)?.cancel());
    };
  }, [lite, pathname]);

  // 6. Greeting from the second visit on (once per browser session).
  useEffect(() => {
    if (lite || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0;
    try {
      let n = Number(localStorage.getItem("moc_visits")) || 0;
      if (sessionStorage.getItem("moc_session")) return;
      sessionStorage.setItem("moc_session", "1");
      localStorage.setItem("moc_visits", String(++n));
      if (n > 1) t = window.setTimeout(welcome, 1800);
    } catch {}
    return () => clearTimeout(t);
  }, [lite]);

  return (
    <>
      <div ref={veilRef} className="moc-veil" data-moc-veil="" aria-hidden="true">
        <div className="moc-veil__mark">
          <div className="moc-veil__word">MỘC</div>
          <div className="moc-veil__line" />
        </div>
      </div>
      <div ref={barRef} className="moc-progress" aria-hidden="true" />
    </>
  );
}

function welcome() {
  const t = document.createElement("div");
  t.className = "moc-welcome";
  t.setAttribute("role", "status");
  t.innerHTML =
    '<div class="moc-welcome__text"><div class="moc-welcome__title">Chào mừng bạn quay lại <em>Mộc</em></div><a href="/studio">Tiếp tục tạo thiệp →</a></div><button type="button" aria-label="Đóng">✕</button>';
  document.body.appendChild(t);
  t.animate([{ opacity: 0, translate: "0 24px", scale: ".96" }, { opacity: 1, translate: "0 0", scale: "1" }], { duration: 600, easing: EASE, fill: "both" });
  const close = () => {
    t.animate([{ opacity: 1 }, { opacity: 0, translate: "0 16px" }], { duration: 350, easing: EASE, fill: "forwards" }).onfinish = () => t.remove();
  };
  t.querySelector("button")!.onclick = close;
  setTimeout(() => t.isConnected && close(), 7000);
}
