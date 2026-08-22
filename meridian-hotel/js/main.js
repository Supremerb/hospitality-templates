'use strict';
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;

/* preloader */
(function(){
  const bar = document.getElementById('preBar'), pre = document.getElementById('pre');
  let p = 0;
  const t = setInterval(() => { p = Math.min(100, p + Math.random()*22); bar.style.width = p+'%'; }, 130);
  addEventListener('load', () => { clearInterval(t); bar.style.width='100%'; setTimeout(()=>pre.classList.add('done'),450); });
  setTimeout(()=>{ clearInterval(t); bar.style.width='100%'; pre.classList.add('done'); }, 4000);
})();

/* ═══ ROOMS — CHANGE: real rooms, rates and photos ═══ */
const ROOMS = [
  {img:'https://picsum.photos/seed/room-1/900/1000', name:'Harbour Single', meta:'1 guest · 18m²', rate:'$180'},
  {img:'https://picsum.photos/seed/room-2/900/1000', name:'Esplanade Queen', meta:'2 guests · 26m²', rate:'$245'},
  {img:'https://picsum.photos/seed/room-3/900/1000', name:'Bath House Room', meta:'2 guests · 30m² · terrace', rate:'$310'},
  {img:'https://picsum.photos/seed/room-4/900/1000', name:'Corner Suite', meta:'2 guests · 38m² · bath', rate:'$390'},
  {img:'https://picsum.photos/seed/room-5/900/1000', name:'The Loft', meta:'4 guests · 52m² · kitchen', rate:'$460'}
];

/* ═══ 3D COVERFLOW ═══ */
(function(){
  const flow = document.getElementById('flow'), wrap = document.getElementById('flowWrap');
  const label = document.getElementById('flowLabel');
  const N = ROOMS.length;
  let cur = Math.floor(N/2), timer = null, drag = null;

  ROOMS.forEach(r => {
    const el = document.createElement('article');
    el.className = 'room';
    el.innerHTML = `<img src="${r.img}" alt="${r.name}" loading="lazy">
      <div class="room-info"><h3>${r.name}</h3>
      <div class="meta"><span>${r.meta}</span><span class="rate">${r.rate} / night</span></div></div>`;
    flow.appendChild(el);
  });
  const cards = [...flow.children];

  function render(){
    cards.forEach((c,i) => {
      const d = i - cur, abs = Math.abs(d);
      c.style.transform =
        `translateX(${d * 46}%) translateZ(${-abs * 190}px) rotateY(${d * -32}deg) scale(${1 - abs*0.06})`;
      c.style.opacity = abs > 2 ? 0 : 1 - abs * 0.22;
      c.style.zIndex = String(N - abs);
      c.style.pointerEvents = abs > 2 ? 'none' : 'auto';
    });
    label.textContent = `${cur + 1} of ${N} · ${ROOMS[cur].rate}`;
  }
  function go(d){ cur = Math.max(0, Math.min(N-1, cur + d)); render(); restart(); }
  function restart(){
    clearInterval(timer);
    if (!calm) timer = setInterval(() => { cur = (cur + 1) % N; render(); }, 5000);
  }

  document.getElementById('flowPrev').addEventListener('click', () => go(-1));
  document.getElementById('flowNext').addEventListener('click', () => go(1));
  cards.forEach((c,i) => c.addEventListener('click', () => { cur = i; render(); restart(); }));

  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); go(1); }
  });

  wrap.addEventListener('pointerdown', e => {
    drag = {x:e.clientX, c:cur}; wrap.classList.add('drag');
    clearInterval(timer); wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', e => {
    if (!drag) return;
    const shift = Math.round((drag.x - e.clientX) / 110);
    const next = Math.max(0, Math.min(N-1, drag.c + shift));
    if (next !== cur){ cur = next; render(); }
  });
  const release = () => { if (!drag) return; drag = null; wrap.classList.remove('drag'); restart(); };
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  render(); restart();
})();

/* ═══ BOOKING WIDGET ═══
   Rate estimate only — a real deployment must read live availability
   from the property's booking system. Never let a static page be the
   source of truth for price or availability. */
