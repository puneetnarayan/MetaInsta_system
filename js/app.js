const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
let state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false};

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
function resetState(){state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false};}
function showTab(name){
 document.querySelectorAll('nav button').forEach(b=>{const active=b.dataset.tab===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
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
 const useRealAi=$('useRealAi')&&$('useRealAi').checked;
 $('generate').disabled=true;$('generate').textContent='Generating…';
 $('status').textContent=useRealAi?'Calling AI service…':'₹0 Mode — building campaign locally…';
 try{
   if(useRealAi){
     try{
       const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
       const data=await res.json();
       if(!res.ok)throw new Error(data.error||'AI request failed ('+res.status+')');
       applyAiResult(data);
       $('status').textContent='AI campaign generated (real API call — check your OpenAI usage/billing)';
     }catch(aiErr){
       generateDemo();
       $('status').textContent='Real AI generation failed ('+aiErr.message+') — showing ₹0 demo campaign instead';
     }
   }else{
     generateDemo();
     $('status').textContent='₹0 campaign generated — no paid AI/API used';
   }
   showTab('strategy');
 }catch(err){
   $('status').textContent='Campaign generation failed — '+err.message;
 }finally{$('generate').disabled=false;$('generate').textContent='Generate Campaign — ₹0';}
}
function applyAiResult(data){
 state.aiMode=true;
 state.strategy=data.strategy;
 state.copy=Array.isArray(data.copy)?data.copy:[];
 state.creative=Array.isArray(data.creative)?data.creative:[];
 state.reels=Array.isArray(data.reels)?data.reels.map(r=>({title:r.title,hook:r.hook,scenes:r.scenes})):[];
 state.selectedCopy=state.copy.length?state.copy[0].name:null;
 renderResults();
}
function generateDemo(){
 state.aiMode=false;
 const {strategy,copy,creative,reels}=CampaignGenerator.buildCampaign(state.brief);
 state.strategy=strategy;
 state.copy=copy;
 state.creative=creative;
 state.reels=reels;
 state.selectedCopy=state.copy[0].name;
 renderResults();
}
function modeBadge(){return state.aiMode?'AI MODE — generated via OpenAI API (your billing applies)':'₹0 MODE — built-in campaign engine; no paid API used';}
function shortText(value,max){return CampaignGenerator.shortText(value,max);}

function renderResults(){
 $('strategyResult').innerHTML='<h3>Campaign strategy generated — review before use</h3><div class="result-grid">'+Object.entries(state.strategy).map(([k,v])=>'<div class="result-card"><strong>'+esc(k)+'</strong><p>'+esc(Array.isArray(v)?v.join(' • '):v)+'</p></div>').join('')+'</div><small class="demo-badge">'+modeBadge()+'</small>';
 renderCopy();renderCreative();renderReels();
}
const META_LIMITS={primaryText:{limit:125,label:'Meta recommends keeping primary text short to avoid truncation — verify current limits in Meta Ads Manager'},headline:{limit:40,label:'Meta recommends short headlines — verify current limits in Meta Ads Manager'},description:{limit:30,label:'Meta link description guidance — verify current limits in Meta Ads Manager'}};
function charCountHtml(index,key,value){
 const cfg=META_LIMITS[key];
 if(!cfg)return'';
 const len=String(value||'').length;
 const over=len>cfg.limit;
 return '<small class="char-count'+(over?' over':'')+'" data-index="'+index+'" data-key="'+key+'" title="'+attr(cfg.label)+'">'+len+' / ~'+cfg.limit+' chars'+(over?' — likely truncated on some placements':'')+'</small>';
}
function renderCopy(){
 const copies=Array.isArray(state.copy)&&state.copy.length?state.copy:REFERENCE_ADS.slice();
 if(!Array.isArray(state.copy)||!state.copy.length){state.copy=copies;state.selectedCopy=state.selectedCopy||copies[0].name;}
 $('copyResult').innerHTML='<div class="ad-list">'+copies.map((a,i)=>'<article class="ad-card '+(state.selectedCopy===a.name?'selected':'')+'"><h3>'+esc(a.name)+(state.selectedCopy===a.name?'<span class="selected-tag">Selected</span>':'')+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="hook">'+esc(a.hook)+'</textarea></label><label><span class="field-title">Primary Text</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="primaryText">'+esc(a.primaryText)+'</textarea>'+charCountHtml(i,'primaryText',a.primaryText)+'</label><label><span class="field-title">Headline</span><input class="editable copy-field" data-index="'+i+'" data-key="headline" value="'+attr(a.headline)+'">'+charCountHtml(i,'headline',a.headline)+'</label><label><span class="field-title">Description</span><input class="editable copy-field" data-index="'+i+'" data-key="description" value="'+attr(a.description)+'">'+charCountHtml(i,'description',a.description)+'</label><label><span class="field-title">CTA</span><input class="editable copy-field" data-index="'+i+'" data-key="cta" value="'+attr(a.cta)+'"></label><div class="card-actions"><button class="secondary useCopyBtn" data-index="'+i+'">'+(state.selectedCopy===a.name?'✓ Selected':'Use This Version')+'</button><button class="secondary copyBtn" data-index="'+i+'">Copy Ad</button></div></article>').join('')+'</div><small class="demo-badge">'+modeBadge()+' — editable; confirm before use</small>';
 document.querySelectorAll('.copy-field').forEach(el=>el.oninput=()=>{
   const i=Number(el.dataset.index),key=el.dataset.key;
   state.copy[i][key]=el.value;
   const cfg=META_LIMITS[key];
   if(cfg){
     const counter=document.querySelector('.char-count[data-index="'+i+'"][data-key="'+key+'"]');
     if(counter){
       const len=el.value.length,over=len>cfg.limit;
       counter.textContent=len+' / ~'+cfg.limit+' chars'+(over?' — likely truncated on some placements':'');
       counter.classList.toggle('over',over);
     }
   }
 });
 document.querySelectorAll('.useCopyBtn').forEach(btn=>btn.onclick=()=>{state.selectedCopy=state.copy[Number(btn.dataset.index)].name;renderCopy();});
 document.querySelectorAll('.copyBtn').forEach(btn=>btn.onclick=()=>{const a=state.copy[Number(btn.dataset.index)];navigator.clipboard?.writeText(Object.entries(a).map(([k,v])=>k+': '+v).join('\n'));$('status').textContent='Ad copied';});
}
let editingCreativeIndex=null;
function renderCreative(){
 const assets=['reference/images/single-image-ad.svg','reference/images/carousel.svg','reference/images/instagram-story.svg','reference/images/reel-cover.svg'];
 const board='<div class="creative-board"><img src="reference/creative-board.svg" alt="Sample social media creative board for Speak in Meetings Workshop" loading="lazy"></div>';
 const cards=state.creative.map((x,i)=>{
  const body=editingCreativeIndex===i
   ?'<textarea class="editable textarea creativeEditField" data-index="'+i+'" rows="4">'+esc(x.concept)+'</textarea><div class="card-actions"><button class="secondary creativeSave" data-index="'+i+'">Save</button><button class="ghost creativeCancel" data-index="'+i+'">Cancel</button></div>'
   :'<p>'+esc(x.concept)+'</p><div class="card-actions"><button class="secondary creativeEdit" data-index="'+i+'">Edit</button><button class="secondary creativeUse" data-index="'+i+'">Use Idea</button><a class="secondary creativeDownload" href="'+assets[i]+'" download>Download</a></div>';
  return '<article class="creative-card"><img class="creative-preview" src="'+assets[i]+'" alt="'+esc(x.format)+' sample creative" loading="lazy"><h3>'+esc(x.format)+'</h3>'+body+'</article>';
 }).join('');
 $('creativeResult').innerHTML=board+'<div class="creative-grid">'+cards+'</div><small class="demo-badge">'+modeBadge()+' — individual sample creatives included; editable before use</small>';
 document.querySelectorAll('.creativeEdit').forEach(btn=>btn.onclick=()=>{editingCreativeIndex=Number(btn.dataset.index);renderCreative();});
 document.querySelectorAll('.creativeCancel').forEach(btn=>btn.onclick=()=>{editingCreativeIndex=null;renderCreative();});
 document.querySelectorAll('.creativeSave').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.index);const field=document.querySelector('.creativeEditField[data-index="'+i+'"]');if(field&&field.value.trim())state.creative[i].concept=field.value.trim();editingCreativeIndex=null;renderCreative();});
 document.querySelectorAll('.creativeUse').forEach(btn=>btn.onclick=()=>{$('status').textContent='Creative idea '+(Number(btn.dataset.index)+1)+' selected';});
}
function renderReels(){
 const reels=Array.isArray(state.reels)&&state.reels.length?state.reels:REFERENCE_REELS.slice();
 if(!Array.isArray(state.reels)||!state.reels.length)state.reels=reels;
 $('reelsResult').innerHTML='<div class="ad-list">'+reels.map((r,i)=>'<article class="ad-card"><h3>'+esc(r.title||r.name)+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="hook">'+esc(r.hook)+'</textarea></label><div class="field-title">Scenes</div><ol class="reel-scenes">'+(Array.isArray(r.scenes)?r.scenes:[]).map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><button class="secondary copyReel" data-index="'+i+'">Copy Script</button></article>').join('')+'</div><small class="demo-badge">'+modeBadge()+' — editable; confirm before use</small>';
 document.querySelectorAll('.reel-field').forEach(el=>el.oninput=()=>state.reels[Number(el.dataset.index)][el.dataset.key]=el.value);
 document.querySelectorAll('.copyReel').forEach(btn=>btn.onclick=()=>{const r=state.reels[Number(btn.dataset.index)];navigator.clipboard?.writeText(r.title+'\nHook: '+r.hook+'\nScenes:\n- '+r.scenes.join('\n- '));$('status').textContent='Reel script copied';});
}
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
function startNewCampaign(){ids.forEach(id=>$(id).value='');resetState();$('strategyResult').innerHTML='<div class="placeholder">Complete the brief and generate a strategy.</div>';$('copyResult').innerHTML='<div class="placeholder">Generate a campaign to create ad copy.</div>';$('creativeResult').innerHTML='<article><h3>Image Ad</h3><p>Visual concept and text hierarchy.</p></article><article><h3>Carousel</h3><p>Problem → solution → proof → CTA.</p></article><article><h3>Story</h3><p>Vertical 9:16 concept.</p></article><article><h3>Reel</h3><p>Scene-by-scene creative concept.</p></article>';$('reelsResult').innerHTML='<div class="placeholder">Generate a campaign to create reel scripts.</div>';$('status').textContent='New campaign ready';showTab('brief');}
$('newCampaign').onclick=()=>{$('newCampaignConfirm').hidden=false;};
$('confirmNewCampaign').onclick=()=>{$('newCampaignConfirm').hidden=true;startNewCampaign();};
$('cancelNewCampaign').onclick=()=>{$('newCampaignConfirm').hidden=true;};
$('clear').onclick=()=>{$('newCampaignConfirm').hidden=false;};
$('exportJson').onclick=()=>download('ai-ads-campaign.json',JSON.stringify(state,null,2),'application/json');$('exportText').onclick=()=>download('ai-ads-campaign.txt',Object.entries(brief()).map(([k,v])=>k+': '+v).join('\n'),'text/plain');
function renderSaved(){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');$('savedList').innerHTML=items.length?items.map(x=>'<div class="saved-card"><div class="saved-meta"><strong>'+esc(x.brief.productName||'Untitled campaign')+'</strong><small>'+esc(x.brief.brandName||'')+' · '+new Date(x.savedAt).toLocaleString()+'</small></div><div class="saved-actions"><button class="secondary loadBtn" data-id="'+x.id+'">Load</button><button class="secondary duplicateBtn" data-id="'+x.id+'">Duplicate</button><button class="secondary danger deleteBtn" data-id="'+x.id+'">Delete</button></div></div>').join(''):'<div class="placeholder">No saved campaigns yet.</div>';document.querySelectorAll('.loadBtn').forEach(btn=>btn.onclick=()=>loadCampaign(Number(btn.dataset.id)));document.querySelectorAll('.duplicateBtn').forEach(btn=>btn.onclick=()=>duplicateCampaign(Number(btn.dataset.id)));document.querySelectorAll('.deleteBtn').forEach(btn=>btn.onclick=()=>deleteCampaign(Number(btn.dataset.id)));}
function duplicateCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');const item=items.find(x=>x.id===id);if(!item)return;const copyBrief={...item.brief,productName:(item.brief.productName||'Untitled campaign')+' (Copy)'};const copyState=item.state?{...item.state,brief:copyBrief}:{brief:copyBrief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false};items.unshift({id:Date.now(),savedAt:new Date().toISOString(),brief:copyBrief,state:copyState});localStorage.setItem('aiAdsCampaigns',JSON.stringify(items.slice(0,50)));renderSaved();$('status').textContent='Campaign duplicated';}
function loadCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');const item=items.find(x=>x.id===id);if(!item)return;fillBrief(item.brief);state=item.state||{brief:item.brief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null};if(!state.copy)generateDemo();else{renderResults();}state.brief=item.brief;$('status').textContent='Saved campaign loaded';showTab('strategy');}
function deleteCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]').filter(x=>x.id!==id);localStorage.setItem('aiAdsCampaigns',JSON.stringify(items));renderSaved();}
function renderPreview(){$('preview').textContent=JSON.stringify(state,null,2);}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function attr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}