/**
 * Chadbox landing page: scenes and interactions
 * ------------------------------------------------------------------
 * Each numbered block owns one part of the page. A block finds its host
 * element by id (see index.html), builds a Scene and, where it moves,
 * hands a timeline to play(). Blocks 2 and 8 were removed with their illustrations.
 *
 *   1.  Hero loop                         #sc-hero
 *   3.  How it works scroll story         #story, #sc-story, #steps
 *   4.  Use-case cards (hover)            #sc-agents, #sc-play, #sc-tests, #sc-plugins
 *   5.  Security layers (scroll)          #sc-layers
 *   6.  Deployment cards                  #sc-cloud, #sc-self, #sc-dedicated
 *   7.  Pricing badges                    #sc-starter, #sc-backer, #sc-partner
 *   9.  Stat count-ups                    #stats
 *   10. Get started: tabs, sliding indicator, editable code, copy   #start
 *   11. Feature panels: traffic chart data + scroll reveal          #bento
 *   12. FAQ: animated accordion, one answer open at a time          #faq
 *
 * Timing helpers (from iso.js), all take t in 0..1:
 *   lin(t, a, b)  linear progress of t between a and b, clamped
 *   ph(t, a, b)   the same, eased in and out
 *   wave(t)       0 -> 1 -> 0 over one period
 */
