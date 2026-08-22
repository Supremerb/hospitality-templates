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

/* ═══ 3D DISH CAROUSEL ═══ */
(function(){
  /* CHANGE: real signature dishes + photos you took */
  const DISHES = [
    {img:'https://picsum.photos/seed/dish-1/700/700', name:'Whole flounder'},
    {img:'https://picsum.photos/seed/dish-2/700/700', name:'Dry-aged sirloin'},
    {img:'https://picsum.photos/seed/dish-3/700/700', name:'Ember celeriac'},
    {img:'https://picsum.photos/seed/dish-4/700/700', name:'Wallaby tartare'},
    {img:'https://picsum.photos/seed/dish-5/700/700', name:'Bruny Island oysters'},
    {img:'https://picsum.photos/seed/dish-6/700/700', name:'Burnt honey custard'}
  ];
  const car = document.getElementById('car'), wrap = document.getElementById('carWrap');
  const label = document.getElementById('carLabel');
  const N = DISHES.length, STEP = 360 / N, R = 185;
  let angle = 0, timer = null, drag = null;

  DISHES.forEach((d, i) => {
    const fig = document.createElement('figure');
    fig.className = 'plate';
    fig.style.transform = `rotateY(${i*STEP}deg) translateZ(${R}px)`;
    fig.innerHTML = `<img src="${d.img}" alt="${d.name}" loading="lazy"><figcaption>${d.name}</figcaption>`;
    car.appendChild(fig);
  });

  const render = () => {
    car.style.transform = `rotateY(${angle}deg)`;
    const i = ((Math.round(-angle / STEP) % N) + N) % N;
    label.textContent = DISHES[i].name;
  };
  const go = d => { angle += d * STEP; render(); restart(); };
  const restart = () => { clearInterval(timer); if (!calm) timer = setInterval(() => { angle -= STEP; render(); }, 4200); };

  document.getElementById('carPrev').addEventListener('click', () => go(1));
  document.getElementById('carNext').addEventListener('click', () => go(-1));

  wrap.addEventListener('pointerdown', e => {
    drag = {x:e.clientX, a:angle}; car.classList.add('spinning'); wrap.classList.add('drag');
    clearInterval(timer); wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', e => {
    if (!drag) return;
    angle = drag.a + (e.clientX - drag.x) * 0.35; render();
  });
  const release = () => {
    if (!drag) return;
    drag = null; car.classList.remove('spinning'); wrap.classList.remove('drag');
    angle = Math.round(angle / STEP) * STEP; render(); restart();
  };
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  render(); restart();
})();

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

/* ═══ opening hours — CHANGE: 24h decimals, null = closed, 0 = Sunday ═══ */
const HOURS = {0:[17.5,22.5],1:null,2:null,3:[17.5,22.5],4:[17.5,22.5],5:[17.5,22.5],6:[17.5,22.5]};
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fmt = h => { const hr = Math.floor(h), mn = Math.round((h-hr)*60); return `${hr}:${String(mn).padStart(2,'0')}`; };
function status(){
  const now = new Date(), d = now.getDay(), t = now.getHours()+now.getMinutes()/60, today = HOURS[d];
  const dot = document.getElementById('dot'), txt = document.getElementById('statusText');
  document.querySelectorAll('#hoursTable tr').forEach(r => r.classList.toggle('today', +r.dataset.day === d));
  if (today && t >= today[0] && t < today[1]){ dot.classList.remove('shut'); txt.textContent = `Serving now — until ${fmt(today[1])}`; return; }
  dot.classList.add('shut');
  if (today && t < today[0]){ txt.textContent = `Doors open today at ${fmt(today[0])}`; return; }
  for (let i = 1; i <= 7; i++){ const k = (d+i)%7, n = HOURS[k];
    if (n){ txt.textContent = `Closed — opens ${i===1?'tomorrow':DAYS[k]} at ${fmt(n[0])}`; return; } }
  txt.textContent = 'Closed';
}
status(); setInterval(status, 60000);

/* accordion */
(function(){
  const btns = [...document.querySelectorAll('.acc-btn')];
  btns.forEach(btn => {
    const body = btn.nextElementSibling;
    if (btn.getAttribute('aria-expanded') === 'true') body.style.height = body.firstElementChild.offsetHeight + 'px';
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btns.forEach(b => {
        b.setAttribute('aria-expanded','false');
        b.nextElementSibling.style.height = '0px';
      });
      if (!open){
        btn.setAttribute('aria-expanded','true');
        body.style.height = body.firstElementChild.offsetHeight + 'px';
      }
    });
  });
})();

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

/* reservation validation (client-side only) */
(function(){
  const f = document.getElementById('form'), msg = document.getElementById('formMsg');
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('rdate').min = today;
  const rules = [
    ['rname','e-name', v => v.trim().length >= 2, 'Please enter your name.'],
    ['rphone','e-phone', v => v.replace(/\D/g,'').length >= 8, 'Please enter a contact number.'],
    ['remail','e-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Please enter a valid email.'],
    ['rdate','e-date', v => !!v && v >= today, 'Please choose a date from today onward.']
  ];
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    rules.forEach(([id,eid,test,text]) => {
      const el = document.getElementById(id), good = test(el.value);
      document.getElementById(eid).textContent = good ? '' : text;
      if (!good) ok = false;
    });
    msg.textContent = ok
      ? 'Thanks — connect this form to Netlify Forms or a booking provider to receive requests.'
      : '';
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
