'use strict';
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;

/* ─── preloader ─── */
(function(){
  const bar = document.getElementById('preBar'), pre = document.getElementById('pre');
  let p = 0;
  const tick = setInterval(() => { p = Math.min(100, p + Math.random() * 22); bar.style.width = p + '%'; }, 130);
  addEventListener('load', () => {
    clearInterval(tick); bar.style.width = '100%';
    setTimeout(() => pre.classList.add('done'), 420);
  });
  setTimeout(() => { clearInterval(tick); bar.style.width = '100%'; pre.classList.add('done'); }, 4000);
})();

/* ─── build 3D cup ─── */
(function(){
  const cup = document.getElementById('cup'), N = 40, R = 92;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++){
    const s = document.createElement('div'); s.className = 'seg';
    const a = (360 / N) * i;
    s.style.transform = `translateY(-75px) rotateY(${a}deg) translateZ(${R}px)`;
    const shade = 0.42 + 0.58 * Math.max(0, Math.cos((a - 40) * Math.PI / 180));
    s.style.filter = `brightness(${(0.5 + shade * 0.62).toFixed(3)})`;
    frag.appendChild(s);
  }
  cup.appendChild(frag);
})();

/* ─── hero parallax + card tilt ─── */
if (fine && !calm){
  const hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  });
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx',0); hero.style.setProperty('--my',0); });

  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.transform = `rotateY(${((px-.5)*11).toFixed(2)}deg) rotateX(${((.5-py)*11).toFixed(2)}deg) translateZ(10px)`;
      c.style.setProperty('--gx', (px*100).toFixed(1)+'%'); c.style.setProperty('--gy', (py*100).toFixed(1)+'%');
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });

  /* magnetic buttons */
  document.querySelectorAll('.mag').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX-r.left-r.width/2)*.22).toFixed(1)}px,${((e.clientY-r.top-r.height/2)*.32).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ─── opening hours — CHANGE: 24h decimals, null = closed, 0 = Sunday ─── */
const HOURS = {0:[8,14],1:null,2:[7,15],3:[7,15],4:[7,15],5:[7,15],6:[8,14]};
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fmt = h => { const hr = Math.floor(h), mn = Math.round((h-hr)*60); return `${hr}:${String(mn).padStart(2,'0')}`; };
function status(){
  const now = new Date(), d = now.getDay(), t = now.getHours() + now.getMinutes()/60, today = HOURS[d];
  const dot = document.getElementById('dot'), txt = document.getElementById('statusText');
  document.querySelectorAll('#hoursTable tr').forEach(r => r.classList.toggle('today', +r.dataset.day === d));
  if (today && t >= today[0] && t < today[1]){ dot.classList.remove('shut'); txt.textContent = `Open now — until ${fmt(today[1])}`; return; }
  dot.classList.add('shut');
  if (today && t < today[0]){ txt.textContent = `Opens today at ${fmt(today[0])}`; return; }
  for (let i = 1; i <= 7; i++){ const k = (d+i)%7, n = HOURS[k];
    if (n){ txt.textContent = `Closed — opens ${i===1?'tomorrow':DAYS[k]} at ${fmt(n[0])}`; return; } }
  txt.textContent = 'Closed';
}
status(); setInterval(status, 60000);

/* ─── tabs ─── */
const tabs = [...document.querySelectorAll('.tab')];
tabs.forEach((tab,i) => {
  tab.addEventListener('click', () => pick(i));
  tab.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') pick((i+1)%tabs.length, true);
    if (e.key === 'ArrowLeft') pick((i-1+tabs.length)%tabs.length, true);
  });
});
function pick(i, focus){
  tabs.forEach((t,j) => { const on = i===j; t.setAttribute('aria-selected', on);
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
  if (focus) tabs[i].focus();
}

/* ─── reveals + counters ─── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.1, rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), sfx = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1400;
  (function step(now){
    const k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
    el.textContent = (to * eased).toFixed(dec) + sfx;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
  cio.unobserve(el);
}), {threshold:.5});
document.querySelectorAll('.count').forEach(el => cio.observe(el));

/* ─── nav + progress + drawer ─── */
const nav = document.getElementById('nav'), prog = document.getElementById('prog');
function onScroll(){
  nav.classList.toggle('stuck', scrollY > 40);
  const h = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
}
onScroll(); addEventListener('scroll', onScroll, {passive:true});

const burger = document.getElementById('burger'), drawer = document.getElementById('drawer');
burger.addEventListener('click', () => {
  const open = drawer.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.classList.toggle('locked', open);
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  drawer.classList.remove('open'); burger.classList.remove('open');
  burger.setAttribute('aria-expanded','false'); document.body.classList.remove('locked');
}));

/* ─── testimonial slider ─── */
(function(){
  const track = document.getElementById('track'), dots = document.getElementById('dots');
  const n = track.children.length; let i = 0, timer;
  for (let k = 0; k < n; k++){
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Review ${k+1}`);
    b.addEventListener('click', () => go(k));
    dots.appendChild(b);
  }
  function go(k){
    i = (k + n) % n;
    track.style.transform = `translateX(-${i*100}%)`;
    [...dots.children].forEach((d,j) => d.setAttribute('aria-current', j===i));
    clearInterval(timer); if (!calm) timer = setInterval(() => go(i+1), 6000);
  }
  go(0);
})();

/* ─── form validation (client-side only; no backend to attack) ─── */
(function(){
  const f = document.getElementById('form'), msg = document.getElementById('formMsg');
  const rules = [
    ['fname','e-name', v => v.trim().length >= 2, 'Please enter your name.'],
    ['femail','e-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Please enter a valid email.'],
    ['fmsg','e-msg', v => v.trim().length >= 10, 'A little more detail, please.']
  ];
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    rules.forEach(([id, eid, test, text]) => {
      const el = document.getElementById(id), good = test(el.value);
      document.getElementById(eid).textContent = good ? '' : text;
      if (!good) ok = false;
    });
    msg.textContent = ok
      ? 'Thanks — connect this form to Netlify Forms or Formspree to receive it.'
      : '';
  });
})();

/* ═══════════ ZOOM LIGHTBOX ═══════════ */
(function(){
  const lb = document.getElementById('lb'), view = document.getElementById('lbView'), img = document.getElementById('lbImg');
  const zVal = document.getElementById('zVal');
  const shots = [...document.querySelectorAll('#gal button')];
  const srcs = shots.map(b => { const i = b.querySelector('img'); return {src:i.src, alt:i.alt}; });
  let idx = 0, scale = 1, tx = 0, ty = 0, last = null, opener = null;
  const MIN = 1, MAX = 6;

  const apply = () => {
    img.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    zVal.textContent = Math.round(scale * 100) + '%';
    view.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  };
  const reset = () => { scale = 1; tx = 0; ty = 0; apply(); };
  const clamp = () => {
    const lim = (scale - 1) * 260;
    tx = Math.max(-lim, Math.min(lim, tx)); ty = Math.max(-lim, Math.min(lim, ty));
  };
  const load = i => { idx = (i + srcs.length) % srcs.length; img.src = srcs[idx].src; img.alt = srcs[idx].alt; reset(); };

  const open = i => {
    opener = shots[i]; load(i);
    lb.classList.add('open'); document.body.classList.add('locked');
    document.getElementById('lbClose').focus();
  };
  const close = () => {
    lb.classList.remove('open'); document.body.classList.remove('locked');
    if (opener) opener.focus();
  };

  shots.forEach((b,i) => b.addEventListener('click', () => open(i)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => load(idx - 1));
  document.getElementById('lbNext').addEventListener('click', () => load(idx + 1));
  document.getElementById('zIn').addEventListener('click', () => { scale = Math.min(MAX, scale * 1.4); clamp(); apply(); });
  document.getElementById('zOut').addEventListener('click', () => { scale = Math.max(MIN, scale / 1.4); clamp(); apply(); });
  document.getElementById('zReset').addEventListener('click', reset);

  lb.addEventListener('click', e => { if (e.target === lb || e.target === view) close(); });

  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') load(idx - 1);
    if (e.key === 'ArrowRight') load(idx + 1);
    if (e.key === '+' || e.key === '=') { scale = Math.min(MAX, scale * 1.3); clamp(); apply(); }
    if (e.key === '-') { scale = Math.max(MIN, scale / 1.3); clamp(); apply(); }
    if (e.key === '0') reset();
  });

  /* wheel zoom toward cursor */
  view.addEventListener('wheel', e => {
    e.preventDefault();
    const prev = scale;
    scale = Math.max(MIN, Math.min(MAX, scale * (e.deltaY < 0 ? 1.16 : 1/1.16)));
    const r = img.getBoundingClientRect();
    const ox = e.clientX - (r.left + r.width/2), oy = e.clientY - (r.top + r.height/2);
    tx -= ox * (scale/prev - 1); ty -= oy * (scale/prev - 1);
    if (scale === MIN) { tx = 0; ty = 0; }
    clamp(); apply();
  }, {passive:false});

  /* double-click / double-tap toggle */
  img.addEventListener('dblclick', () => { scale = scale > 1 ? 1 : 2.6; tx = 0; ty = 0; apply(); });

  /* drag to pan */
  view.addEventListener('pointerdown', e => {
    if (scale <= 1) return;
    last = {x:e.clientX, y:e.clientY}; view.classList.add('dragging','grabbing');
    view.setPointerCapture(e.pointerId);
  });
  view.addEventListener('pointermove', e => {
    if (!last) return;
    tx += e.clientX - last.x; ty += e.clientY - last.y;
    last = {x:e.clientX, y:e.clientY}; clamp(); apply();
  });
  const stop = () => { last = null; view.classList.remove('dragging','grabbing'); };
  view.addEventListener('pointerup', stop);
  view.addEventListener('pointercancel', stop);

  /* pinch zoom */
  let pinch = null;
  view.addEventListener('touchstart', e => {
    if (e.touches.length === 2){
      const [a,b] = e.touches;
      pinch = {d: Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY), s: scale};
    }
  }, {passive:true});
  view.addEventListener('touchmove', e => {
    if (pinch && e.touches.length === 2){
      e.preventDefault();
      const [a,b] = e.touches;
      const d = Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY);
      scale = Math.max(MIN, Math.min(MAX, pinch.s * (d / pinch.d)));
      if (scale === MIN){ tx = 0; ty = 0; }
      clamp(); apply();
    }
  }, {passive:false});
  view.addEventListener('touchend', () => { pinch = null; }, {passive:true});
})();

document.getElementById('year').textContent = new Date().getFullYear();
