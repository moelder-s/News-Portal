// Frontend dashboard. Comments are empty until supplied by the backend.
let liveComments = [];
const $ = id => document.getElementById(id);
if (!$('moderationToast')) { const el=document.createElement('div'); el.id='moderationToast'; el.className='moderation-toast'; el.setAttribute('role','status'); document.body.append(el); }

function activeComments(){ return liveComments; }

const pageSize=4; let page=1;
function counts(){const count=s=>activeComments().filter(c=>c.status===s).length;$("totalCount").textContent=activeComments().length;$("pendingCount").textContent=count("pending");$("approvedCount").textContent=count("approved");$("rejectedCount").textContent=count("hidden");$("pendingBadge").textContent=count("pending")+" Pending";}
function filtered(){const q=$("commentSearch").value.toLowerCase().trim(),s=$("statusFilter").value;return activeComments().filter(c=>(s==="all"||c.status===s)&&[c.commenter,c.comment,c.article].some(v=>v.toLowerCase().includes(q)));}
function notify(text){const t=$("moderationToast");t.textContent=text;t.classList.add("visible");clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove("visible"),2400);}
function renderComments(){
 counts();const all=filtered(),max=Math.max(1,Math.ceil(all.length/pageSize));page=Math.min(page,max);const start=(page-1)*pageSize;const rows=$("commentRows");rows.replaceChildren();
 $("emptyMessage").hidden=all.length!==0;
 for(const item of all.slice(start,start+pageSize)){
 const tr=document.createElement("tr"),person=document.createElement("td"),personBox=document.createElement("div"),avatar=document.createElement("span"),name=document.createElement("span");
 personBox.className="comment-person";avatar.className="comment-avatar";avatar.textContent=item.commenter.split(" ").map(s=>s[0]).slice(0,2).join("");name.textContent=item.commenter;personBox.append(avatar,name);person.append(personBox);tr.append(person);
 const message=document.createElement("td");message.textContent=item.comment;tr.append(message);
 const article=document.createElement("td"),tag=document.createElement("span");tag.className="article-tag";tag.textContent="❧ "+item.article;article.append(tag);tr.append(article);
 const date=document.createElement("td");date.textContent=item.date;tr.append(date);
 const actions=document.createElement("td");
 if(item.status==="pending"){for(const [label,status] of [["Approve","approved"],["Hide","hidden"]]){const button=document.createElement("button");button.type="button";button.className="action "+(status==="approved"?"approve":"reject");button.textContent=(status==="approved"?"✓ ":"× ")+label;button.addEventListener("click",()=>{if(typeof window.adminModerateComment==='function' && item.id){window.adminModerateComment(item.id,status).catch(e=>notify(e.message||String(e)));}else{item.status=status;notify("Comment "+status+" (frontend only)");renderComments()}});actions.append(button);}}
 else{const badge=document.createElement("span");badge.className="status-text "+item.status;badge.textContent=item.status==="approved"?"✓ Approved":"× Hidden";actions.append(badge);}
 tr.append(actions);rows.append(tr);
 }
 $("pageInfo").textContent=all.length?`Showing ${start+1}–${Math.min(start+pageSize,all.length)} of ${all.length} comments`:"Showing 0 comments";
 $("prevPage").disabled=page===1;$("nextPage").disabled=page===max;
 const pages=$("pageNumbers");pages.replaceChildren();for(let i=1;i<=max;i++){const b=document.createElement("button");b.textContent=i;b.className=i===page?"active":"";b.addEventListener("click",()=>{page=i;renderComments()});pages.append(b);}
}
$("commentSearch").addEventListener("input",()=>{page=1;renderComments()});
$("statusFilter").addEventListener("change",()=>{page=1;renderComments()});
$("prevPage").addEventListener("click",()=>{if(page>1){page--;renderComments()}});
$("nextPage").addEventListener("click",()=>{if(page*pageSize<filtered().length){page++;renderComments()}});
renderComments();

// Backend integration hook: call updateAdminComments(arrayOfComments) after loading PHP/API data.
window.updateAdminComments = function(data){ liveComments = Array.isArray(data) ? data.map(c=>({...c})) : []; page=1;renderComments(); };
