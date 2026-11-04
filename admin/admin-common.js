/* Common admin UI: synchronized theme, animated full-screen space, profile editor. */
(function(){'use strict';
const THEME='nig-admin-theme', PROFILE='nig-admin-profile-v1';
const root=document.documentElement;
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function updateTheme(t,persist){const dark=t==='dark';root.dataset.theme=dark?'dark':'light'; document.querySelectorAll('#theme-toggle').forEach(b=>{b.setAttribute('aria-pressed',String(dark));b.setAttribute('aria-label',dark?'Switch to Day Mode':'Switch to Night Mode');const l=b.querySelector('.toggle-label');if(l)l.textContent=dark?'Night':'Day'});if(persist)safeSet(THEME,dark?'dark':'light');window.dispatchEvent(new Event('nig:admin-themechange'))}
updateTheme(safeGet(THEME)==='dark'?'dark':'light',false);
window.addEventListener('storage',e=>{if(e.key===THEME)updateTheme(e.newValue==='dark'?'dark':'light',false);if(e.key===PROFILE)paintProfile()});
let profile={name:'Admin',email:'',userId:'',role:'Administrator',photo:''};
function readProfile(){try{const p=JSON.parse(safeGet(PROFILE)||'null');if(p&&typeof p==='object'){for(const k of Object.keys(profile)){if(typeof p[k]==='string')profile[k]=p[k]}}}catch(e){} }
function initials(s){return (s||'A').trim().charAt(0).toUpperCase()||'A'}
function paintProfile(){readProfile();document.querySelectorAll('.admin-user').forEach(btn=>{const a=btn.querySelector('.avatar');const txt=btn.querySelector('.admin-display-name');if(a){a.textContent='';a.style.backgroundImage=profile.photo?'url('+JSON.stringify(profile.photo)+')':'';a.style.backgroundSize='cover';a.style.backgroundPosition='center'}if(txt)txt.textContent=profile.name||'Admin'}); const pic=document.getElementById('profile-photo-view');if(pic){pic.textContent=profile.photo?'':initials(profile.name);pic.style.backgroundImage=profile.photo?'url('+JSON.stringify(profile.photo)+')':'';pic.style.backgroundSize='cover';pic.style.backgroundPosition='center'}}
function buildProfile(){const area=document.createElement('div');area.className='admin-profile-overlay';area.id='admin-profile-overlay';area.hidden=true;area.innerHTML=`<section class="admin-profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div class="admin-profile-head"><div><span class="profile-eyebrow">ADMIN ACCOUNT</span><h2 id="profile-title">My profile</h2></div><button type="button" class="profile-close" aria-label="Close profile">×</button></div><form id="admin-profile-form"><div class="profile-photo-row"><div class="profile-photo-view" id="profile-photo-view">A</div><label class="profile-upload">Upload photo<input type="file" id="profile-photo-input" accept="image/png,image/jpeg,image/webp" hidden></label></div><label>Full name<input name="name" autocomplete="name" required maxlength="90"></label><label>Email<input name="email" type="email" autocomplete="email" placeholder="admin@example.com"></label><label>Admin user ID<input name="userId" autocomplete="username" placeholder="Your registered admin ID"></label><label>Role<input name="role" readonly></label><p id="profile-feedback" class="profile-feedback" aria-live="polite"></p><div class="profile-actions"><button type="button" class="profile-close btn-cancel">Cancel</button><button type="submit" class="btn-save-profile">Save profile</button></div></form><a class="admin-profile-logout" data-admin-logout href="admin-login.html">Log out</a><p class="profile-help">Profile information and photo are saved in this browser only. Connect a server to load actual registration details and share them across devices.</p></section>`;document.body.append(area);
const form=area.querySelector('form'), feedback=area.querySelector('#profile-feedback');const open=()=>{readProfile();for(const k of ['name','email','userId','role'])form.elements[k].value=profile[k]||'';paintProfile();area.hidden=false;document.body.classList.add('profile-open');area.querySelector('.profile-close').focus()};const close=()=>{area.hidden=true;document.body.classList.remove('profile-open')};document.querySelectorAll('.admin-user').forEach(b=>b.addEventListener('click',open));area.querySelectorAll('.profile-close').forEach(b=>b.addEventListener('click',close));area.addEventListener('click',e=>{if(e.target===area)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!area.hidden)close()});
form.addEventListener('submit',e=>{e.preventDefault();profile.name=form.elements.name.value.trim()||'Admin';profile.email=form.elements.email.value.trim();profile.userId=form.elements.userId.value.trim();profile.role='Administrator';if(safeSet(PROFILE,JSON.stringify(profile))){feedback.textContent='Profile saved in this browser.';paintProfile()}else feedback.textContent='Unable to save. Try a smaller photo or enable site storage.'});
area.querySelector('#profile-photo-input').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){feedback.textContent='Please choose a JPG, PNG or WebP photo.';return}if(file.size>6*1024*1024){feedback.textContent='Choose a photo smaller than 6 MB.';return}const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const can=document.createElement('canvas'),ctx=can.getContext('2d');can.width=240;can.height=240;const size=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-size)/2,(img.height-size)/2,size,size,0,0,240,240);URL.revokeObjectURL(url);profile.photo=can.toDataURL('image/jpeg',.72);paintProfile();feedback.textContent='Photo ready. Click Save profile to keep it.'};img.onerror=()=>{URL.revokeObjectURL(url);feedback.textContent='Unable to read that image.'};img.src=url})}
function initSpace(){
  if(document.getElementById('admin-space-canvas'))return;
  const c=document.createElement('canvas');c.id='admin-space-canvas';
  c.setAttribute('aria-hidden','true');document.body.prepend(c);
  const ctx=c.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let w=0,h=0,stars=[],offset=0,lastTick=0,frame=0,resizeFrame=0,needsPaint=true;
  let seed=9173;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  function resize(){
    resizeFrame=0;w=Math.max(1,innerWidth);h=Math.max(1,innerHeight);
    const ratio=Math.min(devicePixelRatio||1,1.25);
    c.width=Math.round(w*ratio);c.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const count=Math.min(175,Math.max(70,Math.round(w*h/10000)));
    stars=Array.from({length:count},()=>({x:random()*w,y:random()*h,r:.4+random()*1.2,s:.5+random()*1.5,p:random()*6.28}));
    needsPaint=true;draw(performance.now(),true);
  }
  function draw(time,force=false){
    if(document.hidden)return;
    if(!force&&time-lastTick<33){frame=requestAnimationFrame(draw);return;}
    const elapsed=lastTick?Math.min((time-lastTick)/1000,.08):.033;
    lastTick=time;
    const dark=root.dataset.theme==='dark';
    ctx.clearRect(0,0,w,h);
    // The CSS canvas background is static: paint only the stars on animation frames.
    if(!motion.matches)offset+=elapsed*5;
    ctx.fillStyle=dark?'#f6fbff':'#101820';
    for(const s of stars){
      const x=(s.x+offset*s.s)%w;
      ctx.globalAlpha=(.58+.32*Math.sin(time*.0013+s.p))*(dark?.82:.80);
      ctx.beginPath();ctx.arc(x,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;needsPaint=false;
    if(!motion.matches)frame=requestAnimationFrame(draw);
  }
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastTick=0;}
  function refresh(){stop();needsPaint=true;if(!document.hidden){draw(performance.now(),true)}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else refresh()});
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',refresh);
  window.addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(resize)},{passive:true});
  motion.addEventListener('change',refresh);
  window.addEventListener('nig:admin-themechange',refresh);
  resize();
}
document.addEventListener('DOMContentLoaded',()=>{
const burger=document.getElementById('admin-nav-burger');
const nav=document.getElementById('admin-main-nav');
if(burger&&nav){burger.addEventListener('click',()=>{const open=nav.classList.toggle('open');burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Close admin menu':'Open admin menu')});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');burger.setAttribute('aria-expanded','false')}});}
updateTheme(safeGet(THEME)==='dark'?'dark':'light',false);document.querySelectorAll('#theme-toggle').forEach(b=>{const sun=b.querySelector('svg');if(sun&&!b.querySelector('.admin-theme-moon')){sun.classList.add('admin-theme-sun');const moon=document.createElementNS('http://www.w3.org/2000/svg','svg');moon.setAttribute('viewBox','0 0 24 24');moon.setAttribute('fill','none');moon.setAttribute('stroke','currentColor');moon.setAttribute('stroke-width','1.8');moon.setAttribute('stroke-linecap','round');moon.setAttribute('stroke-linejoin','round');moon.setAttribute('aria-hidden','true');moon.classList.add('admin-theme-moon');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z');moon.append(path);sun.after(moon);}});document.querySelectorAll('#theme-toggle').forEach(b=>b.addEventListener('click',()=>updateTheme(root.dataset.theme==='dark'?'light':'dark',true)));readProfile();if(!profile.userId)profile.userId=safeGet('nig-admin-id-hint')||'';buildProfile();paintProfile();initSpace();document.querySelectorAll('[data-admin-logout]').forEach(link=>link.addEventListener('click',()=>{try{sessionStorage.removeItem('nig-admin-demo-login')}catch(e){}}))});
})();