(function () {
  'use strict';
  const { Scene, play, frame, reduce, io, f, clamp, ease, lin, ph, wave, $, sealed } = window.ChadboxIso;

  /* ---------- 1. Hero: the full lifecycle on a 7 s loop ---------- */
  {
    const S = new Scene($('sc-hero'), {
      k: 34, grid: 4, alt: 'Code enters a sealed box, an escape attempt toward the network is blocked, the result comes out and the box is destroyed',
      items: [
        { id: 'inPath', t: 'dash', from: [0, -4.4, 1.3], to: [0, -1.3, 1.3] },
        { id: 'pkt', t: 'solid', x: 0, y: -3.4, a: 0.28, z: 1.0, h: 0.56 },
        { id: 'core', t: 'solid', x: 0, y: 0, a: 0.45, z: 0.8, h: 0.9 },
        { id: 'box', t: 'glass', x: 0, y: 0, a: 1.3, h: 2.6 },
        { id: 'ghost', t: 'ghost', x: 0, y: 0, a: 1.3, h: 2.6 },
        { id: 'outPath', t: 'flow', from: [1.3, 0, 1.3], to: [3.4, 0, 1.3] },
        { id: 'res', t: 'accent', x: 3.7, y: 0, a: 0.3, z: 1.0, h: 0.6 },
        { id: 'net', t: 'dash', from: [0, 1.3, 1.3], to: [0, 3.2, 1.3] },
        { id: 'xm', t: 'x', at: [0, 3.5, 1.3] }
      ],
      labels: [
        { id: 'lSeal', at: [0, 0, 2.6], t: 'Sealed box · <50 ms', dy: -24, c: 'ink' },
        { id: 'lIn', at: [0, -4.4, 1.3], t: 'Code in', dy: -16 },
        { id: 'lOut', at: [3.7, 0, 1.3], t: 'Result out', dx: 22, dy: 4, anchor: 'start', c: 'accent' },
        { id: 'lNet', at: [0, 3.5, 1.3], t: 'Network blocked', dx: -16, dy: 4, anchor: 'end' }
      ]
    });
    play({
      watch: $('sc-hero'), mode: 'auto', dur: 7000, still: 0.7,
      fn: (t) => {
        const rise = ph(t, 0, 0.1), gone = ph(t, 0.82, 0.9), end = 1 - lin(t, 0.9, 0.97);
        S.set('box', { op: rise * (1 - gone), s: 0.02 + 0.98 * rise });
        S.set('lSeal', { op: rise * (1 - gone) });
        S.set('ghost', { op: gone * (1 - ph(t, 0.92, 0.99)) });
        S.set('pkt', { dy: 3.0 * ph(t, 0.08, 0.3), op: lin(t, 0.02, 0.08) * (1 - lin(t, 0.24, 0.3)) });
        const pulse = t > 0.34 && t < 0.5 ? 0.12 * Math.sin(((t - 0.34) / 0.16) * Math.PI * 2) : 0;
        S.set('core', { s: ph(t, 0.26, 0.34) * (1 + pulse), op: lin(t, 0.26, 0.3) * (1 - gone) });
        const pop = ph(t, 0.5, 0.56);
        S.set('net', { line: ph(t, 0.42, 0.52), op: 1 - lin(t, 0.86, 0.92) });
        S.set('xm', { sc: 0.4 + 0.6 * pop, op: pop * end });
        S.set('lNet', { op: pop * end });
        S.set('outPath', { line: ph(t, 0.52, 0.6), op: end });
        S.set('res', { dx: -2.1 * (1 - ph(t, 0.52, 0.66)), op: lin(t, 0.52, 0.56) * end });
        S.set('lOut', { op: lin(t, 0.6, 0.66) * end });
      }
    });
  }

  /* ---------- 3. How it works: scroll scrubs one scene through four steps ---------- */
  {
    const S = new Scene($('sc-story'), {
      k: 34, grid: 3, gridY: 2, alt: 'Code is sent, a sealed box starts around it, the code runs while an escape is blocked, then the box is destroyed and the result comes out',
      items: [
        { id: 'inPath', t: 'dash', from: [-3.2, 0, 0.5], to: [-0.8, 0, 0.5] },
        { id: 'pkt', t: 'solid', x: -2.8, y: 0, a: 0.25, z: 0.25, h: 0.5 },
        { id: 'core', t: 'solid', x: 0, y: 0, a: 0.3, z: 0.45, h: 0.6 },
        { id: 'box', t: 'glass', x: 0, y: 0, a: 0.8, h: 1.6 },
        { id: 'ghost', t: 'ghost', x: 0, y: 0, a: 0.8, h: 1.6 },
        { id: 'att', t: 'dash', from: [0, 0.8, 0.6], to: [0, 2.4, 0.6] },
        { id: 'xm', t: 'x', at: [0, 1.7, 0.6] },
        { id: 'out', t: 'flow', from: [0.8, 0, 0.5], to: [2.3, 0, 0.5] },
        { id: 'res', t: 'accent', x: 2.6, y: 0, a: 0.24, z: 0.26, h: 0.48 }
      ],
      labels: [
        { id: 'lCode', at: [-2.8, 0, 0.75], t: 'Code' },
        { id: 'lBox', at: [0, 0, 1.6], t: 'Sealed box', dy: -16, c: 'accent' },
        { id: 'lX', at: [0, 1.7, 0.6], t: 'Blocked', dx: -14, dy: 4, anchor: 'end', c: 'accent' },
        { id: 'lRes', at: [2.6, 0, 0.74], t: 'Result', c: 'accent' }
      ]
    });
    const items = Array.from(document.querySelectorAll('#steps li'));
    const bar = $('story-bar');
    let cur = -1;
    const draw = (p) => {
      const box = ph(p, 0.24, 0.42), gone = ph(p, 0.72, 0.8);
      S.set('pkt', { dx: 2.0 * ph(p, 0, 0.2) + 0.8 * ph(p, 0.45, 0.52), op: 1 - lin(p, 0.48, 0.53) });
      S.set('lCode', { op: 1 - lin(p, 0.2, 0.26) });
      S.set('inPath', { op: 1 - lin(p, 0.5, 0.56) });
      S.set('box', { s: 0.02 + 0.98 * box, op: box * (1 - gone) });
      S.set('lBox', { op: box * (1 - gone) });
      const pulse = p > 0.56 && p < 0.7 ? 0.1 * Math.sin(((p - 0.56) / 0.14) * Math.PI * 2) : 0;
      S.set('core', { s: ph(p, 0.5, 0.56) * (1 + pulse), op: lin(p, 0.5, 0.53) * (1 - gone) });
      const pop = ph(p, 0.63, 0.67), fade = 1 - ph(p, 0.74, 0.8);
      S.set('att', { line: 0.5625 * ph(p, 0.56, 0.64), op: fade });
      S.set('xm', { sc: 0.4 + 0.6 * pop, op: pop * fade });
      S.set('lX', { op: pop * fade });
      S.set('ghost', { op: gone * (1 - ph(p, 0.9, 0.98)) });
      S.set('out', { line: ph(p, 0.76, 0.84) });
      S.set('res', { dx: -1.2 * (1 - ph(p, 0.78, 0.9)), op: lin(p, 0.78, 0.82) });
      S.set('lRes', { op: lin(p, 0.86, 0.9) });
      const step = p < 0.22 ? 0 : p < 0.48 ? 1 : p < 0.72 ? 2 : 3;
      if (step !== cur && !reduce) { items.forEach((li, i) => li.classList.toggle('on', i === step)); cur = step; }
      bar.style.width = (p * 100).toFixed(1) + '%';
    };
    play({
      watch: $('story'), mode: 'scroll', still: reduce ? 0.66 : 0,
      prog: (r) => clamp(-r.top / Math.max(1, r.height - window.innerHeight)),
      fn: draw
    });
    if (reduce) { items.forEach((li) => li.classList.add('on')); bar.style.width = '100%'; }
  }

  /* ---------- 4. Use cases: each card plays its own story on hover (in view on touch) ---------- */
  {
    const S = new Scene($('sc-agents'), {
      k: 26, grid: 2, alt: 'One agent sends code to three sealed boxes at once',
      items: [
        { t: 'dark', x: -1.1, y: 0, a: 0.45, h: 1.3 },
        { id: 'f0', t: 'flow', from: [-0.65, 0, 0.5], to: [0.6, -1, 0.35] },
        { id: 'f1', t: 'flow', from: [-0.65, 0, 0.5], to: [0.6, 0, 0.35] },
        { id: 'f2', t: 'flow', from: [-0.65, 0, 0.5], to: [0.6, 1, 0.35] }
      ].concat(sealed('g0', 1.1, -1, 0.35, 0.7)).concat(sealed('g1', 1.1, 0, 0.35, 0.7)).concat(sealed('g2', 1.1, 1, 0.35, 0.7)),
      labels: [{ at: [-1.1, 0, 1.3], t: 'Agent' }, { at: [1.1, -1, 0.7], t: 'Run × N', c: 'accent' }]
    });
    play({
      watch: $('uc-agents'), mode: 'hover', dur: 3600, still: 0.7,
      fn: (t) => {
        const fade = 1 - lin(t, 0.84, 0.94);
        [0, 1, 2].forEach((j) => {
          const st = 0.06 + j * 0.12;
          S.set('f' + j, { line: ph(t, st, st + 0.18), op: fade });
          S.set('g' + j + 'c', { s: ph(t, st + 0.18, st + 0.26), op: fade });
          S.set('g' + j, { s: 0.6 + 0.4 * ph(t, st + 0.12, st + 0.2) });
        });
      }
    });
  }
  {
    const pos = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    const items = pos.map((p, i) => ({ id: 'g' + i, t: 'glass', x: p[0], y: p[1], a: 0.3, h: 0.6 }))
      .concat(pos.map((p, i) => ({ id: 'a' + i, t: 'accent', x: p[0], y: p[1], a: 0.3, h: 0.6 })));
    const S = new Scene($('sc-play'), { k: 24, grid: 2, alt: 'A grid of sealed boxes, one per learner, lighting up as each one runs', items: items, labels: [{ at: [-1, -1, 0.6], t: 'One box each' }] });
    const order = [4, 0, 8, 2, 6, 1, 7, 3, 5];
    play({
      watch: $('uc-play'), mode: 'hover', dur: 4500, still: -1,
      fn: (t) => {
        if (t < 0) { pos.forEach((_, i) => S.set('a' + i, { op: i === 8 ? 1 : 0 })); return; }
        const slot = Math.floor(t * order.length), local = t * order.length - slot;
        pos.forEach((_, i) => {
          const on = order[slot] === i;
          S.set('a' + i, { op: on ? ph(local, 0, 0.25) * (1 - ph(local, 0.75, 1)) : 0, s: on ? 0.4 + 0.6 * ph(local, 0, 0.3) : 1 });
        });
      }
    });
  }
  {
    const S = new Scene($('sc-tests'), {
      k: 26, grid: 2, gridY: 1, alt: 'Three identical sealed boxes produce identical results',
      items: sealed('b0', -1.2, -0.2, 0.38, 0.9).concat(sealed('b1', 0, -0.2, 0.38, 0.9)).concat(sealed('b2', 1.2, -0.2, 0.38, 0.9)).concat([
        { id: 'r0', t: 'accent', x: -1.2, y: 0.7, a: 0.15, h: 0.3 }, { id: 'r1', t: 'accent', x: 0, y: 0.7, a: 0.15, h: 0.3 }, { id: 'r2', t: 'accent', x: 1.2, y: 0.7, a: 0.15, h: 0.3 }
      ]),
      labels: [{ at: [0, -0.2, 0.9], t: 'Same limits', dy: -26, c: 'accent' }]
    });
    play({
      watch: $('uc-tests'), mode: 'hover', dur: 3600, still: 0.6,
      fn: (t) => {
        const up = ph(t, 0.3, 0.55) * (1 - ph(t, 0.86, 0.97));
        [0, 1, 2].forEach((j) => {
          S.set('b' + j + 'c', { s: 1 + 0.15 * Math.sin(t * Math.PI * 6) * (1 - lin(t, 0.3, 0.4)) });
          S.set('r' + j, { s: 0.05 + 0.95 * up, op: up > 0.02 ? 1 : 0 });
        });
      }
    });
  }
  {
    const S = new Scene($('sc-plugins'), {
      k: 26, grid: 2, alt: 'A plugin inside a sealed box tries to reach your network and is blocked',
      items: [
        { t: 'dark', x: -1, y: -1, a: 0.45, h: 1.4 },
        { id: 'att', t: 'dash', from: [0.5, 0.5, 0.5], to: [-0.5, -0.5, 0.5] },
        { id: 'xm', t: 'x', at: [0, 0, 0.5] }
      ].concat(sealed('box', 1, 1, 0.5, 1.0)),
      labels: [{ at: [-1, -1, 1.4], t: 'Your network' }, { id: 'lB', at: [0, 0, 0.5], t: 'Blocked', dx: 14, dy: 4, anchor: 'start', c: 'accent' }]
    });
    play({
      watch: $('uc-plugins'), mode: 'hover', dur: 3400, still: 0.6,
      fn: (t) => {
        const pop = ph(t, 0.4, 0.46), fade = 1 - lin(t, 0.86, 0.95);
        S.set('att', { line: 0.5 * ph(t, 0.1, 0.4), op: fade });
        S.set('xm', { sc: 0.4 + 0.6 * pop, op: pop * fade });
        S.set('lB', { op: pop * fade });
      }
    });
  }

  /* ---------- 5. Security layers: scroll pulls the stack apart ---------- */
  {
    const zs = [0, 1.5, 3.0, 4.5];
    const names = [['Read-only runtime', 'your code, at the core'], ['cgroups', 'memory + cpu caps'], ['seccomp', 'dangerous actions blocked'], ['Namespaces', 'private view of system']];
    const items = [{ id: 'p0', t: 'plate', x: 0, y: 0, a: 2, z: -0.15, h: 0.15 }, { id: 'core', t: 'accent', x: 0, y: 0, a: 0.6, h: 1.0 }]
      .concat([1, 2, 3].map((i) => ({ id: 'p' + i, t: i === 3 ? 'plateA' : 'plate', x: 0, y: 0, a: 2, z: zs[i] - 0.15, h: 0.15 })));
    const labels = [];
    zs.forEach((z, i) => {
      labels.push({ id: 'n' + i, at: [2, -2, z], t: names[i][0], dx: 28, dy: 0, anchor: 'start', c: i === 3 ? 'accent' : 'ink' });
      labels.push({ id: 's' + i, at: [2, -2, z], t: names[i][1], dx: 28, dy: 16, anchor: 'start', c: 'sub' });
    });
    const S = new Scene($('sc-layers'), { k: 40, alt: 'Exploded view of four protective layers around the code: namespaces, seccomp, cgroups and a read-only runtime', items: items, labels: labels });
    play({
      watch: $('sc-layers'), mode: 'scroll', still: 1,
      prog: (r) => clamp((window.innerHeight - r.top) / (window.innerHeight * 0.85)),
      fn: (p) => {
        const g = 0.3 + 0.7 * ease(clamp(p));
        zs.forEach((z, i) => {
          const dz = z * (g - 1);
          if (i > 0) S.set('p' + i, { dz: dz });
          S.set('n' + i, { dz: dz });
          S.set('s' + i, { dz: dz, op: 0.35 + 0.65 * g });
        });
      }
    });
  }

  /* ---------- 6. Deployment ---------- */
  {
    const pos = [[-2, -1], [-1, 1], [0, -2], [1, 0], [2, 2], [-2, 2], [2, -1], [-1, -2]];
    const S = new Scene($('sc-cloud'), {
      k: 22, grid: 3, alt: 'Sealed boxes appear and disappear across a shared cloud platform',
      items: pos.map((p, i) => ({ id: 'g' + i, t: 'glass', x: p[0], y: p[1], a: 0.28, h: 0.56 })).concat([{ id: 'me', t: 'accent', x: 0, y: 0, a: 0.28, h: 0.56 }]),
      labels: [{ at: [0, 0, 0.56], t: 'Your run', dy: -42, c: 'accent' }]
    });
    play({
      watch: $('sc-cloud'), mode: 'auto', dur: 6000, still: -1,
      fn: (t) => {
        pos.forEach((_, i) => {
          if (t < 0) { S.set('g' + i, { op: 1 }); return; }
          const q = (t + i * 0.137) % 1, v = ph(q, 0, 0.12) * (1 - ph(q, 0.7, 0.82));
          S.set('g' + i, { op: v, s: 0.2 + 0.8 * v });
        });
      }
    });
  }
  {
    const S = new Scene($('sc-self'), {
      k: 30, grid: 1, alt: 'One sealed container running on your own server',
      items: [{ t: 'dark', x: 0, y: 0, a: 0.9, h: 0.7 }].concat(sealed('box', 0, 0, 0.5, 1.0, 0.7)),
      labels: [{ at: [0, 0, 1.7], t: '1 container', c: 'accent' }, { at: [0.9, 0, 0.35], t: 'Your server', dx: 16, dy: 4, anchor: 'start' }]
    });
    play({ watch: $('sc-self'), mode: 'auto', dur: 2400, still: 0, fn: (t) => S.set('boxc', { s: 1 + 0.12 * Math.sin(t * Math.PI * 2) }) });
  }
  new Scene($('sc-dedicated'), {
    k: 22, grid: 3, alt: 'A fenced-off zone of sealed boxes reserved for one customer',
    items: [{ t: 'zone', x: 0, y: 0, a: 1.9 }, { t: 'ghost', x: 2.5, y: -1.5, a: 0.25, h: 0.5 }, { t: 'ghost', x: -1.5, y: 2.5, a: 0.25, h: 0.5 }]
      .concat([[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]].map((p) => ({ t: 'glass', x: p[0], y: p[1], a: 0.3, h: 0.6 }))),
    labels: [{ at: [0, 0, 0.6], t: 'Yours alone', dy: -42, c: 'accent' }]
  });

  /* ---------- 7. Pricing ---------- */
  new Scene($('sc-starter'), { k: 24, grid: 1, pad: 4, alt: 'One sealed box', items: sealed('b', 0, 0, 0.5, 1.0) });
  {
    const S = new Scene($('sc-backer'), {
      k: 20, grid: 2, pad: 4, alt: 'Several sealed boxes, one bursting taller during a spike',
      items: [[-1, -1], [1, -1], [-1, 1], [1, 1]].map((p) => ({ t: 'glass', x: p[0], y: p[1], a: 0.3, h: 0.6 })).concat([{ id: 'burst', t: 'accent', x: 0, y: 0, a: 0.3, h: 1.3 }])
    });
    play({ watch: $('sc-backer'), mode: 'auto', dur: 2800, still: 0.5, fn: (t) => S.set('burst', { s: 0.46 + 0.54 * wave(t) }) });
  }
  new Scene($('sc-partner'), {
    k: 14, grid: 3, pad: 4, alt: 'A reserved zone full of sealed boxes',
    items: [{ t: 'zone', x: 0, y: 0, a: 2.4 }].concat([-1.4, 0, 1.4].flatMap((x) => [-1.4, 0, 1.4].map((y) => ({ t: 'glass', x: x, y: y, a: 0.32, h: 0.64 }))))
  });

  /* ---------- 9. Small touches: count-ups and the terminal reveal ---------- */
  if (!reduce && io) {
    const once = (el, fn) => {
      const ob = new IntersectionObserver((en) => { if (en[0].isIntersecting) { ob.disconnect(); fn(); } }, { threshold: 0.4 });
      ob.observe(el);
    };
    once($('stats'), () => {
      document.querySelectorAll('#stats .v[data-to]').forEach((el) => {
        const to = +el.dataset.to, pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now();
        const step = (now) => {
          const p = ease(clamp((now - t0) / 900));
          el.textContent = pre + Math.round(to * p) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  }

  /* ---------- 10. Two paths: switch between the cloud API and a local install ---------- */
  {
    let path = 'cloud', lang = 'curl';
    const opts = Array.from(document.querySelectorAll('.path-opt'));
    const langBtns = Array.from(document.querySelectorAll('[data-lang]'));
    const blocks = Array.from(document.querySelectorAll('.code-block'));
    const copyBtn = $('t2-copy');
    const ind = document.querySelector('.po-ind'), segInd = document.querySelector('.seg-ind');
    const place = () => {
      const sel = opts.find((o) => o.dataset.path === path);
      ind.style.height = sel.offsetHeight + 'px';
      ind.style.transform = 'translateY(' + sel.offsetTop + 'px)';
      if ($('lang-tabs').hidden) return;
      const on = langBtns.find((b) => b.dataset.lang === lang);
      segInd.style.width = on.offsetWidth + 'px';
      segInd.style.transform = 'translateX(' + on.offsetLeft + 'px)';
    };
    window.addEventListener('resize', place);
    const meta = {
      'cloud-curl': ['bash — curl', 'Sub-50 ms cold start, worldwide', 'api.chadbox.io'],
      'cloud-python': ['python3 — sdk', 'Sub-50 ms cold start, worldwide', 'api.chadbox.io'],
      local: ['bash — docker compose', 'Kernel cgroups v2 enabled', 'localhost:8080']
    };
    const render = () => {
      const key = path === 'cloud' ? 'cloud-' + lang : 'local';
      opts.forEach((o) => { const on = o.dataset.path === path; o.setAttribute('aria-selected', String(on)); o.tabIndex = on ? 0 : -1; });
      $('path-pane').setAttribute('aria-labelledby', 'opt-' + path);
      blocks.forEach((b) => {
        const on = b.dataset.show === key;
        b.classList.toggle('show', on);
        b.setAttribute('aria-hidden', String(!on));
        b.tabIndex = on ? 0 : -1;
      });
      $('lang-tabs').hidden = path !== 'cloud';
      langBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
      place();
      $('t2-title').textContent = meta[key][0];
      $('t2-fl').textContent = meta[key][1];
      $('t2-fr').textContent = meta[key][2];
    };
    opts.forEach((o, i) => {
      o.addEventListener('click', () => { path = o.dataset.path; render(); });
      o.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const next = opts[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : opts.length - 1)) % opts.length];
        path = next.dataset.path; render(); next.focus();
      });
    });
    langBtns.forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; render(); }));
    let timer = null;
    /* Only the icon changes (copy -> checkmark), so the button keeps its width */
    const flash = () => {
      copyBtn.classList.add('done'); copyBtn.setAttribute('aria-label', 'Copied');
      clearTimeout(timer); timer = setTimeout(() => { copyBtn.classList.remove('done'); copyBtn.setAttribute('aria-label', 'Copy code'); }, 1600);
    };
    copyBtn.addEventListener('click', () => {
      const block = blocks.find((b) => b.classList.contains('show'));
      const clone = block.cloneNode(true);
      clone.querySelectorAll('.pr').forEach((n) => n.remove());
      const text = clone.textContent.trim();
      const fallback = () => {
        const r = document.createRange(); r.selectNodeContents(block);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(flash, fallback);
        else fallback();
      } catch (err) { fallback(); }
    });
    /* Editable code: type freely, then it eases back to the original when focus leaves */
    const pane = $('path-pane'), fl = $('t2-fl');
    const originals = new Map(blocks.map((b) => [b, b.innerHTML]));
    const plain = new Map(blocks.map((b) => [b, b.textContent]));
    const setFoot = (text) => {
      if (reduce) { fl.textContent = text; return; }
      fl.style.opacity = '0';
      setTimeout(() => { fl.textContent = text; fl.style.opacity = '1'; }, 200);
    };
    const revert = (b) => {
      if (reduce) { b.innerHTML = originals.get(b); return; }
      const ghost = b.cloneNode(true);
      ghost.removeAttribute('contenteditable');
      ghost.removeAttribute('aria-label');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.tabIndex = -1;
      ghost.style.background = 'transparent';
      ghost.style.boxShadow = 'none';
      ghost.style.pointerEvents = 'none';
      ghost.scrollLeft = b.scrollLeft;
      b.after(ghost);
      b.innerHTML = originals.get(b);
      b.animate(
        [{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }],
        { duration: 620, delay: 140, easing: 'cubic-bezier(.22, .8, .24, 1)', fill: 'backwards' }
      );
      ghost.animate(
        [{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }, { opacity: 0, filter: 'blur(4px)', transform: 'translateY(-6px)' }],
        { duration: 460, easing: 'cubic-bezier(.4, 0, .6, 1)', fill: 'forwards' }
      ).onfinish = () => ghost.remove();
    };
    blocks.forEach((b) => {
      b.spellcheck = false;
      b.setAttribute('autocapitalize', 'off');
      b.setAttribute('autocorrect', 'off');
      b.setAttribute('role', 'textbox');
      b.setAttribute('aria-multiline', 'true');
      try { b.contentEditable = 'plaintext-only'; } catch (err) { /* older engines */ }
      if (b.contentEditable !== 'plaintext-only') b.contentEditable = 'true';
      b.addEventListener('focus', () => { pane.classList.add('editing'); setFoot('Editing · click outside to reset'); });
      b.addEventListener('blur', () => {
        pane.classList.remove('editing');
        const key = path === 'cloud' ? 'cloud-' + lang : 'local';
        setFoot(meta[key][1]);
        if (b.textContent !== plain.get(b)) revert(b);
      });
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); b.blur(); }
        else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, '  '); }
      });
      b.addEventListener('paste', (e) => {
        if (b.contentEditable === 'plaintext-only') return;
        e.preventDefault();
        document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text'));
      });
    });
    render();
    requestAnimationFrame(() => requestAnimationFrame(() => { ind.classList.add('live'); segInd.classList.add('live'); }));
  }

  /* ---------- 11. Bento mocks: traffic chart data, then reveal each panel as it scrolls in ---------- */
  {
    const N = 41, budget = 95, yOf = (v) => 205 - v;
    const req = Array.from({ length: N }, (_, i) => 42 + 16 * Math.sin(i * 0.55) + 6 * Math.sin(i * 2.3) + 118 * Math.exp(-Math.pow((i - 23) / 4.2, 2)) + 40 * Math.exp(-Math.pow((i - 9) / 2.2, 2)));
    const X = (i) => (i * 1000) / (N - 1);
    const pathOf = (vals) => vals.map((v, i) => (i ? 'L' : 'M') + f(X(i)) + ' ' + f(yOf(v))).join('');
    $('sc-req').setAttribute('d', pathOf(req));
    $('sc-run').setAttribute('d', pathOf(req.map((v) => Math.min(v, budget))));
    $('sc-budget').setAttribute('d', 'M0 ' + yOf(budget) + ' H1000');
    $('sc-q').setAttribute('d', pathOf(req.map((v) => Math.max(v, budget))) + 'L1000 ' + yOf(budget) + 'L0 ' + yOf(budget) + 'Z');

    if (!reduce && io) {
      const cells = Array.from(document.querySelectorAll('#bento .cell'));
      const ob = new IntersectionObserver((en) => en.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.remove('arm'); ob.unobserve(e.target); }
      }), { threshold: 0.35 });
      cells.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.top > window.innerHeight) { c.classList.add('arm'); ob.observe(c); }
      });
    }
  }

  /* ---------- 12. FAQ: animated accordion, one answer open at a time ----------
   * Clicking a question is intercepted so the <details> can slide open or shut
   * instead of jumping. Opening one answer closes any other open answer.
   * Height animates between "question only" and "question + answer" while the
   * answer fades in or out. Clicking again mid-animation reverses from wherever
   * it is. Reduced-motion visitors get the instant toggle. Without JS, the
   * <details> still work, they just don't animate or close each other. */
  {
    const items = Array.from(document.querySelectorAll('#faq details'));
    const DUR = 420, EASE = 'cubic-bezier(.22, .8, .24, 1)';  // same easing as the sliding indicators
    const anims = new Map();   // details -> running [height, fade] animations
    const target = new Map();  // details -> true (opening) / false (closing)

    // Height of a <details> showing only its question: summary + padding + bottom border
    const closedHeight = (d) => {
      const cs = getComputedStyle(d);
      return d.querySelector('summary').offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
    };

    const set = (d, open) => {
      if ((target.has(d) ? target.get(d) : d.open) === open) return;
      target.set(d, open);
      if (reduce || !d.animate) { d.open = open; target.delete(d); return; }
      const from = d.offsetHeight;                // current height, even mid-animation
      if (anims.has(d)) anims.get(d).forEach((x) => x.cancel());
      d.open = true;                              // answer must be in the page to measure and fade it
      const to = open ? d.offsetHeight : closedHeight(d);
      d.style.overflow = 'hidden';
      const a = d.animate({ height: [from + 'px', to + 'px'] }, { duration: DUR, easing: EASE });
      // fade the answer; it holds its end state until the height animation finishes
      const fade = d.querySelector('p').animate({ opacity: open ? [0, 1] : [1, 0] }, { duration: open ? DUR : DUR * 0.6, easing: EASE, fill: 'forwards' });
      anims.set(d, [a, fade]);
      a.onfinish = () => {
        fade.cancel();
        anims.delete(d); target.delete(d);
        d.style.overflow = '';
        if (!open) d.open = false;
      };
    };

    items.forEach((d) => d.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      const opening = !(target.has(d) ? target.get(d) : d.open);
      if (opening) items.forEach((o) => { if (o !== d) set(o, false); });
      set(d, opening);
    }));
  }

  /* Start the shared animation loop (skipped entirely for reduced motion). */
  if (!reduce) requestAnimationFrame(frame);
})();