(function(){
  const inEl = document.getElementById('bin'), outEl = document.getElementById('bout');
  const nightsEl = document.getElementById('nights'), out = document.getElementById('bOut');
  const guests = document.getElementById('bguests');
  const today = new Date(), iso = d => d.toISOString().split('T')[0];
  const tmr = new Date(today.getTime() + 864e5);

  inEl.min = iso(today); outEl.min = iso(tmr);
  inEl.value = iso(tmr);
  outEl.value = iso(new Date(today.getTime() + 3*864e5));

  const BASE = 245; /* CHANGE: indicative base rate */

  function nights(){
    const a = new Date(inEl.value), b = new Date(outEl.value);
    return Math.round((b - a) / 864e5);
  }
  function sync(){
    const min = new Date(new Date(inEl.value).getTime() + 864e5);
    outEl.min = iso(min);
    if (new Date(outEl.value) <= new Date(inEl.value)) outEl.value = iso(min);
    const n = nights();
    nightsEl.textContent = n > 0 ? `${n} night${n > 1 ? 's' : ''}` : '—';
  }
  inEl.addEventListener('change', sync);
  outEl.addEventListener('change', sync);
  sync();

  document.getElementById('bCheck').addEventListener('click', () => {
    const n = nights();
    if (n < 1){ out.textContent = 'Please choose a check-out date after check-in.'; return; }
    const g = +guests.value;
    const est = BASE * n + (g > 2 ? (g - 2) * 45 * n : 0);
    out.textContent = `${n} night${n>1?'s':''}, ${g} guest${g>1?'s':''} — from $${est} total. Call 03 6375 1800 to confirm.`;
  });

  /* hero availability chip */
  const av = document.getElementById('availText');
  const day = today.getDay();
  av.textContent = (day === 5 || day === 6)
    ? 'Limited rooms this weekend'
    : 'Rooms available this week';
})();

/* hero parallax bands */
if (!calm){
  const b1 = document.getElementById('b1'), b2 = document.getElementById('b2'), b3 = document.getElementById('b3');
  addEventListener('scroll', () => {
    const y = scrollY;
    if (y > innerHeight * 1.2) return;
    b1.style.transform = `translateY(${y * .18}px)`;
    b2.style.transform = `translateY(${y * .11}px)`;
    b3.style.transform = `translateY(${y * .05}px)`;
  }, {passive:true});
}

/* magnetic buttons */
if (fine && !calm){
  document.querySelectorAll('.mag').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX-r.left-r.width/2)*.2).toFixed(1)}px,${((e.clientY-r.top-r.height/2)*.3).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform=''; });
  });
}

/* reveals + counters */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.1, rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, to = parseFloat(el.dataset.to), sfx = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1400;
  (function step(now){
    const k = Math.min(1,(now-t0)/dur), eased = 1 - Math.pow(1-k,3);
    el.textContent = Math.round(to*eased) + sfx;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
  cio.unobserve(el);
}), {threshold:.5});
document.querySelectorAll('.count').forEach(el => cio.observe(el));

/* nav, progress, drawer */
const nav = document.getElementById('nav'), prog = document.getElementById('prog');
function onScroll(){
  nav.classList.toggle('stuck', scrollY > 40);
  const h = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (h > 0 ? (scrollY/h)*100 : 0) + '%';
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

/* reviews slider */
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
    i = (k+n)%n;
    track.style.transform = `translateX(-${i*100}%)`;
    [...dots.children].forEach((d,j) => d.setAttribute('aria-current', j===i));
    clearInterval(timer); if (!calm) timer = setInterval(() => go(i+1), 6500);
  }
  go(0);
})();

/* contact form (client-side only) */
(function(){
  const f = document.getElementById('form'), msg = document.getElementById('formMsg');
  const rules = [
    ['cname','e-name', v => v.trim().length >= 2, 'Please enter your name.'],
    ['cemail','e-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Please enter a valid email.'],
    ['cmsg','e-msg', v => v.trim().length >= 10, 'A little more detail, please.']
  ];
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    rules.forEach(([id,eid,test,text]) => {
      const el = document.getElementById(id), good = test(el.value);
      document.getElementById(eid).textContent = good ? '' : text;
      if (!good) ok = false;
    });
    msg.textContent = ok ? 'Thanks — connect this form to Netlify Forms or your booking system to receive it.' : '';
  });
})();

