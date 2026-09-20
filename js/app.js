const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
let state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};

const REFERENCE_ADS=[{"name":"Ad Version 1 · Problem-led","hook":"Still knowing what you want to say — but hesitating when it's your turn to speak?","primaryText":"You know the answer.\n\nYou have an idea.\n\nBut when the meeting turns to you, you suddenly start searching for words, translating in your head or wondering whether you are saying it correctly.\n\nIf this sounds familiar, you are not alone.\n\nThe Speak in Meetings Workshop is designed for working professionals who want to express their ideas more clearly and participate with greater confidence in workplace conversations.\n\n4-day live workshop · ₹997\n\nExplore the workshop and see if it is right for you.","headline":"Speak with more confidence in meetings","description":"4-day live workshop for working professionals.","cta":"Learn More"},{"name":"Ad Version 2 · Outcome-led","hook":"Imagine expressing your idea clearly when the meeting turns to you.","primaryText":"You don't necessarily need more words.\n\nYou need to feel more comfortable using the words you already know.\n\nThe Speak in Meetings Workshop helps working professionals practise how to express ideas, respond naturally and participate more confidently in workplace conversations.\n\nIf your goal is to speak more clearly without constantly worrying about finding the perfect words, this workshop may be a useful next step.\n\n4-day live workshop · ₹997","headline":"Express your ideas with confidence","description":"Practical workplace communication training.","cta":"Learn More"},{"name":"Ad Version 3 · Conversational","hook":"Quick question: do you stay quiet in meetings even when you have something useful to say?","primaryText":"Maybe you know exactly what you want to say.\n\nThen the moment comes.\n\nYou hesitate.\n\nYou search for the right words.\n\nSomeone else speaks.\n\nAnd the opportunity passes.\n\nThe Speak in Meetings Workshop is created for working professionals who want to become more comfortable expressing themselves in meetings and workplace conversations.\n\nLearn, practise and build confidence through a focused 4-day live workshop.\n\n₹997","headline":"Have something to say? Say it clearly.","description":"Build practical speaking confidence at work.","cta":"Learn More"}];
const REFERENCE_REELS=[{"title":"Reel 1 · Problem to Solution","hook":"Ever had the perfect answer five minutes after the meeting ended?","scenes":["0–3s — Hook: “Ever had the perfect answer five minutes after the meeting ended?”","3–7s — Show a professional listening in a meeting but not speaking. Voiceover: “You knew exactly what you wanted to say...”","7–12s — Show hesitation. Voiceover: “...but you started searching for words and the conversation moved on.”","12–18s — Show a confident interaction. Voiceover: “With practice, you can learn to express your ideas more naturally.”","18–24s — Introduce the workshop. Voiceover: “That's what we practise in the Speak in Meetings Workshop.”","24–30s — End frame: “4-day live workshop · ₹997” and “Tap Learn More to see the details.”"]},{"title":"Reel 2 · Outcome-led","hook":"Imagine your next meeting feeling easier.","scenes":["0–3s — Show the desired outcome immediately.","3–8s — Voiceover: “You have the knowledge. You have the ideas.”","8–15s — Show the person speaking clearly. Voiceover: “The next step is expressing those ideas clearly when the moment comes.”","15–24s — Show workshop practice. Voiceover: “The Speak in Meetings Workshop gives you a focused environment to practise workplace communication.”","24–30s — End frame: “4-day live workshop · ₹997” and “Learn More.”"]},{"title":"Reel 3 · Question Format","hook":"Do you stay quiet in meetings even when you have something useful to say?","scenes":["0–3s — Put the question on screen and pause for recognition.","3–9s — Show a meeting situation. Voiceover: “Maybe you're searching for the right words.”","9–17s — Show a simple speaking exercise. Voiceover: “Maybe you're worried about making a mistake.”","17–25s — Introduce the workshop. Voiceover: “The Speak in Meetings Workshop helps you practise expressing your ideas more clearly and confidently.”","25–30s — End frame: “4-day live workshop · ₹997” and “Tap Learn More.”"]}];

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
function showTab(name){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===name));
 if(name==='copy'||name==='reels'){
   const current=brief();
   if((!Array.isArray(state.copy)||!state.copy.length||!Array.isArray(state.reels)||!state.reels.length) && current.productName){
     state.brief=current;
     generateDemo();
   }
 }
 if(name==='copy')renderCopy();
 if(name==='reels')renderReels();
 if(name==='saved')renderSaved();
 if(name==='export')renderPreview();
}
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
 const copies=Array.isArray(state.copy)?state.copy:[];
 $('copyResult').innerHTML='<div class="ad-list">'+copies.map((a,i)=>'<article class="ad-card '+(state.selectedCopy===a.name?'selected':'')+'"><h3>'+esc(a.name)+(state.selectedCopy===a.name?'<span class="selected-tag">Selected</span>':'')+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="hook">'+esc(a.hook)+'</textarea></label><label><span class="field-title">Primary Text</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="primaryText">'+esc(a.primaryText)+'</textarea></label><label><span class="field-title">Headline</span><input class="editable copy-field" data-index="'+i+'" data-key="headline" value="'+attr(a.headline)+'"></label><label><span class="field-title">Description</span><input class="editable copy-field" data-index="'+i+'" data-key="description" value="'+attr(a.description)+'"></label><label><span class="field-title">CTA</span><input class="editable copy-field" data-index="'+i+'" data-key="cta" value="'+attr(a.cta)+'"></label><div class="card-actions"><button class="secondary useCopyBtn" data-index="'+i+'">'+(state.selectedCopy===a.name?'✓ Selected':'Use This Version')+'</button><button class="secondary copyBtn" data-index="'+i+'">Copy Ad</button></div></article>').join('')+'</div><small class="demo-badge">₹0 MODE — editable; confirm before use</small>';
 document.querySelectorAll('.copy-field').forEach(el=>el.oninput=()=>{state.copy[Number(el.dataset.index)][el.dataset.key]=el.value;});
 document.querySelectorAll('.useCopyBtn').forEach(btn=>btn.onclick=()=>{state.selectedCopy=state.copy[Number(btn.dataset.index)].name;renderCopy();});
 document.querySelectorAll('.copyBtn').forEach(btn=>btn.onclick=()=>{const a=state.copy[Number(btn.dataset.index)];navigator.clipboard?.writeText(Object.entries(a).map(([k,v])=>k+': '+v).join('\n'));$('status').textContent='Ad copied';});
}
function renderCreative(){
 const assets=['reference/images/single-image-ad.svg','reference/images/carousel.svg','reference/images/instagram-story.svg','reference/images/reel-cover.svg'];
 const board='<div class="creative-board"><img src="reference/creative-board.svg" alt="Sample social media creative board for Speak in Meetings Workshop" loading="lazy"></div>';
 const cards=state.creative.map((x,i)=>'<article class="creative-card"><img class="creative-preview" src="'+assets[i]+'" alt="'+esc(x.format)+' sample creative" loading="lazy"><h3>'+esc(x.format)+'</h3><p>'+esc(x.concept)+'</p><div class="card-actions"><button class="secondary creativeEdit" data-index="'+i+'">Edit</button><button class="secondary creativeUse" data-index="'+i+'">Use Idea</button><a class="secondary creativeDownload" href="'+assets[i]+'" download>Download</a></div></article>').join('');
 $('creativeResult').innerHTML=board+'<div class="creative-grid">'+cards+'</div><small class="demo-badge">₹0 MODE — individual sample creatives included; editable before use</small>';
 document.querySelectorAll('.creativeEdit').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.index);const next=prompt('Edit the creative concept:',state.creative[i].concept);if(next!==null&&next.trim()){state.creative[i].concept=next.trim();renderCreative();}});
 document.querySelectorAll('.creativeUse').forEach(btn=>btn.onclick=()=>{$('status').textContent='Creative idea '+(Number(btn.dataset.index)+1)+' selected';});
}
function renderReels(){const reels=Array.isArray(state.reels)?state.reels:[];$('reelsResult').innerHTML='<div class="ad-list">'+reels.map((r,i)=>'<article class="ad-card"><h3>'+esc(r.title||r.name)+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="hook">'+esc(r.hook)+'</textarea></label><div class="field-title">Scenes</div><ol class="reel-scenes">'+r.scenes.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><button class="secondary copyReel" data-index="'+i+'">Copy Script</button></article>').join('')+'</div><small class="demo-badge">₹0 MODE — editable; confirm before use</small>';document.querySelectorAll('.reel-field').forEach(el=>el.oninput=()=>state.reels[Number(el.dataset.index)][el.dataset.key]=el.value);document.querySelectorAll('.copyReel').forEach(btn=>btn.onclick=()=>{const r=state.reels[Number(btn.dataset.index)];navigator.clipboard?.writeText(r.title+'\nHook: '+r.hook+'\nScenes:\n- '+r.scenes.join('\n- '));$('status').textContent='Reel script copied';});}
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
  $('status').textContent='Loading complete reference campaign…';
  try{
    const base='/reference/';
    let referenceBrief, adData, reelData;
    try{
      const [briefResponse,adResponse,reelResponse]=await Promise.all([
        fetch(base+'reference-input.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-ad-copies.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-reel-scripts.json?v='+Date.now(),{cache:'no-store'})
      ]);
      if(!briefResponse.ok)throw new Error('Reference brief '+briefResponse.status);
      if(!adResponse.ok)throw new Error('Reference ads '+adResponse.status);
      if(!reelResponse.ok)throw new Error('Reference reels '+reelResponse.status);
      referenceBrief=await briefResponse.json();
      adData=await adResponse.json();
      reelData=await reelResponse.json();
    }catch(fetchError){
      // Offline-safe fallback: the complete reference outputs are built into the app.
      // This keeps the sample campaign working even if a static JSON asset is unavailable.
      referenceBrief={
        brandName:'Coach Sapna Narayan',
        productName:'Speak in Meetings Workshop',
        productDescription:'A 4-day live workshop that helps working professionals speak clearly and confidently in meetings, presentations and workplace conversations.',
        objective:'Lead Generation',
        location:'India',
        targetCustomer:'Working professionals who hesitate to speak in English at work',
        ageRange:'25–45',
        offer:'₹997',
        budget:'₹500/day',
        problem:"I know what I want to say, but I hesitate, search for words and lose confidence when speaking in meetings.",
        outcome:'Speak naturally and confidently in meetings, express ideas clearly and participate without fear or hesitation.',
        tone:'Professional + Friendly',
        landingPage:'https://coachsapnanarayan.com/speak-in-meetings'
      };
      adData={ads:REFERENCE_ADS};
      reelData={scripts:REFERENCE_REELS};
    }

    const missing=ids.filter(id=>referenceBrief[id]===undefined);
    fillBrief(referenceBrief);
    const stillBlank=ids.filter(id=>referenceBrief[id]!==undefined&&$(id)&&$(id).value!==String(referenceBrief[id]??''));
    if(missing.length||stillBlank.length){
      throw new Error('Reference brief fields missing: '+[...new Set([...missing,...stillBlank])].join(', '));
    }

    state.brief=brief();
    generateDemo();

    state.copy=Array.isArray(adData.ads)?adData.ads.slice():REFERENCE_ADS.slice();
    state.reels=Array.isArray(reelData.scripts)?reelData.scripts.slice():REFERENCE_REELS.slice();
    state.selectedCopy=state.copy.length?state.copy[0].name:null;

    if(!state.copy.length||!state.reels.length)throw new Error('Reference outputs are empty');

    renderResults();
    $('status').textContent='Reference loaded — 3 Ad Copies + 3 Reel Scripts ready';
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