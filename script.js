/* ════════════════════════════════════════════════════
   0 · helpers
   ════════════════════════════════════════════════════ */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const finePointer=matchMedia('(pointer:fine)').matches;

/* ════════════════════════════════════════════════════
   1 · CUSTOM CURSOR (lerp follower)
   ════════════════════════════════════════════════════ */
if(finePointer){
  const dot=document.querySelector('.cursor-dot');
  const fol=document.querySelector('.cursor-follower');
  let mx=innerWidth/2,my=innerHeight/2,fx=mx,fy=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  (function loop(){fx=lerp(fx,mx,.18);fy=lerp(fy,my,.18);fol.style.transform=`translate(${fx}px,${fy}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
  const hov='a,button,input,select,textarea,label,.card,.gitem,.faq-q,.tab-btn,.step';
  document.querySelectorAll(hov).forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-active'));
  });
  // dark/light cursor depending on section under the pointer
  const darkZones=()=>[...document.querySelectorAll('.hero,.dark-sec,.break,.contact,.cta-banner,footer')];
  addEventListener('mousemove',e=>{
    const onDark=darkZones().some(s=>{const r=s.getBoundingClientRect();return e.clientY>=r.top&&e.clientY<=r.bottom;});
    document.body.classList.toggle('cursor-dark',onDark);
  });
}

/* ════════════════════════════════════════════════════
   2 · SCROLL PROGRESS + NAV STATE + FLOATING CTA
   ════════════════════════════════════════════════════ */
const progress=document.getElementById('progress');
const nav=document.getElementById('nav');
const floatCta=document.getElementById('floatCta');
function onScrollUI(){
  const h=document.documentElement;
  const max=h.scrollHeight-h.clientHeight;
  const p=max>0?h.scrollTop/max:0;
  progress.style.width=(p*100)+'%';
  nav.classList.toggle('is-scrolled',h.scrollTop>40);
  floatCta.classList.toggle('show',p>.55);
}
addEventListener('scroll',onScrollUI,{passive:true});
onScrollUI();

/* mobile nav */
const burger=document.getElementById('burger');
const navLinks=document.getElementById('navLinks');
burger.addEventListener('click',()=>navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));

/* ════════════════════════════════════════════════════
   3 · HERO — scroll-driven rotating views
   ════════════════════════════════════════════════════ */
(function(){
  const hero=document.getElementById('top');
  if(!hero)return;
  const frames=[...hero.querySelectorAll('.hf')];
  const heroUi=document.getElementById('heroUi');
  const capEl=document.getElementById('hCap');
  const idxEl=document.getElementById('hIdx');
  const dots=[...document.querySelectorAll('#hRail .dot')];
  const n=frames.length;
  let lastIdx=-1;
  // entrance
  requestAnimationFrame(()=>requestAnimationFrame(()=>heroUi.classList.add('lit')));

  function render(){
    const rect=hero.getBoundingClientRect();
    const total=hero.offsetHeight-innerHeight;
    const prog=clamp(-rect.top/total,0,1);
    const f=prog*(n-1);
    frames.forEach((el,i)=>{
      const o=clamp(1-Math.abs(f-i),0,1);
      el.style.opacity=o;
      el.style.transform='scale('+(1.10-0.10*o)+')';
    });
    const idx=clamp(Math.round(f),0,n-1);
    if(idx!==lastIdx){
      lastIdx=idx;
      idxEl.textContent=String(idx+1).padStart(2,'0');
      capEl.style.opacity=0;
      setTimeout(()=>{capEl.textContent=frames[idx].dataset.cap;capEl.style.opacity=1;},180);
      dots.forEach((d,i)=>d.classList.toggle('on',i===idx));
    }
    // hand off UI near the end
    const fade=1-clamp((prog-.82)/.18,0,1);
    heroUi.style.opacity=fade;
    heroUi.style.transform='translateY('+(-(1-fade)*40)+'px)';
  }
  let ticking=false;
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{render();ticking=false;});ticking=true;}},{passive:true});
  addEventListener('resize',render);
  render();
})();

/* ════════════════════════════════════════════════════
   4 · INTERSECTION OBSERVER (reveal · split · counters)
   ════════════════════════════════════════════════════ */
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('is-visible');
    if(e.target.classList.contains('counter'))runCounter(e.target);
    io.unobserve(e.target);
  });
},{threshold:.18,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.fade-up,.split-title,.counter').forEach(el=>io.observe(el));

/* counters */
function runCounter(el){
  const target=parseFloat(el.dataset.target||'0');
  const suffix=el.dataset.suffix||'';
  const dur=1300;const t0=performance.now();
  function tick(now){
    const p=clamp((now-t0)/dur,0,1);
    const e=1-Math.pow(1-p,3); // cubic out
    el.textContent=Math.round(target*e)+suffix;
    if(p<1)requestAnimationFrame(tick);else el.textContent=target+suffix;
  }
  requestAnimationFrame(tick);
}

/* ════════════════════════════════════════════════════
   5 · TABS
   ════════════════════════════════════════════════════ */
const _tn=document.getElementById('tabsNav');
if(_tn)_tn.addEventListener('click',e=>{
  const btn=e.target.closest('.tab-btn');if(!btn)return;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector('.tab-panel[data-panel="'+btn.dataset.tab+'"]').classList.add('active');
});

/* ════════════════════════════════════════════════════
   6 · FAQ ACCORDION
   ════════════════════════════════════════════════════ */
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement;
    const a=item.querySelector('.faq-a');
    const open=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>{i.classList.remove('open');i.querySelector('.faq-a').style.maxHeight=null;});
    if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+40+'px';}
  });
});
// open first by default
(function(){const first=document.querySelector('.faq-item.open .faq-a');if(first)first.style.maxHeight=first.scrollHeight+40+'px';})();

/* ════════════════════════════════════════════════════
   7 · FORM + THANK YOU OVERLAY
   ════════════════════════════════════════════════════ */
const form=document.getElementById('leadForm');
if(form){
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    // persist intent (optional) then go to the thank-you page
    try{ sessionStorage.setItem('cjs_lead','1'); }catch(_){}
    window.location.href='gracias.html';
  });
}

/* ════════════════════════════════════════════════════
   8 · PARALLAX on full-width break
   ════════════════════════════════════════════════════ */
if(!reduce && document.getElementById('breakBg')){
  const bg=document.getElementById('breakBg');
  const sec=bg.closest('section')||bg.parentElement;
  if(sec)
  addEventListener('scroll',()=>{
    const r=sec.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)return;
    const off=(r.top-innerHeight/2)*-0.08;
    bg.style.transform='translateY('+off+'px) scale(1.12)';
  },{passive:true});
}

/* ════════════════════════════════════════════════════
   9 · FOOTER PARTICLES (subtle gold dust)
   ════════════════════════════════════════════════════ */
(function(){
  if(reduce)return;
  const c=document.getElementById('footCanvas');if(!c)return;const ctx=c.getContext('2d');
  const dpr=Math.min(devicePixelRatio||1,2);let W,H,pts=[];
  function size(){W=c.width=c.offsetWidth*dpr;H=c.height=c.offsetHeight*dpr;}
  size();addEventListener('resize',size);
  for(let i=0;i<46;i++)pts.push({x:Math.random(),y:Math.random(),r:(Math.random()*1.4+.3)*dpr,vx:(Math.random()-.5)*.0004,vy:(Math.random()-.5)*.0003,a:Math.random()*.4+.1});
  (function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=1;if(p.x>1)p.x=0;if(p.y<0)p.y=1;if(p.y>1)p.y=0;
      ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.r,0,7);ctx.fillStyle='rgba(207,190,134,'+p.a+')';ctx.fill();});
    requestAnimationFrame(draw);
  })();
})();