(() => {
'use strict';
let csrf='', rows=[];
const page=location.pathname.split('/').pop();
const el=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function request(action,payload){const response=await fetch('admin_api.php?action='+encodeURIComponent(action),{method:payload?'POST':'GET',credentials:'same-origin',headers:{...(payload?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{})},body:payload?JSON.stringify(payload):undefined});let data;try{data=await response.json()}catch(_){throw Error('Server error: PHP or database is not configured')};if(!response.ok||!data.ok)throw Error(data.error||'Request failed');if(data.csrf)csrf=data.csrf;return data;}
const notify=error=>alert(error.message||String(error));
const row=(values)=>'<tr>'+values.map(v=>'<td>'+v+'</td>').join('')+'</tr>';
const empty=(id,message,columns)=>{if(el(id))el(id).innerHTML=row([`<span>${esc(message)}</span>`]).replace('<td>','<td colspan="'+columns+'">')};
function renderList(key,items){rows=items;const defs={comments:['comments-body',5],approvals:['approvals-body',5],articles:['articles-body',6],categories:['categories-body',4],announcements:['announcements-body',4]};const def=defs[key];if(!def)return;const body=el(def[0]);if(!body)return;
window.dispatchEvent(new CustomEvent('nig:workspace-records',{detail:{key,items}}));
if(!items.length){empty(def[0],'No database records found',def[1]);return;}
body.innerHTML=items.map(x=>{const id=Number(x.id);let cells=[];
if(key==='comments')cells=[esc(x.author),esc(x.article_title),esc(x.body),esc(x.status),`<button class="btn btn-sm admin-action-btn admin-action-success btn-solid" type="button" data-dbop="comment-approve" data-id="${id}">Approve</button> <button class="btn btn-sm admin-action-btn admin-action-danger btn-danger" type="button" data-dbop="comment-hide" data-id="${id}">Hide</button>`];
if(key==='approvals')cells=[esc(x.title),esc(x.category),esc(x.author),esc(x.submitted_at),`<button class="btn btn-sm admin-action-btn admin-action-success btn-solid" type="button" data-dbop="approve" data-id="${id}">Approve</button> <button class="btn btn-sm admin-action-btn admin-action-danger btn-danger" type="button" data-dbop="reject" data-id="${id}">Reject</button>`];
if(key==='articles')cells=[esc(x.title),esc(x.category),esc(x.created_at),esc((x.description||'').slice(0,90)),esc(x.id),`<button class="btn btn-sm admin-action-btn admin-action-edit btn-ghost" type="button" data-dbop="article-edit" data-id="${id}">Edit</button> <button class="btn btn-sm admin-action-btn admin-action-danger btn-danger" type="button" data-dbop="article-delete" data-id="${id}">Delete</button>`];
if(key==='categories')cells=[esc(x.name),esc(x.slug),esc(x.is_active==1?'Active':'Inactive'),`<button class="btn btn-sm admin-action-btn admin-action-edit btn-ghost" type="button" data-dbop="category-rename" data-id="${id}">Rename</button> <button class="btn btn-sm admin-action-btn admin-action-danger btn-danger" type="button" data-dbop="category-delete" data-id="${id}">Delete</button>`];
if(key==='announcements')cells=[esc(x.title),esc(x.type),esc(x.category),`<button class="btn btn-sm admin-action-btn admin-action-danger btn-danger" type="button" data-dbop="announcement-delete" data-id="${id}">Delete</button>`];
return row(cells)}).join('');}
async function refresh(){
 if(page.includes('comments')){
   const d=await request('comments');
   rows=d.items;
   if(typeof window.updateAdminComments==='function'){
     window.updateAdminComments(rows.map(x=>({
       id:Number(x.id), commenter:String(x.author||'Unknown'),
       comment:String(x.body||''), article:String(x.article_title||''),
       date:String(x.created_at||''), status:String(x.status||'pending').toLowerCase()
     })));
   }else renderList('comments',rows);
   return;
 }
 if(page.includes('approvals')) return renderList('approvals',(await request('approvals')).items);
 if(page.includes('articles')) return renderList('articles',(await request('articles')).items);
 if(page.includes('categories')) return renderList('categories',(await request('categories')).items);
 if(page.includes('announcements')) return renderList('announcements',(await request('announcements')).items);
 if(page.includes('reports')||page.includes('dashboard')){
   const isReport=page.includes('reports');
   const d=await request(isReport?'reports':'dashboard');
   if(isReport && typeof window.updateNewsReports==='function'){
     const items=Array.isArray(d.top)?d.top:[];
     const grouped=new Map();
     for(const a of items){
       const name=String(a.category||'Other');
       grouped.set(name,(grouped.get(name)||0)+Number(a.views||0));
     }
     window.updateNewsReports({
       totalViews:Number(d.counts?.views||0),
       totalComments:Number(d.counts?.comments||0),
       totalBookmarks:Number(d.counts?.bookmarks||0),
       categories:[...grouped].map(([name,views])=>({name,views})),
       articles:items.map(x=>({
         id:x.id,title:String(x.title||''),category:String(x.category||''),
         views:Number(x.views||0),comments:Number(x.comments||0),
         bookmarks:Number(x.bookmarks||0),publishedDate:String(x.created_at||''),
         url:'../User/article.php?id='+encodeURIComponent(x.id)
       })),
       history:{7:[],30:[],90:[]}
     });
     return;
   }
   const target=el('top-articles-body')||el('activity-body');
   if(target)target.innerHTML=(isReport?d.top:d.recent).map(x=>row(isReport?Object.values(x).map(esc):[esc('Published'),esc(x.title),esc(x.created_at)])).join('')||row(['No activity']);
   if(!isReport && el('deleted-articles-body')) {
     const recent=Array.isArray(d.recent)?d.recent:[];
     const current=el('dashboard-active-body');
     current.innerHTML=recent.map(x=>`<tr><td>${esc(x.title)}</td><td>${esc(x.category)}</td><td>${esc(x.created_at)}</td><td><button type="button" class="btn btn-sm btn-danger" data-dashboard-delete="${Number(x.id)}">Delete</button></td></tr>`).join('') || '<tr><td colspan="4">No published articles.</td></tr>';
     const hist=await request('deleted_history');
     el('deleted-articles-count').textContent=hist.articles.length;
     el('deleted-comments-count').textContent=hist.comments.length;
     el('deleted-articles-body').innerHTML=hist.articles.map(x=>`<tr><td>${esc(x.title)}</td><td>${esc(x.category)}</td><td>${esc(x.deleted_at)}</td></tr>`).join('') || '<tr><td colspan="3">No deleted articles.</td></tr>';
     el('deleted-comments-body').innerHTML=hist.comments.map(x=>`<tr><td>${esc(x.article_title)}</td><td>${esc(x.body)}</td><td>${esc(x.deleted_at)}</td></tr>`).join('') || '<tr><td colspan="3">No deleted comments.</td></tr>';
   }
   // Dashboard already has its own statistic cards; avoid stacking repeated panels.
   const ids={'stat-total':'articles','stat-pending':'pending','stat-comments':'pending_comments','stat-featured':'featured'};
   for(const [id,key] of Object.entries(ids))if(el(id)&&d.counts?.[key]!=null)el(id).textContent=d.counts[key];
 }
}

window.adminModerateComment = async function(id,status){
  const decision=status==='approved'?'Approved':'Hidden';
  await request('comments',{id:Number(id),decision});
  await refresh();
};
async function op(action,payload){await request(action,payload);await refresh();}
async function submitLogin(e){e.preventDefault();e.stopImmediatePropagation();try{await request('login',{userId:el('user-id').value.trim(),password:el('password').value});location.href='admin-dashboard.html'}catch(err){const box=el('form-error');if(box){box.textContent=err.message;box.hidden=false}else notify(err)}}
if(page==='admin-login.html') {document.addEventListener('submit',e=>{if(e.target.id==='login-form')submitLogin(e)},true);return;}
if(page==='admin-register.html')return;
request('session').then(d=>{
csrf=d.csrf;
// Keep profile details that the administrator saved in this browser.
// Previously this session check erased the Admin ID on every page load.
try {
  const key='nig-admin-profile-v1';
  const existing=JSON.parse(localStorage.getItem(key)||'null');
  const saved=existing && typeof existing==='object' && !Array.isArray(existing)?existing:{};
  const merged={
    ...saved,
    name: typeof saved.name==='string' && saved.name.trim()?saved.name:d.user.full_name,
    email: typeof saved.email==='string' && saved.email.trim()?saved.email:d.user.email,
    role:d.user.role,
    userId:typeof saved.userId==='string'?saved.userId:'',
    photo:typeof saved.photo==='string'?saved.photo:''
  };
  localStorage.setItem(key,JSON.stringify(merged));
} catch (_) {}
refresh().catch(notify)
}).catch(()=>{location.replace('admin-login.html')});
document.addEventListener('click',async e=>{
 const del=e.target.closest('[data-dashboard-delete]');
 if(del){e.preventDefault();e.stopImmediatePropagation();
   if(!confirm('Delete this article and its comments? The deleted records will be archived in Dashboard.'))return;
   del.disabled=true;
   try {await request('articles',{id:Number(del.dataset.dashboardDelete),operation:'delete'});await refresh();}
   catch(err){notify(err);del.disabled=false;}
   return;
 }
 const logout=e.target.closest('[data-admin-logout],#logout-btn');if(logout){e.preventDefault();e.stopImmediatePropagation();try{await request('logout',{});location.href='admin-login.html'}catch(err){notify(err)}return}const b=e.target.closest('[data-dbop]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const id=Number(b.dataset.id),cmd=b.dataset.dbop;const item=rows.find(x=>Number(x.id)===id);try{
if(cmd.startsWith('comment-'))await op('comments',{id,decision:cmd==='comment-approve'?'Approved':'Hidden'});
if(cmd==='approve'||cmd==='reject')await op('approvals',{id,decision:cmd==='approve'?'Approved':'Rejected'});
if(cmd==='article-delete'&&confirm('Delete this article and its comments? They will be archived in Admin Dashboard.'))await op('articles',{id,operation:'delete'});
if(cmd==='article-edit'){el('article-title').value=item.title;el('article-category').value=item.category;el('article-status').value='Published';el('article-image').value=item.image||'';el('article-content').value=item.content||'';el('article-form').dataset.editId=id;document.querySelector('[data-open-modal]')?.click();}
if(cmd==='category-delete'&&confirm('Delete this category?'))await op('categories',{id,operation:'delete'});
if(cmd==='category-rename'){const name=prompt('New category name',item.name);if(name)await op('categories',{id,name});}
if(cmd==='announcement-delete'&&confirm('Delete announcement?'))await op('announcements',{id,operation:'delete'});
}catch(err){notify(err)}},true);
document.addEventListener('submit',async e=>{const form=e.target;if(!['article-form','category-form','announcement-form','password-form'].includes(form.id))return;e.preventDefault();e.stopImmediatePropagation();try{
if(form.id==='article-form'){await op('articles',{id:Number(form.dataset.editId||0),title:el('article-title').value,category:el('article-category').value,content:el('article-content').value,image:el('article-image').value});delete form.dataset.editId;}
if(form.id==='category-form')await op('categories',{name:el('category-name').value});
if(form.id==='announcement-form')await op('announcements',{title:el('announcement-title').value,type:el('announcement-type').value,category:el('announcement-category').value,body:el('announcement-content').value});
if(form.id==='password-form'){const current=el('current-password').value, next=el('new-password').value;if(next!==el('confirm-password').value)throw Error('Passwords do not match');await request('password',{current,new:next});alert('Password changed');}form.reset();document.querySelectorAll('.modal-overlay.is-open').forEach(m=>m.classList.remove('is-open'));
}catch(err){notify(err)}},true);
})();