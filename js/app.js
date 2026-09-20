const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
let state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};

function brief(){return Object.fromEntries(ids.map(id=>[id,$(id).value.trim()]));}
function fillBrief(b){
 ids.forEach(id=>{
  const el=$(id);
  if(!el||b[id]===undefined)return;
  const value=String(b[id]??'');
  el.value=value;
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.dispatchEvent(new Event('change',{bubbles:true}));
 });
}
function resetState(){state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};}
function showTab(name){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===name));if(name==='saved')renderSaved();if(name==='export')renderPreview();}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

async function generateAI(){
 const b=state.brief;
 if(!b.brandName||!b.productName||!b.targetCustomer){$('status').textContent='Enter brand, product/service and target customer.';return;}
 $('generate').disabled=true;$('generate').textContent='Generating…';$('status').textContent='₹0 Mode — building campaign locally…';
 try{
   generateDemo();
   $('status').textContent='₹0 campaign generated — no paid AI/API used';
   showTab('strategy');
 }catch(err){
   $('status').textContent='Campaign generation failed — '+err.message;
 }finally{$('generate').disabled=false;$('generate').textContent='Generate Campaign — ₹0';}
}
function generateDemo(){
 const b=state.brief;
 const product=b.productName||'Your Product / Service';
 const audience=b.targetCustomer||'your ideal customer';
 const problem=b.problem||'a frustrating problem';
 const outcome=b.outcome||'a clear desired outcome';
 const offer=b.offer||'your offer';
 const location=b.location||'your target market';
 const tone=b.tone||'Professional + Friendly';
 const clean=s=>String(s).trim().replace(/[.!?]+$/,'');
 const p=clean(problem),o=clean(outcome);
 const aud=audience.toLowerCase(),prod=product.toLowerCase();
 const objective=b.objective||'Lead Generation';
 const cta=objective==='Sales'?'Shop Now':objective==='WhatsApp Leads'?'Send Message':objective==='Website Traffic'?'Learn More':'Learn More';

 state.strategy={
  objective,
  audience:(audience+(b.ageRange?' · '+b.ageRange:'')+(location?' · '+location:'')),
  corePain:'The audience is dealing with '+p+'. The campaign should make them feel understood before introducing the offer.',
  desiredOutcome:'Move the audience toward '+o+' through a practical, credible next step.',
  positioning:product+' is positioned as a focused solution for '+aud+' rather than a generic answer to every problem.',
  keyMessage:'You may already have the intent or ability to '+shortText(o,110)+'. The barrier is turning that intention into action. '+product+' provides a practical next step.',
  funnelAngle:'Problem recognition → relatable insight → desired outcome → offer → clear CTA.',
  testing:[
   'Problem-led: mirror the customer’s own words and situation.',
   'Outcome-led: show what becomes easier or better after taking action.',
   'Question-led: make the audience recognise themselves in the first sentence.',
   'Offer-led: introduce the practical details only after relevance is established.'
  ],
  tone
 };

 state.copy=[
  {
   name:'Ad 1 · Problem-led',
   hook:'Still '+p.toLowerCase()+'?',
   primaryText:'You may already know what you want. The difficult part is '+p.toLowerCase()+'.\\n\\nIf you are '+aud+', this is exactly the kind of situation '+product+' is designed to address.\\n\\nThe focus is practical: '+o+'.\\n\\n'+(offer?offer+' · ':'')+'Explore the details and see if it is right for you.',
   headline:'A practical next step for '+audience,
   description:shortText(product+' for people who want '+o,90),
   cta
  },
  {
   name:'Ad 2 · Outcome-led',
   hook:'What would change if you could '+o.toLowerCase()+'?',
   primaryText:'Imagine '+o.toLowerCase()+'.\\n\\nFor '+aud+', the first step is often not doing more — it is having a clearer, more practical way to move forward.\\n\\n'+product+' helps you work toward that outcome with a focused approach.\\n\\n'+(offer?offer+'. ':'')+'See how it works and decide whether it fits your needs.',
   headline:'Move toward '+shortText(o,55),
   description:'Practical help for '+aud,
   cta
  },
  {
   name:'Ad 3 · Question-led',
   hook:'Quick question for '+aud+' — does this sound familiar?',
   primaryText:'You want to '+o.toLowerCase()+', but '+p.toLowerCase()+'.\\n\\nThat gap is frustrating — especially when you know you are capable of more.\\n\\n'+product+' gives '+aud+' a structured next step toward '+o.toLowerCase()+'.\\n\\n'+(offer?offer+'. ':'')+'Take a look and decide if it is useful for you.',
   headline:'Have the goal? Take the next step.',
   description:'A focused approach to '+o,
   cta
  }
 ];

 state.creative=[
  {format:'Single Image Ad',concept:'Show the customer in the exact moment represented by the problem. Headline: “'+shortText(problem,62)+'” Supporting line: “Move toward '+shortText(outcome,58)+'.” Keep the visual simple, mobile-readable and focused on one idea.'},
  {format:'Carousel',concept:'Card 1: recognise the problem. Card 2: describe the real-life situation. Card 3: give one useful insight. Card 4: introduce '+product+'. Card 5: show '+(offer||'the offer')+' and a clear CTA.'},
  {format:'Instagram Story',concept:'Frame 1: a direct question about the problem. Frame 2: mirror the customer situation. Frame 3: give one practical insight. Frame 4: introduce '+product+'. Frame 5: show '+(offer||'the offer')+' and '+cta+'.'},
  {format:'Instagram Reel',concept:'20–30 seconds: open with the problem in the first 2 seconds; show a recognisable real-life moment; give one useful insight; introduce '+product+'; show the desired outcome; finish with '+cta+'.'}
 ];

 state.reels=[
  {title:'Reel 1 · Problem to solution',hook:'Ever '+p.toLowerCase()+'?',scenes:[
   '0–3s — On-screen hook: “'+shortText(problem,70)+'”',
   '3–8s — Show a realistic situation where the customer experiences the problem.',
   '8–15s — Voiceover: explain why the situation feels difficult without blaming the customer.',
   '15–23s — Introduce '+product+' as a practical next step toward '+o+'.',
   '23–30s — Show '+(offer||'the offer')+' and CTA: '+cta+'.'
  ]},
  {title:'Reel 2 · Outcome-led',hook:'Imagine being able to '+o.toLowerCase()+'.',scenes:[
   '0–3s — Show the desired outcome immediately.',
   '3–8s — Contrast it with the current frustration: '+shortText(problem,80)+'.',
   '8–16s — Give one useful tip or insight relevant to '+aud+'.',
   '16–24s — Introduce '+product+' and explain its practical role.',
   '24–30s — Show '+(offer||'the offer')+' and CTA: '+cta+'.'
  ]},
  {title:'Reel 3 · Question format',hook:'Do you '+p.toLowerCase()+'?',scenes:[
   '0–3s — Put the question on screen and pause for recognition.',
   '3–9s — Show a relatable example from the customer’s daily life.',
   '9–17s — Give one practical shift the viewer can try.',
   '17–25s — Present '+product+' as the next step for '+aud+'.',
   '25–30s — End with '+(offer||'the offer')+' and CTA: '+cta+'.'
  ]}
 ];
 state.selectedCopy=state.copy[0].name;
 renderResults();
}
function shortText(value,max){const s=String(value).trim();return s.length>max?s.slice(0,max-1).trim()+'…':s;}

