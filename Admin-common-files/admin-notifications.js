/* Admin notifications — protected live data; no database changes. */
(() => {
  'use strict';
  const list=document.getElementById('admin-notices-list');
  const total=document.getElementById('admin-notices-count');
  if(!list) return;
  const show=(items)=>{
    list.replaceChildren();
    if(!items.length){const empty=document.createElement('p');empty.className='admin-notices-empty';empty.textContent='No notifications yet.';list.append(empty);return;}
    for(const item of items){
      const link=document.createElement('a');
      link.className='admin-notice-row';link.href=item.url||'admin-dashboard.html';
      const icon=document.createElement('span');icon.className='admin-notice-type';icon.textContent=item.type==='submission'?'Article':item.type==='comment'?'Comment':'News';
      const detail=document.createElement('span');detail.className='admin-notice-detail';
      const strong=document.createElement('strong');strong.textContent=item.title||'Notification';
      const small=document.createElement('small');small.textContent=item.detail||'';
      const date=document.createElement('time');date.textContent=item.created_at||'';
      detail.append(strong,small,date);link.append(icon,detail);list.append(link);
    }
  };
  const refresh = () => fetch('admin_api.php?action=notifications',{credentials:'same-origin',headers:{Accept:'application/json'},cache:'no-store'})
    .then(r=>r.json().then(d=>({status:r.status,data:d})))
    .then(({status,data})=>{
      if(status===401){location.replace('admin-login.html');return;}
      if(status>=400 || !data.ok)throw new Error(data.error||'Could not load notifications.');
      total.textContent=String(data.pending_count||0)+' pending';show(data.items||[]);
    })
    .catch(e=>{list.textContent=e.message||'Unable to load notifications.';});
  refresh();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(() => { if (!document.hidden) refresh(); }, 30000);
})();
