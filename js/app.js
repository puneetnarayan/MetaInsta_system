const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
let state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};

function brief(){return Object.fromEntries(ids.map(id=>[id,$(id).value.trim()]));}
function fillBrief(b){ids.forEach(id=>{if($(id)&&b[id]!==undefined)$(id).value=b[id]||'';});}
function resetState(){state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};}
function showTab(name){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===name));if(name==='saved')renderSaved();if(name==='export')renderPreview();}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

function generateDemo(){
 const b=state.brief;
 const brand=b.brandName||'Your Brand';
 const product=b.productName||'Your Product / Service';
 const audience=b.targetCustomer||'your ideal customer';
 const problem=b.problem||'a frustrating problem';
 const outcome=b.outcome||'a clear desired outcome';
 const offer=b.offer||'your offer';
 const location=b.location||'your target market';

 state.strategy={
   objective:b.objective||'Lead Generation',
   audience:audience+(b.ageRange?' · '+b.ageRange:'')+(location?' · '+location:''),
   corePain:'The audience is likely to hesitate or delay action because '+problem.toLowerCase().replace(/[.!?]+$/,'')+'.',
   desiredOutcome:'Help the audience move toward '+outcome.toLowerCase().replace(/[.!?]+$/)+'.',
   positioning:product+' is positioned as a practical way for '+audience+' to address the problem and move toward the desired outcome.',
   keyMessage:'You do not need to remain stuck with the problem. '+product+' gives you a clear next step toward '+outcome.toLowerCase().replace(/[.!?]+$/)+'.',
   funnelAngle:'Problem awareness → useful insight → offer → simple CTA.',
   testing:['Problem-led hook vs outcome-led hook','Short primary text vs story-led primary text','Direct CTA vs curiosity CTA']
 };

 state.copy=[
  {name:'Ad 1 · Problem-led',hook:'Still struggling with '+problem.toLowerCase().replace(/[.!?]+$/)+'?',primaryText:'If you are '+audience.toLowerCase()+', you may recognise this: '+problem+'\n\n'+product+' is designed to help you move toward '+outcome.toLowerCase().replace(/[.!?]+$/)+'.\n\n'+offer+'. Take the next step and see whether it is right for you.',headline:'A practical next step for '+audience,description:offer,cta:'Learn More'},
  {name:'Ad 2 · Outcome-led',hook:'What would change if '+outcome.toLowerCase().replace(/[.!?]+$/)+'?',primaryText:'Imagine being able to '+outcome.toLowerCase().replace(/[.!?]+$/)+' without constantly feeling held back by the same challenge.\n\n'+product+' helps '+audience.toLowerCase()+' work toward that outcome with a practical, focused approach.\n\n'+offer+'.',headline:'Move toward '+outcome,description:'See how it works',cta:'Learn More'},
  {name:'Ad 3 · Conversational',hook:'Can I ask you a quick question?',primaryText:'When '+problem.toLowerCase().replace(/[.!?]+$/)+', what do you usually do?\n\n'+product+' was created for '+audience.toLowerCase()+' who want a clearer way forward. The goal is simple: '+outcome.toLowerCase().replace(/[.!?]+$/)+'.\n\n'+offer+'. Explore the details and decide if it fits your needs.',headline:'Could this be your next step?',description:'Explore the offer',cta:'Learn More'}
 ];

 state.creative=[
  {format:'Single Image Ad',concept:'Primary visual: a relatable moment showing the customer before the solution. On-image text: “'+shortText(problem,58)+'”\nSupporting line: “Move toward '+shortText(outcome,55)+'.”\nCTA: '+(offer||'Learn More')},
  {format:'Carousel',concept:'Card 1: The problem. Card 2: Why it keeps happening. Card 3: The practical shift. Card 4: What '+product+' provides. Card 5: Offer + CTA.'},
  {format:'Instagram Story',concept:'Frame 1: question-led hook. Frame 2: audience pain point. Frame 3: one useful insight. Frame 4: introduce '+product+'. Frame 5: '+offer+' + CTA.'},
  {format:'Instagram Reel',concept:'15–30 seconds. Open with the problem in the first 2 seconds, show a relatable example, introduce the solution, show the desired outcome, then finish with a clear CTA.'}
 ];

 state.reels=[
  {title:'Reel 1 · Problem to solution',hook:'If '+problem.toLowerCase().replace(/[.!?]+$/)+', try this.',scenes:['0–2s — Hook: say the problem directly.','2–7s — Relatable example: show what the audience experiences.','7–15s — Insight: explain one practical shift.','15–23s — Solution: introduce '+product+'.','23–30s — CTA: invite viewers to explore the offer.']},
  {title:'Reel 2 · Desired outcome',hook:'Imagine '+outcome.toLowerCase().replace(/[.!?]+$/)+'.',scenes:['0–2s — Hook with the desired outcome.','2–8s — Contrast it with the current frustration.','8–18s — Explain how '+product+' helps.','18–25s — Show the next step.','25–30s — CTA: '+offer+'.']},
  {title:'Reel 3 · Question format',hook:'Quick question for '+audience.toLowerCase()+':',scenes:['0–3s — Ask a direct question.','3–9s — Name the common challenge.','9–17s — Give one useful insight.','17–25s — Present '+product+' as the offer.','25–30s — CTA: learn more and decide if it fits.']}
 ];
 state.selectedCopy=state.copy[0].name;renderResults();
}
function shortText(value,max){const s=String(value).trim();return s.length>max?s.slice(0,max-1).trim()+'…':s;}

