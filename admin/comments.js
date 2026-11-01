// Frontend sample data only. No MySQL changes are made here.
const sampleComments = [
{id:1,commenter:"John Doe",comment:"This is a very informative article about renewable energy and its future.",article:"Green Energy",date:"28 Oct 2026",status:"pending"},
{id:2,commenter:"Sara Ahmed",comment:"Great insights! We really need more actions for a cleaner planet.",article:"Climate Change",date:"27 Oct 2026",status:"pending"},
{id:3,commenter:"Rafiq Khan",comment:"Well written and easy to understand. Keep up the good work!",article:"Sustainable Living",date:"26 Oct 2026",status:"pending"},
{id:4,commenter:"Nadia Malik",comment:"Could you also cover the impact on local communities?",article:"Water Conservation",date:"25 Oct 2026",status:"pending"},
{id:5,commenter:"Maya Silva",comment:"Helpful article about the new campus project.",article:"Campus News",date:"24 Oct 2026",status:"pending"},
{id:6,commenter:"Alex Perera",comment:"Thank you for sharing these details.",article:"Technology",date:"23 Oct 2026",status:"approved"},
{id:7,commenter:"Sam Fernando",comment:"I enjoyed reading this report.",article:"Sports",date:"22 Oct 2026",status:"approved"},
{id:8,commenter:"Kavi Raj",comment:"This comment was rejected during review.",article:"Campus News",date:"21 Oct 2026",status:"rejected"}
];
// Real comments will be supplied by your backend later; the default view stays empty.
let liveComments = [];
let demoComments = sampleComments.map(c => ({...c}));
const $ = id => document.getElementById(id);
function activeComments(){ return $("demoToggle").checked ? demoComments : liveComments; }

const pageSize=4; let page=1;
function counts(){const count=s=>activeComments().filter(c=>c.status===s).length;$("totalCount").textContent=activeComments().length;$("pendingCount").textContent=count("pending");$("approvedCount").textContent=count("approved");$("rejectedCount").textContent=count("rejected");$("pendingBadge").textContent=count("pending")+" Pending";}
function filtered(){const q=$("commentSearch").value.toLowerCase().trim(),s=$("statusFilter").value;return activeComments().filter(c=>(s==="all"||c.status===s)&&[c.commenter,c.comment,c.article].some(v=>v.toLowerCase().includes(q)));}
function notify(text){const t=$("moderationToast");t.textContent=text;t.classList.add("visible");clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove("visible"),2400);}
function renderComments(){
 $("demoNotice").hidden = !$("demoToggle").checked;
 counts();const all=filtered(),max=Math.max(1,Math.ceil(all.length/pageSize));page=Math.min(page,max);const start=(page-1)*pageSize;const rows=$("commentRows");rows.replaceChildren();
 $("emptyMessage").hidden=all.length!==0;
 for(const item of all.slice(start,start+pageSize)){
 const tr=document.createElement("tr"),person=document.createElement("td"),personBox=document.createElement("div"),avatar=document.createElement("span"),name=document.createElement("span");
 personBox.className="comment-person";avatar.className="comment-avatar";avatar.textContent=item.commenter.split(" ").map(s=>s[0]).slice(0,2).join("");name.textContent=item.commenter;personBox.append(avatar,name);person.append(personBox);tr.append(person);
 const message=document.createElement("td");message.textContent=item.comment;tr.append(message);
 const article=document.createElement("td"),tag=document.createElement("span");tag.className="article-tag";tag.textContent="❧ "+item.article;article.append(tag);tr.append(article);
 const date=document.createElement("td");date.textContent=item.date;tr.append(date);
 const actions=document.createElement("td");
 if(item.status==="pending"){for(const [label,status] of [["Approve","approved"],["Reject","rejected"]]){const button=document.createElement("button");button.type="button";button.className="action "+(status==="approved"?"approve":"reject");button.textContent=(status==="approved"?"✓ ":"× ")+label;button.addEventListener("click",()=>{item.status=status;notify("Comment "+status+" (preview only)");renderComments()});actions.append(button);}}
 else{const badge=document.createElement("span");badge.className="status-text "+item.status;badge.textContent=item.status==="approved"?"✓ Approved":"× Rejected";actions.append(badge);}
 tr.append(actions);rows.append(tr);
 }
 $("pageInfo").textContent=all.length?`Showing ${start+1}–${Math.min(start+pageSize,all.length)} of ${all.length} comments`:"Showing 0 comments";
 $("prevPage").disabled=page===1;$("nextPage").disabled=page===max;
 const pages=$("pageNumbers");pages.replaceChildren();for(let i=1;i<=max;i++){const b=document.createElement("button");b.textContent=i;b.className=i===page?"active":"";b.addEventListener("click",()=>{page=i;renderComments()});pages.append(b);}
}
$("demoToggle").addEventListener("change",()=>{demoComments=sampleComments.map(c=>({...c}));page=1;$("commentSearch").value="";$("statusFilter").value="pending";renderComments();});
$("commentSearch").addEventListener("input",()=>{page=1;renderComments()});
$("statusFilter").addEventListener("change",()=>{page=1;renderComments()});
$("prevPage").addEventListener("click",()=>{if(page>1){page--;renderComments()}});
$("nextPage").addEventListener("click",()=>{if(page*pageSize<filtered().length){page++;renderComments()}});
document.body.classList.remove("night");$("themeLabel").textContent="Day";$("themeToggle").setAttribute("aria-pressed","false");
$("themeToggle").addEventListener("click",()=>{const night=document.body.classList.toggle("night");$("themeLabel").textContent=night?"Night":"Day";$("themeToggle").setAttribute("aria-pressed",String(night));});
document.querySelectorAll("[data-placeholder]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();notify("Connect this link to your website later");}));
renderComments();

// Backend integration hook: call updateAdminComments(arrayOfComments) after loading PHP/API data.
window.updateAdminComments = function(data){ liveComments = Array.isArray(data) ? data.map(c=>({...c})) : []; if(!$("demoToggle").checked){page=1;renderComments();} };
