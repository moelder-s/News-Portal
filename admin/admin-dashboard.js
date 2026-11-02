'use strict';
// Display actual data by calling window.updateAdminDashboard(payload) from your backend.
// payload = {totalArticles, pendingApproval, commentsToModerate, featuredBreaking,
//            recentActivity:[{event,item,when}]}.
const $ = id => document.getElementById(id);
const counts = ['totalArticles','pendingApproval','commentsToModerate','featuredBreaking'];
const state = {totalArticles:0,pendingApproval:0,commentsToModerate:0,featuredBreaking:0,recentActivity:[]};
function render(){
  for(const key of counts) $(key).textContent=Number(state[key]||0).toLocaleString();
  const body=$('activityRows');body.replaceChildren();
  const activity=Array.isArray(state.recentActivity)?state.recentActivity:[];
  if(!activity.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=3;td.className='activity-empty';td.textContent='No recent activity yet.';tr.append(td);body.append(tr);return;}
  activity.slice(0,12).forEach(row=>{const tr=document.createElement('tr');for(const [i,key] of ['event','item','when'].entries()){const td=document.createElement('td');td.textContent=String(row[key]??'—');if(i===0)td.className='activity-event';if(i===2)td.className='activity-time';tr.append(td);}body.append(tr);});
}
window.updateAdminDashboard=function(payload={}){for(const key of counts)if(Object.hasOwn(payload,key))state[key]=payload[key];if(Array.isArray(payload.recentActivity))state.recentActivity=payload.recentActivity;render();};
const themeToggle=$('themeToggle');
function setTheme(night){document.body.classList.toggle('night',night);document.body.classList.toggle('day',!night);$('themeLabel').textContent=night?'Night':'Day';themeToggle.setAttribute('aria-pressed',String(night));try{localStorage.setItem('news-in-green-theme',night?'night':'day');}catch(_){}}
let initialNight=false;try{initialNight=localStorage.getItem('news-in-green-theme')==='night';}catch(_){}
setTheme(initialNight);
themeToggle.addEventListener('click',()=>setTheme(!document.body.classList.contains('night')));
render();