/* ═══ ZOOM LIGHTBOX ═══ */
(function(){
  const lb = document.getElementById('lb'), view = document.getElementById('lbView'), img = document.getElementById('lbImg');
  const zVal = document.getElementById('zVal');
  const shots = [...document.querySelectorAll('#gal button')];
  const srcs = shots.map(b => { const i = b.querySelector('img'); return {src:i.src, alt:i.alt}; });
  let idx = 0, scale = 1, tx = 0, ty = 0, last = null, opener = null;
  const MIN = 1, MAX = 6;

  const apply = () => {
    img.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    zVal.textContent = Math.round(scale*100) + '%';
    view.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  };
  const reset = () => { scale = 1; tx = 0; ty = 0; apply(); };
  const clamp = () => { const lim = (scale-1)*260; tx = Math.max(-lim,Math.min(lim,tx)); ty = Math.max(-lim,Math.min(lim,ty)); };
  const load = i => { idx = (i+srcs.length)%srcs.length; img.src = srcs[idx].src; img.alt = srcs[idx].alt; reset(); };
  const open = i => { opener = shots[i]; load(i); lb.classList.add('open'); document.body.classList.add('locked'); document.getElementById('lbClose').focus(); };
  const close = () => { lb.classList.remove('open'); document.body.classList.remove('locked'); if (opener) opener.focus(); };

  shots.forEach((b,i) => b.addEventListener('click', () => open(i)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => load(idx-1));
  document.getElementById('lbNext').addEventListener('click', () => load(idx+1));
  document.getElementById('zIn').addEventListener('click', () => { scale = Math.min(MAX, scale*1.4); clamp(); apply(); });
  document.getElementById('zOut').addEventListener('click', () => { scale = Math.max(MIN, scale/1.4); clamp(); apply(); });
  document.getElementById('zReset').addEventListener('click', reset);
  lb.addEventListener('click', e => { if (e.target === lb || e.target === view) close(); });

  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') load(idx-1);
    if (e.key === 'ArrowRight') load(idx+1);
    if (e.key === '+' || e.key === '=') { scale = Math.min(MAX, scale*1.3); clamp(); apply(); }
    if (e.key === '-') { scale = Math.max(MIN, scale/1.3); clamp(); apply(); }
    if (e.key === '0') reset();
  });

  view.addEventListener('wheel', e => {
    e.preventDefault();
    const prev = scale;
    scale = Math.max(MIN, Math.min(MAX, scale * (e.deltaY < 0 ? 1.16 : 1/1.16)));
    const r = img.getBoundingClientRect();
    const ox = e.clientX - (r.left + r.width/2), oy = e.clientY - (r.top + r.height/2);
    tx -= ox*(scale/prev - 1); ty -= oy*(scale/prev - 1);
    if (scale === MIN){ tx = 0; ty = 0; }
    clamp(); apply();
  }, {passive:false});

  img.addEventListener('dblclick', () => { scale = scale > 1 ? 1 : 2.6; tx = 0; ty = 0; apply(); });

  view.addEventListener('pointerdown', e => {
    if (scale <= 1) return;
    last = {x:e.clientX,y:e.clientY}; view.classList.add('dragging','grabbing'); view.setPointerCapture(e.pointerId);
  });
  view.addEventListener('pointermove', e => {
    if (!last) return;
    tx += e.clientX-last.x; ty += e.clientY-last.y; last = {x:e.clientX,y:e.clientY}; clamp(); apply();
  });
  const stop = () => { last = null; view.classList.remove('dragging','grabbing'); };
  view.addEventListener('pointerup', stop); view.addEventListener('pointercancel', stop);

  let pinch = null;
  view.addEventListener('touchstart', e => {
    if (e.touches.length === 2){ const [a,b] = e.touches;
      pinch = {d: Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY), s: scale}; }
  }, {passive:true});
  view.addEventListener('touchmove', e => {
    if (pinch && e.touches.length === 2){
      e.preventDefault();
      const [a,b] = e.touches, d = Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY);
      scale = Math.max(MIN, Math.min(MAX, pinch.s * (d/pinch.d)));
      if (scale === MIN){ tx = 0; ty = 0; }
      clamp(); apply();
    }
  }, {passive:false});
  view.addEventListener('touchend', () => { pinch = null; }, {passive:true});
})();

document.getElementById('year').textContent = new Date().getFullYear();
