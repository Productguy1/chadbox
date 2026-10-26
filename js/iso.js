/**
 * Chadbox isometric scene engine
 * ------------------------------------------------------------------
 * Draws every illustration on the page from a small "spec" object and
 * runs their timelines. No dependencies, no build step.
 *
 * A spec looks like:
 *   {
 *     k: 28,            // size of one grid unit in px (the SVG scales to its box)
 *     grid: 3,          // optional platform of (2*grid) x (2*gridY) tiles
 *     gridY: 2,         // optional, defaults to grid
 *     pad: 12,          // padding around the auto-computed viewBox
 *     alt: '...',       // accessible description (aria-label on the <svg>)
 *     items: [ ... ],   // parts, drawn in order (later items paint on top)
 *     labels: [ ... ]   // monospace text labels
 *   }
 *
 * Item types (t):
 *   'solid'   white/grey cube        untrusted code or data
 *   'glass'   amber translucent box  a Chadbox sandbox (draws its hidden back edges)
 *   'accent'  solid amber cube       a safe result
 *   'dark'    ribbed dark box        your servers / infrastructure
 *   'ghost'   dashed outline box     gone, queued or someone else
 *   'plate', 'plateA'                thin layers (security stack)
 *   'flow'    solid amber line       something that actually moves   { from, to }
 *   'dash'    dashed grey line       an attempt                      { from, to }
 *   'x'       amber X                a blocked attempt               { at }
 *   'zone'    dashed amber floor     reserved space                  { x, y, a, b }
 * Box fields: x, y (grid position), a (half width), b (half depth, defaults to a),
 *             z (base height), h (height, defaults to 2a), id (to animate it later)
 *
 * Labels: { id, at: [x, y, z], t: 'TEXT', dx, dy, anchor: 'start' | 'middle' | 'end',
 *           c: 'muted' | 'ink' | 'accent' | 'sub' }
 *
 * Animating a part: scene.set(id, { op, dx, dy, dz, s, sc, line })
 *   op          opacity 0..1
 *   dx, dy, dz  move along the grid axes, in grid units
 *   s           "rise" scale from the part's base (0 = flat, 1 = full height)
 *   sc          uniform scale around the base (used for the X pop)
 *   line        0..1 draw progress for 'flow' and 'dash' lines
 *
 * Timelines: play({ watch, mode, dur, still, fn, prog, hoverEl })
 *   mode 'auto'    loops while the element is on screen
 *   mode 'hover'   loops while hovered (or while on screen on touch devices)
 *   mode 'scroll'  calls fn(prog(rect)) every frame while on screen
 *   still          the frame shown at rest and to reduced-motion visitors
 *                  (pass -1 when fn draws its own resting state)
 *
 * Everything main.js needs is exposed on window.ChadboxIso.
 */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const f = (n) => Math.round(n * 10) / 10;
  const clamp = (v, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lin = (t, a, b) => clamp((t - a) / (b - a));
  const ph = (t, a, b) => ease(lin(t, a, b));
  const wave = (t) => 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ---------- Scene: draws an isometric spec into an SVG, keeps each part addressable ---------- */
  class Scene {
    constructor(host, spec) {
      const k = (this.k = spec.k || 28);
      this.parts = {};
      const P = (x, y, z) => [(x - y) * k * 0.866, (x + y) * k * 0.5 - (z || 0) * k];
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const grow = (X, Y) => { x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); };
      const pp = (x, y, z) => { const p = P(x, y, z); grow(p[0], p[1]); return p; };
      const poly = (list) => list.map((p, i) => { const q = pp(p[0], p[1], p[2]); return (i ? 'L' : 'M') + f(q[0]) + ' ' + f(q[1]); }).join('') + 'Z';
      const line = (a, b) => { const p = pp(a[0], a[1], a[2]); const q = pp(b[0], b[1], b[2]); return 'M' + f(p[0]) + ' ' + f(p[1]) + 'L' + f(q[0]) + ' ' + f(q[1]); };
      const svg = (this.svg = mk('svg', { role: 'img', 'aria-label': spec.alt || '', class: 'iso' }));
      const root = mk('g', {}, svg);
      const cube = (g, cls, x, y, a, b, z0, z1) => {
        if (cls === 'glass') mk('path', { d: line([x - a, y - b, z0], [x - a, y - b, z1]) + line([x - a, y - b, z0], [x + a, y - b, z0]) + line([x - a, y - b, z0], [x - a, y + b, z0]), class: 'hid' }, g);
        mk('path', { d: poly([[x + a, y - b, z0], [x + a, y + b, z0], [x + a, y + b, z1], [x + a, y - b, z1]]), class: cls + ' R' }, g);
        mk('path', { d: poly([[x - a, y + b, z0], [x + a, y + b, z0], [x + a, y + b, z1], [x - a, y + b, z1]]), class: cls + ' L' }, g);
        mk('path', { d: poly([[x - a, y - b, z1], [x + a, y - b, z1], [x + a, y + b, z1], [x - a, y + b, z1]]), class: cls + ' T' }, g);
        if (cls === 'dark' && z1 - z0 > 0.5) {
          let d = '';
          for (let r = z0 + 0.3; r < z1 - 0.1; r += 0.3) d += line([x + a, y - b + 0.1, r], [x + a, y + b - 0.1, r]);
          mk('path', { d: d, class: 'rib' }, g);
        }
      };
      if (spec.grid) {
        const n = spec.grid, m = spec.gridY || spec.grid;
        const g = mk('g', {}, root);
        cube(g, 'plat', 0, 0, n, m, -0.25, 0);
        let d = '';
        for (let i = -n; i <= n; i++) d += line([i, -m, 0], [i, m, 0]);
        for (let j = -m; j <= m; j++) d += line([-n, j, 0], [n, j, 0]);
        mk('path', { d: d, class: 'gridl' }, g);
      }
      (spec.items || []).forEach((it, idx) => {
        const g = mk('g', {}, root);
        const a = it.a || 0.5, b = it.b || a, z = it.z || 0, h = it.h == null ? a * 2 : it.h;
        const part = { g: g };
        if (it.t === 'flow' || it.t === 'dash') {
          part.a = pp(it.from[0], it.from[1], it.from[2]);
          part.b = pp(it.to[0], it.to[1], it.to[2]);
          part.path = mk('path', { d: line(it.from, it.to), class: it.t }, g);
        } else if (it.t === 'x') {
          const p = pp(it.at[0], it.at[1], it.at[2]);
          part.base = p;
          mk('path', { d: 'M' + f(p[0] - 6) + ' ' + f(p[1] - 6) + 'L' + f(p[0] + 6) + ' ' + f(p[1] + 6) + 'M' + f(p[0] + 6) + ' ' + f(p[1] - 6) + 'L' + f(p[0] - 6) + ' ' + f(p[1] + 6), class: 'xm' }, g);
        } else if (it.t === 'zone') {
          mk('path', { d: poly([[it.x - a, it.y - b, 0.01], [it.x + a, it.y - b, 0.01], [it.x + a, it.y + b, 0.01], [it.x - a, it.y + b, 0.01]]), class: 'zone' }, g);
        } else {
          cube(g, it.t, it.x || 0, it.y || 0, a, b, z, z + h);
          part.base = P(it.x || 0, it.y || 0, z);
        }
        (it.reach || []).forEach((r) => pp(r[0], r[1], r[2]));
        this.parts[it.id || 'i' + idx] = part;
      });
      (spec.labels || []).forEach((l, idx) => {
        const p = P(l.at[0], l.at[1], l.at[2]);
        const dx = l.dx || 0, dy = l.dy == null ? -14 : l.dy;
        const X = p[0] + dx, Y = p[1] + dy, anchor = l.anchor || 'middle', w = l.t.length * 7.2;
        if (anchor === 'start') grow(X + w, Y); else if (anchor === 'end') grow(X - w, Y); else { grow(X - w / 2, Y); grow(X + w / 2, Y); }
        grow(X, Y - 12);
        const g = mk('g', {}, root);
        const t = mk('text', { x: f(X), y: f(Y), 'text-anchor': anchor, class: 'lab ' + (l.c || 'muted') }, g);
        t.textContent = l.t;
        this.parts[l.id || 'l' + idx] = { g: g, base: [X, Y] };
      });
      const pad = spec.pad == null ? 12 : spec.pad;
      svg.setAttribute('viewBox', f(x0 - pad) + ' ' + f(y0 - pad) + ' ' + f(x1 - x0 + 2 * pad) + ' ' + f(y1 - y0 + 2 * pad));
      host.appendChild(svg);
    }
    /* st: op (opacity), dx/dy/dz (move in grid units), s (rise from base), sc (uniform scale), line (0..1 draw progress) */
    set(id, st) {
      const p = this.parts[id];
      if (!p) return;
      if (st.op != null) p.g.style.opacity = clamp(st.op).toFixed(3);
      if (st.line != null && p.path) {
        const e0 = p.a[0] + (p.b[0] - p.a[0]) * st.line, e1 = p.a[1] + (p.b[1] - p.a[1]) * st.line;
        p.path.setAttribute('d', 'M' + f(p.a[0]) + ' ' + f(p.a[1]) + 'L' + f(e0) + ' ' + f(e1));
      }
      const k = this.k, dx = st.dx || 0, dy = st.dy || 0, dz = st.dz || 0;
      const s = st.s == null ? 1 : Math.max(0.001, st.s), sc = st.sc == null ? 1 : st.sc;
      let tr = 'translate(' + f((dx - dy) * k * 0.866) + ' ' + f((dx + dy) * k * 0.5 - dz * k) + ')';
      if ((s !== 1 || sc !== 1) && p.base) {
        tr += ' translate(' + f(p.base[0]) + ' ' + f(p.base[1]) + ') scale(' + sc.toFixed(3) + ' ' + (s * sc).toFixed(3) + ') translate(' + f(-p.base[0]) + ' ' + f(-p.base[1]) + ')';
      }
      p.g.setAttribute('transform', tr);
    }
  }

  /* ---------- Player: runs scene timelines only when visible, on hover, or from scroll ---------- */
  const players = [];
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => players.forEach((o) => { if (o.watch === en.target) o.vis = en.isIntersecting; }));
  }, { rootMargin: '80px' }) : null;

  function play(o) {
    /* o: { watch, mode: 'auto'|'hover'|'scroll', dur, fn(t), still, prog(rect) } */
    o.acc = 0; o.last = null; o.vis = !io; o.hover = false;
    players.push(o);
    o.fn(o.still);
    if (reduce) return;
    if (io) io.observe(o.watch);
    if (o.mode === 'hover' && canHover) {
      o.hoverEl = o.hoverEl || o.watch;
      o.hoverEl.addEventListener('mouseenter', () => { o.hover = true; o.acc = 0; o.last = null; });
      o.hoverEl.addEventListener('mouseleave', () => { o.hover = false; o.fn(o.still); });
    }
  }
  function frame(now) {
    for (const o of players) {
      if (!o.vis) { o.last = null; continue; }
      if (o.mode === 'scroll') { o.fn(o.prog(o.watch.getBoundingClientRect())); continue; }
      if (o.mode === 'hover' && canHover && !o.hover) { o.last = null; continue; }
      if (o.last != null) o.acc += Math.min(64, now - o.last);
      o.last = now;
      o.fn((o.acc / o.dur) % 1);
    }
    requestAnimationFrame(frame);
  }

  const $ = (id) => document.getElementById(id);
  const sealed = (id, x, y, a, h, z) => [
    { id: id + 'c', t: 'solid', x: x, y: y, a: a * 0.38, z: (z || 0) + h * 0.3, h: h * 0.38 },
    { id: id, t: 'glass', x: x, y: y, a: a, h: h, z: z || 0 }
  ];

  window.ChadboxIso = {
    Scene, play, frame, reduce, canHover, io,
    f, clamp, ease, lin, ph, wave, $, sealed
  };
})();