function renderResults(){
 $('strategyResult').innerHTML='<h3>Campaign strategy generated — review before use</h3><div class="result-grid">'+Object.entries(state.strategy).map(([k,v])=>'<div class="result-card"><strong>'+esc(k)+'</strong><p>'+esc(Array.isArray(v)?v.join(' • '):v)+'</p></div>').join('')+'</div><small class="demo-badge">₹0 MODE — built-in campaign engine; no paid API used</small>';
 renderCopy();renderCreative();renderReels();
}
function renderCopy(){
 $('copyResult').innerHTML='<div class="ad-list">'+state.copy.map((a,i)=>'<article class="ad-card '+(state.selectedCopy===a.name?'selected':'')+'"><h3>'+esc(a.name)+(state.selectedCopy===a.name?'<span class="selected-tag">Selected</span>':'')+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="hook">'+esc(a.hook)+'</textarea></label><label><span class="field-title">Primary Text</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="primaryText">'+esc(a.primaryText)+'</textarea></label><label><span class="field-title">Headline</span><input class="editable copy-field" data-index="'+i+'" data-key="headline" value="'+attr(a.headline)+'"></label><label><span class="field-title">Description</span><input class="editable copy-field" data-index="'+i+'" data-key="description" value="'+attr(a.description)+'"></label><label><span class="field-title">CTA</span><input class="editable copy-field" data-index="'+i+'" data-key="cta" value="'+attr(a.cta)+'"></label><div class="card-actions"><button class="secondary useCopyBtn" data-index="'+i+'">'+(state.selectedCopy===a.name?'✓ Selected':'Use This Version')+'</button><button class="secondary copyBtn" data-index="'+i+'">Copy Ad</button></div></article>').join('')+'</div><small class="demo-badge">₹0 MODE — editable; confirm before use</small>';
 document.querySelectorAll('.copy-field').forEach(el=>el.oninput=()=>{state.copy[Number(el.dataset.index)][el.dataset.key]=el.value;});
 document.querySelectorAll('.useCopyBtn').forEach(btn=>btn.onclick=()=>{state.selectedCopy=state.copy[Number(btn.dataset.index)].name;renderCopy();});
 document.querySelectorAll('.copyBtn').forEach(btn=>btn.onclick=()=>{const a=state.copy[Number(btn.dataset.index)];navigator.clipboard?.writeText(Object.entries(a).map(([k,v])=>k+': '+v).join('\n'));$('status').textContent='Ad copied';});
}
function renderCreative(){$('creativeResult').innerHTML=state.creative.map((x,i)=>'<article class="creative-card"><h3>'+esc(x.format)+'</h3><p>'+esc(x.concept)+'</p><div class="card-actions"><button class="secondary creativeEdit" data-index="'+i+'">Edit</button><button class="secondary creativeUse" data-index="'+i+'">Use Idea</button></div></article>').join('')+'<small class="demo-badge">₹0 MODE — editable; confirm before use</small>';document.querySelectorAll('.creativeEdit').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.index);const next=prompt('Edit the creative concept:',state.creative[i].concept);if(next!==null&&next.trim()){state.creative[i].concept=next.trim();renderCreative();}});document.querySelectorAll('.creativeUse').forEach(btn=>btn.onclick=()=>{$('status').textContent='Creative idea '+(Number(btn.dataset.index)+1)+' selected';});}
function renderReels(){$('reelsResult').innerHTML='<div class="ad-list">'+state.reels.map((r,i)=>'<article class="ad-card"><h3>'+esc(r.title)+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="hook">'+esc(r.hook)+'</textarea></label><div class="field-title">Scenes</div><ol class="reel-scenes">'+r.scenes.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><button class="secondary copyReel" data-index="'+i+'">Copy Script</button></article>').join('')+'</div><small class="demo-badge">₹0 MODE — editable; confirm before use</small>';document.querySelectorAll('.reel-field').forEach(el=>el.oninput=()=>state.reels[Number(el.dataset.index)][el.dataset.key]=el.value);document.querySelectorAll('.copyReel').forEach(btn=>btn.onclick=()=>{const r=state.reels[Number(btn.dataset.index)];navigator.clipboard?.writeText(r.title+'\nHook: '+r.hook+'\nScenes:\n- '+r.scenes.join('\n- '));$('status').textContent='Reel script copied';});}
function regenerate(type){
 if(!state.brief.productName){$('status').textContent='Generate a campaign first.';showTab('brief');return;}
 const oldBrief={...state.brief};
 generateDemo();
 const stamp=' · Regenerated '+new Date().toLocaleTimeString();
 if(type==='strategy'){state.strategy.testing=state.strategy.testing.map(x=>x+stamp);renderResults();showTab('strategy');}
 if(type==='copy'){state.copy=state.copy.map((a,i)=>({...a,name:a.name+stamp,hook:i===0?'A different way to look at '+(oldBrief.problem||'the problem')+'.':i===1?'What if '+(oldBrief.outcome||'the desired result')+' became easier to reach?':'Could this be the practical next step you have been looking for?'}));state.selectedCopy=state.copy[0].name;renderCopy();showTab('copy');}
 if(type==='creative'){state.creative=state.creative.map((x,i)=>({...x,concept:'Alternative angle '+(i+1)+': '+x.concept}));renderCreative();showTab('creative');}
 if(type==='reels'){state.reels=state.reels.map((r,i)=>({...r,title:r.title+stamp,hook:i===0?'Here is another way to think about '+(oldBrief.outcome||'the desired outcome')+'.':r.hook}));renderReels();showTab('reels');}
 $('status').textContent='New '+type+' ideas generated — ₹0';
}
async function loadReferenceExample(){
  const btn=$('useReference');
  btn.disabled=true;
  $('status').textContent='Loading reference example…';
  try{
    const response=await fetch('/reference/reference-input.json?v='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw new Error('Reference file could not be loaded ('+response.status+')');
    const referenceBrief=await response.json();
    const missing=ids.filter(id=>referenceBrief[id]===undefined);
    fillBrief(referenceBrief);
    const stillBlank=ids.filter(id=>referenceBrief[id]!==undefined&&$(id)&&$(id).value!==String(referenceBrief[id]??''));
    if(missing.length||stillBlank.length)throw new Error('Some reference fields could not be populated: '+[...new Set([...missing,...stillBlank])].join(', '));
    // Populate the complete campaign workflow from the reference brief.
    // This keeps every downstream tab ready immediately after the reference is loaded.
    state.brief=brief();
    generateDemo();
    if(Array.isArray(referenceBrief.adCopies)&&referenceBrief.adCopies.length){
      state.copy=referenceBrief.adCopies;
      state.selectedCopy=state.copy[0].name;
      renderCopy();
    }
    $('status').textContent='Reference campaign loaded — sample ad copies populated; review before use';
    showTab('brief');
  }catch(err){
    $('status').textContent='Reference loading error — '+err.message;
  }finally{
    btn.disabled=false;
  }
}
$('useReference').onclick=loadReferenceExample;
$('generate').onclick=()=>{state.brief=brief();generateAI();};
$('regenStrategy').onclick=()=>regenerate('strategy');$('regenCopy').onclick=()=>regenerate('copy');$('regenCreative').onclick=()=>regenerate('creative');$('regenReels').onclick=()=>regenerate('reels');$('nextCopy').onclick=()=>showTab('copy');$('nextCreative').onclick=()=>showTab('creative');$('nextReels').onclick=()=>showTab('reels');$('nextSaved').onclick=()=>showTab('saved');
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