function renderResults(){
 $('strategyResult').innerHTML='<h3>Reference strategy generated — review before use</h3><div class="result-grid">'+Object.entries(state.strategy).map(([k,v])=>'<div class="result-card"><strong>'+esc(k)+'</strong><p>'+esc(Array.isArray(v)?v.join(' • '):v)+'</p></div>').join('')+'</div><small class="demo-badge">DEMO MODE — Claude API not connected</small>';
 renderCopy();renderCreative();renderReels();
}
function renderCopy(){
 $('copyResult').innerHTML='<div class="ad-list">'+state.copy.map((a,i)=>'<article class="ad-card '+(state.selectedCopy===a.name?'selected':'')+'"><h3>'+esc(a.name)+(state.selectedCopy===a.name?'<span class="selected-tag">Selected</span>':'')+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="hook">'+esc(a.hook)+'</textarea></label><label><span class="field-title">Primary Text</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="primaryText">'+esc(a.primaryText)+'</textarea></label><label><span class="field-title">Headline</span><input class="editable copy-field" data-index="'+i+'" data-key="headline" value="'+attr(a.headline)+'"></label><label><span class="field-title">Description</span><input class="editable copy-field" data-index="'+i+'" data-key="description" value="'+attr(a.description)+'"></label><label><span class="field-title">CTA</span><input class="editable copy-field" data-index="'+i+'" data-key="cta" value="'+attr(a.cta)+'"></label><div class="card-actions"><button class="secondary useCopyBtn" data-index="'+i+'">'+(state.selectedCopy===a.name?'✓ Selected':'Use This Version')+'</button><button class="secondary copyBtn" data-index="'+i+'">Copy Ad</button></div></article>').join('')+'</div><small class="demo-badge">REFERENCE EXAMPLE — editable; confirm before use</small>';
 document.querySelectorAll('.copy-field').forEach(el=>el.oninput=()=>{state.copy[Number(el.dataset.index)][el.dataset.key]=el.value;});
 document.querySelectorAll('.useCopyBtn').forEach(btn=>btn.onclick=()=>{state.selectedCopy=state.copy[Number(btn.dataset.index)].name;renderCopy();});
 document.querySelectorAll('.copyBtn').forEach(btn=>btn.onclick=()=>{const a=state.copy[Number(btn.dataset.index)];navigator.clipboard?.writeText(Object.entries(a).map(([k,v])=>k+': '+v).join('\n'));$('status').textContent='Ad copied';});
}
function renderCreative(){$('creativeResult').innerHTML=state.creative.map((x,i)=>'<article class="creative-card"><h3>'+esc(x.format)+'</h3><p>'+esc(x.concept)+'</p><div class="card-actions"><button class="secondary creativeEdit" data-index="'+i+'">Edit</button><button class="secondary creativeUse" data-index="'+i+'">Use Idea</button></div></article>').join('')+'<small class="demo-badge">REFERENCE EXAMPLE — editable; confirm before use</small>';document.querySelectorAll('.creativeEdit').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.index);const next=prompt('Edit the creative concept:',state.creative[i].concept);if(next!==null&&next.trim()){state.creative[i].concept=next.trim();renderCreative();}});document.querySelectorAll('.creativeUse').forEach(btn=>btn.onclick=()=>{$('status').textContent='Creative idea '+(Number(btn.dataset.index)+1)+' selected';});}
function renderReels(){$('reelsResult').innerHTML='<div class="ad-list">'+state.reels.map((r,i)=>'<article class="ad-card"><h3>'+esc(r.title)+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="hook">'+esc(r.hook)+'</textarea></label><div class="field-title">Scenes</div><ol class="reel-scenes">'+r.scenes.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><button class="secondary copyReel" data-index="'+i+'">Copy Script</button></article>').join('')+'</div><small class="demo-badge">REFERENCE EXAMPLE — editable; confirm before use</small>';document.querySelectorAll('.reel-field').forEach(el=>el.oninput=()=>state.reels[Number(el.dataset.index)][el.dataset.key]=el.value);document.querySelectorAll('.copyReel').forEach(btn=>btn.onclick=()=>{const r=state.reels[Number(btn.dataset.index)];navigator.clipboard?.writeText(r.title+'\nHook: '+r.hook+'\nScenes:\n- '+r.scenes.join('\n- '));$('status').textContent='Reel script copied';});}
function regenerate(type){if(!state.brief.productName){$('status').textContent='Generate a campaign first.';showTab('brief');return;}const b=state.brief;if(type==='strategy'){state.strategy.message='Test the customer problem, transformation and offer in separate messages. '+new Date().toLocaleTimeString();renderResults();}if(type==='copy'){state.copy=state.copy.map((a,i)=>({...a,name:'Ad '+(i+1)+' • New',hook:i===0?'What if '+(b.outcome||'the result you want')+' was easier to reach?':i===1?'You do not need to stay stuck with '+(b.problem||'this challenge')+'.':'Ready to take the next step?',primaryText:'A fresh angle for '+(b.targetCustomer||'your audience')+': '+(b.productName||'our solution')+' can help you '+(b.outcome||'move forward')+'.'}));state.selectedCopy=state.copy[0].name;renderCopy();}if(type==='creative'){state.creative=state.creative.map((x,i)=>({...x,concept:'Alternative concept '+(i+1)+': '+x.concept}));renderCreative();}if(type==='reels'){state.reels=state.reels.map((r,i)=>({...r,title:'Reel '+(i+1)+' • New',hook:i===0?'Here is a simple way to '+(b.outcome||'get a better result')+'.':r.hook}));renderReels();}$('status').textContent='New '+type+' ideas generated';}
$('generate').onclick=()=>{state.brief=brief();if(!state.brief.brandName||!state.brief.productName||!state.brief.targetCustomer){$('status').textContent='Enter brand, product/service and target customer.';return;}generateDemo();$('status').textContent='Demo campaign generated';showTab('strategy');};
$('regenStrategy').onclick=()=>regenerate('strategy');$('regenCopy').onclick=()=>regenerate('copy');$('regenCreative').onclick=()=>regenerate('creative');$('regenReels').onclick=()=>regenerate('reels');
$('save').onclick=()=>{const b=brief();if(!b.productName){$('status').textContent='Enter a product/service first.';return;}const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');items.unshift({id:Date.now(),savedAt:new Date().toISOString(),brief:b,state});localStorage.setItem('aiAdsCampaigns',JSON.stringify(items.slice(0,50)));$('status').textContent='Campaign saved';};
$('newCampaign').onclick=()=>{if(confirm('Start a new campaign? Unsaved changes will be cleared.')){ids.forEach(id=>$(id).value='');resetState();$('strategyResult').innerHTML='<div class="placeholder">Complete the brief and generate a strategy.</div>';$('copyResult').innerHTML='<div class="placeholder">Generate a campaign to create ad copy.</div>';$('creativeResult').innerHTML='<article><h3>Image Ad</h3><p>Visual concept and text hierarchy.</p></article><article><h3>Carousel</h3><p>Problem → solution → proof → CTA.</p></article><article><h3>Story</h3><p>Vertical 9:16 concept.</p></article><article><h3>Reel</h3><p>Scene-by-scene creative concept.</p></article>';$('reelsResult').innerHTML='<div class="placeholder">Generate a campaign to create reel scripts.</div>';$('status').textContent='New campaign ready';showTab('brief');}};
$('clear').onclick=()=>$('newCampaign').click();
$('exportJson').onclick=()=>download('ai-ads-campaign.json',JSON.stringify(state,null,2),'application/json');$('exportText').onclick=()=>download('ai-ads-campaign.txt',Object.entries(brief()).map(([k,v])=>k+': '+v).join('\n'),'text/plain');
function renderSaved(){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');$('savedList').innerHTML=items.length?items.map(x=>'<div class="saved-card"><div class="saved-meta"><strong>'+esc(x.brief.productName||'Untitled campaign')+'</strong><small>'+esc(x.brief.brandName||'')+' · '+new Date(x.savedAt).toLocaleString()+'</small></div><div class="saved-actions"><button class="secondary loadBtn" data-id="'+x.id+'">Load</button><button class="secondary danger deleteBtn" data-id="'+x.id+'">Delete</button></div></div>').join(''):'<div class="placeholder">No saved campaigns yet.</div>';document.querySelectorAll('.loadBtn').forEach(btn=>btn.onclick=()=>loadCampaign(Number(btn.dataset.id)));document.querySelectorAll('.deleteBtn').forEach(btn=>btn.onclick=()=>deleteCampaign(Number(btn.dataset.id)));}
function loadCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');const item=items.find(x=>x.id===id);if(!item)return;fillBrief(item.brief);state=item.state||{brief:item.brief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};if(!state.copy)generateDemo();else{renderResults();}state.brief=item.brief;$('status').textContent='Saved campaign loaded';showTab('strategy');}
function deleteCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]').filter(x=>x.id!==id);localStorage.setItem('aiAdsCampaigns',JSON.stringify(items));renderSaved();}
function renderPreview(){$('preview').textContent=JSON.stringify(state,null,2);}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function attr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}