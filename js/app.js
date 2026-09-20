const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
function defaultAiConfig(){return {master:false,stages:{strategy:false,copy:false,creative:false,images:false,reels:false},textProvider:'openai',textModel:AI_MODELS.openai.text[0],imageProvider:'openai',imageModel:AI_MODELS.openai.image[0],imageQuality:'medium',imageAspectRatio:'1:1'};}
function emptyAiUsage(){return {strategy:null,copy:null,creative:null,images:null,reels:null};}
function defaultAudience(){return {primaryCustomer:'',location:'',age:'',gender:'Any',occupation:'',income:'Mid-market',problem:'',outcome:'',awareness:'Problem Aware',intent:'Warm',strategies:['Broad'],plan:null,matrix:[]};}
function defaultOffer(){return {product:'',price:'',discount:'',duration:'',scarcity:'',cta:'',bonuses:'',guarantee:'',proof:'',analysis:null,variants:null};}
let state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:null,aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer()};

const REFERENCE_ADS=[{"name":"Ad Version 1 · Problem-led","hook":"Still knowing what you want to say — but hesitating when it's your turn to speak?","primaryText":"You know the answer.\n\nYou have an idea.\n\nBut when the meeting turns to you, you suddenly start searching for words, translating in your head or wondering whether you are saying it correctly.\n\nIf this sounds familiar, you are not alone.\n\nThe Speak in Meetings Workshop is designed for working professionals who want to express their ideas more clearly and participate with greater confidence in workplace conversations.\n\n4-day live workshop · ₹997\n\nExplore the workshop and see if it is right for you.","headline":"Speak with more confidence in meetings","description":"4-day live workshop for working professionals.","cta":"Learn More"},{"name":"Ad Version 2 · Outcome-led","hook":"Imagine expressing your idea clearly when the meeting turns to you.","primaryText":"You don't necessarily need more words.\n\nYou need to feel more comfortable using the words you already know.\n\nThe Speak in Meetings Workshop helps working professionals practise how to express ideas, respond naturally and participate more confidently in workplace conversations.\n\nIf your goal is to speak more clearly without constantly worrying about finding the perfect words, this workshop may be a useful next step.\n\n4-day live workshop · ₹997","headline":"Express your ideas with confidence","description":"Practical workplace communication training.","cta":"Learn More"},{"name":"Ad Version 3 · Conversational","hook":"Quick question: do you stay quiet in meetings even when you have something useful to say?","primaryText":"Maybe you know exactly what you want to say.\n\nThen the moment comes.\n\nYou hesitate.\n\nYou search for the right words.\n\nSomeone else speaks.\n\nAnd the opportunity passes.\n\nThe Speak in Meetings Workshop is created for working professionals who want to become more comfortable expressing themselves in meetings and workplace conversations.\n\nLearn, practise and build confidence through a focused 4-day live workshop.\n\n₹997","headline":"Have something to say? Say it clearly.","description":"Build practical speaking confidence at work.","cta":"Learn More"}];
const REFERENCE_REELS=[{"title":"Reel 1 · Problem to Solution","hook":"Ever had the perfect answer five minutes after the meeting ended?","scenes":["0–3s — Hook: “Ever had the perfect answer five minutes after the meeting ended?”","3–7s — Show a professional listening in a meeting but not speaking. Voiceover: “You knew exactly what you wanted to say...”","7–12s — Show hesitation. Voiceover: “...but you started searching for words and the conversation moved on.”","12–18s — Show a confident interaction. Voiceover: “With practice, you can learn to express your ideas more naturally.”","18–24s — Introduce the workshop. Voiceover: “That's what we practise in the Speak in Meetings Workshop.”","24–30s — End frame: “4-day live workshop · ₹997” and “Tap Learn More to see the details.”"]},{"title":"Reel 2 · Outcome-led","hook":"Imagine your next meeting feeling easier.","scenes":["0–3s — Show the desired outcome immediately.","3–8s — Voiceover: “You have the knowledge. You have the ideas.”","8–15s — Show the person speaking clearly. Voiceover: “The next step is expressing those ideas clearly when the moment comes.”","15–24s — Show workshop practice. Voiceover: “The Speak in Meetings Workshop gives you a focused environment to practise workplace communication.”","24–30s — End frame: “4-day live workshop · ₹997” and “Learn More.”"]},{"title":"Reel 3 · Question Format","hook":"Do you stay quiet in meetings even when you have something useful to say?","scenes":["0–3s — Put the question on screen and pause for recognition.","3–9s — Show a meeting situation. Voiceover: “Maybe you're searching for the right words.”","9–17s — Show a simple speaking exercise. Voiceover: “Maybe you're worried about making a mistake.”","17–25s — Introduce the workshop. Voiceover: “The Speak in Meetings Workshop helps you practise expressing your ideas more clearly and confidently.”","25–30s — End frame: “4-day live workshop · ₹997” and “Tap Learn More.”"]}];
const REFERENCE_STRATEGY={"objective": "Generate qualified leads from working professionals in India who want to communicate more confidently in workplace meetings.", "audience": "Working professionals aged approximately 25–45 who understand English but hesitate when speaking in meetings, presentations or workplace conversations. They may know the answer but hesitate to speak, mentally translate before responding, search for the right words while speaking, avoid participating in meetings and worry about making mistakes. They want to sound clear and professional rather than simply \"speak more English.\"", "corePain": "I know what I want to say, but when the meeting starts I hesitate, search for words and lose confidence.", "desiredOutcome": "Move the customer from hesitation to clear expression, greater confidence and more participation, focused on practical workplace communication rather than presenting fluency as an abstract goal.", "positioning": "Speak in Meetings Workshop is positioned as a practical, focused workshop for working professionals who want to communicate more clearly and confidently during real workplace situations.", "keyMessage": "You may already have the intent or ability to express yourself. The barrier is turning that intention into action. The workshop provides a structured way to practise the communication skills needed in meetings and workplace conversations.", "funnelAngle": "Problem awareness → Recognition → Practical solution → Workshop → Lead. The first interaction should make the viewer recognise their own situation before the workshop is introduced as a possible next step.", "testing": ["Test 1 — Problem-led: focus on hesitation, searching for words and staying silent in meetings.", "Test 2 — Outcome-led: focus on speaking clearly, expressing ideas and participating confidently.", "Test 3 — Question-led: use questions that make the viewer reflect on their own meeting experience."], "tone": "Professional + Friendly"};
const REFERENCE_CREATIVE=[{"format": "Single Image Ad", "concept": "Show a professional sitting in a meeting while others are speaking. They have an idea but appear hesitant to raise their hand or enter the conversation. On-image headline: \"I know what I want to say...\" Supporting text: \"...but I hesitate when it's my turn.\" Bottom CTA: \"Speak with more confidence in meetings.\" Visual direction: a clean professional workplace photograph, with the text kept minimal and readable on mobile."}, {"format": "Carousel", "concept": "Card 1 — Problem: \"Do you hesitate before speaking in meetings?\" Card 2 — Recognition: You know the idea, you just struggle to express it quickly. Card 3 — Insight: You don't always need more vocabulary — you need practice expressing your ideas naturally. Card 4 — Solution: Speak in Meetings Workshop, a focused 4-day live workshop for working professionals. Card 5 — CTA: \"Ready to speak with more confidence?\" ₹997 · Learn More."}, {"format": "Instagram Story", "concept": "Frame 1: Meeting starts, someone asks \"What do you think?\" Frame 2: You know the answer, but you start searching for the right words. Frame 3: What if you could express your ideas more naturally? Frame 4: Speak in Meetings Workshop — 4-day live workshop for working professionals. Frame 5: ₹997 — Explore the workshop. Learn More."}, {"format": "Instagram Reel", "concept": "A short 20–30 second video contrasting hesitation with confident participation. Opening text: \"Ever had the perfect answer... after the meeting ended?\" Visual sequence: person in an online meeting → manager asks a question → person hesitates → another participant answers → person later thinks of the answer → transition to the workshop → show practical speaking practice → end with workshop details. End frame: Speak in Meetings Workshop, 4-day live workshop · ₹997 · Learn More."}];

// AI provider/model catalog. Keep model names in one place so they can be updated later.
const AI_MODELS={
 openai:{text:['gpt-5.6-luna'],image:['gpt-image-1.5']},
 anthropic:{text:['claude-sonnet-5']}
};
// Approximate, sourced provider pricing — always shown as an ESTIMATE, never a live rate.
const AI_COST_CONFIG={
 openai:{textInputPerMillion:0.20,textOutputPerMillion:1.20},
 anthropic:{textInputPerMillion:2.00,textOutputPerMillion:10.00},
 image:{low:0.02,medium:0.07,high:0.19}
};
const USD_TO_INR=88; // approximate conversion for display only — not a live exchange rate
const PLANNING_TOKENS={
 strategy:{input:1500,output:800},
 copy:{input:1500,output:1500},
 creative:{input:1200,output:1000},
 reels:{input:1300,output:1200}
};
const ASSET_BY_FORMAT={'Single Image Ad':'reference/images/single-image-ad.svg','Carousel':'reference/images/carousel.svg','Instagram Story':'reference/images/instagram-story.svg','Instagram Reel':'reference/images/reel-cover.svg'};

function providerLabel(p){return p==='anthropic'?'Anthropic API':'OpenAI API';}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function formatInr(usd){return '₹'+(usd*USD_TO_INR).toFixed(2);}
function estimateStageCostUsd(stage,provider){const t=PLANNING_TOKENS[stage];const prices=AI_COST_CONFIG[provider];if(!t||!prices)return 0;return (t.input/1e6)*prices.textInputPerMillion+(t.output/1e6)*prices.textOutputPerMillion;}
function actualStageCostUsd(stage,provider,usage){const prices=AI_COST_CONFIG[provider];if(!usage||!prices)return estimateStageCostUsd(stage,provider);const inTok=usage.inputTokens||0,outTok=usage.outputTokens||0;return (inTok/1e6)*prices.textInputPerMillion+(outTok/1e6)*prices.textOutputPerMillion;}
function estimateImageCostUsd(quality,count){const perImage=AI_COST_CONFIG.image[quality]||AI_COST_CONFIG.image.medium;return perImage*count;}
function stageIsAi(stage){return !!(state.aiConfig&&state.aiConfig.master&&state.aiConfig.stages[stage]);}

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
function resetState(){
 const keepAiConfig=state.aiConfig||defaultAiConfig();
 state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:keepAiConfig,aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer()};
}
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
 if(name==='audience'&&!state.audience.primaryCustomer&&!state.audience.problem){
   const currentBrief=brief();
   fillAudienceInputs(Object.assign({},state.audience,{primaryCustomer:currentBrief.targetCustomer||'',location:currentBrief.location||'',age:currentBrief.ageRange||'',problem:currentBrief.problem||'',outcome:currentBrief.outcome||''}));
 }else if(name==='audience'){
   fillAudienceInputs(state.audience);
 }
 if(name==='offer'&&!state.offer.product&&!state.offer.price){
   const currentBrief=brief();
   fillOfferInputs(Object.assign({},state.offer,{product:currentBrief.productName||'',price:currentBrief.offer||''}));
 }else if(name==='offer'){
   fillOfferInputs(state.offer);
 }
 if(name==='audience')renderAudiencePlan(),renderAudienceMatrix();
 if(name==='offer')renderOfferAnalysis();
 if(name==='copy')renderCopy();
 if(name==='reels')renderReels();
 if(name==='saved')renderSaved();
 if(name==='export')renderPreview();
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

// ---- AI Control panel ----
function syncModelOptions(){
 const tp=$('textProviderSelect').value;
 $('textModelSelect').innerHTML=AI_MODELS[tp].text.map(m=>'<option value="'+m+'">'+m+'</option>').join('');
 const ip=$('imageProviderSelect').value;
 $('imageModelSelect').innerHTML=AI_MODELS[ip].image.map(m=>'<option value="'+m+'">'+m+'</option>').join('');
}
function readAiConfigFromUI(){
 if(!state.aiConfig)state.aiConfig=defaultAiConfig();
 state.aiConfig.master=$('aiMasterSwitch').checked;
 document.querySelectorAll('.ai-stage-grid input[type=checkbox]').forEach(el=>{state.aiConfig.stages[el.dataset.stage]=el.checked;});
 state.aiConfig.textProvider=$('textProviderSelect').value;
 state.aiConfig.textModel=$('textModelSelect').value;
 state.aiConfig.imageProvider=$('imageProviderSelect').value;
 state.aiConfig.imageModel=$('imageModelSelect').value;
 state.aiConfig.imageQuality=$('imageQualitySelect').value;
 state.aiConfig.imageAspectRatio=$('imageAspectSelect').value;
}
function applyAiConfigToUI(){
 const cfg=state.aiConfig=state.aiConfig||defaultAiConfig();
 $('aiMasterSwitch').checked=!!cfg.master;
 document.querySelectorAll('.ai-stage-grid input[type=checkbox]').forEach(el=>{el.checked=!!cfg.stages[el.dataset.stage];});
 $('textProviderSelect').value=cfg.textProvider||'openai';
 $('imageProviderSelect').value=cfg.imageProvider||'openai';
 syncModelOptions();
 $('textModelSelect').value=cfg.textModel||AI_MODELS[state.aiConfig.textProvider].text[0];
 $('imageModelSelect').value=cfg.imageModel||AI_MODELS[state.aiConfig.imageProvider].image[0];
 $('imageQualitySelect').value=cfg.imageQuality||'medium';
 $('imageAspectSelect').value=cfg.imageAspectRatio||'1:1';
 readAiConfigFromUI();
 renderAiControlSummary();
}
function onAiControlChange(){syncModelOptions();readAiConfigFromUI();renderAiControlSummary();}
function renderAiUsageSummary(){
 const pre=$('aiUsagePre');
 if(!pre)return;
 const rows=['strategy','copy','creative','images','reels'].map(stage=>{
   const u=state.aiUsage[stage];
   const label=capitalize(stage);
   if(!u)return label+': ₹0.00 '+(stageIsAi(stage)?'(AI on — not yet generated)':'BUILT-IN');
   if(stage==='images')return label+': '+formatInr(u.costUsd||0)+' ESTIMATE ('+(u.imageCount||0)+' images, '+(u.aspectRatio||'1:1')+', '+providerLabel(u.provider)+')';
   return label+': '+formatInr(u.costUsd||0)+' ('+providerLabel(u.provider)+', in:'+(u.inputTokens||0)+' out:'+(u.outputTokens||0)+' tokens)';
 });
 const totalUsd=['strategy','copy','creative','reels'].reduce((s,st)=>s+((state.aiUsage[st]&&state.aiUsage[st].costUsd)||0),0)+((state.aiUsage.images&&state.aiUsage.images.costUsd)||0);
 pre.textContent=rows.join('\n')+'\n\nCampaign total: '+formatInr(totalUsd);
}
function renderAiControlSummary(){
 if(!state.aiConfig)return;
 const activeTextStages=['strategy','copy','creative','reels'].filter(stageIsAi);
 const totalEstUsd=activeTextStages.reduce((sum,s)=>sum+estimateStageCostUsd(s,state.aiConfig.textProvider),0);
 $('aiCostEstimate').textContent=formatInr(totalEstUsd)+' (estimate)';
 $('aiModeLabel').textContent=!state.aiConfig.master
   ?'AI OFF — ₹0 built-in engine'
   :(activeTextStages.length||stageIsAi('images'))
     ?'AI ON — selective stages enabled'
     :'AI ON — no stages enabled yet (still ₹0)';
 $('generate').textContent=activeTextStages.length?('Generate Campaign — Est. '+formatInr(totalEstUsd)):'Generate Campaign — ₹0';

 ['strategy','copy','creative','reels'].forEach(stage=>{
   const el=$('aiStatus'+capitalize(stage));
   if(!el)return;
   el.textContent=stageIsAi(stage)?('AI ON • '+providerLabel(state.aiConfig.textProvider)):'AI OFF • ₹0 built-in';
 });

 const imagesOn=stageIsAi('images');
 $('generateImagesBtn').disabled=!imagesOn;
 $('aiImagesStatus').textContent=imagesOn?('AI ON • '+providerLabel(state.aiConfig.imageProvider)):'AI Images OFF — showing ₹0 reference creatives';
 const perImg=AI_COST_CONFIG.image[state.aiConfig.imageQuality]||AI_COST_CONFIG.image.medium;
 $('aiImagesCostEstimate').textContent=imagesOn?('Estimated '+formatInr(perImg*4)+' for 4 images'):'';

 renderAiUsageSummary();
}

async function generateAI(){
 const b=state.brief;
 if(!b.brandName||!b.productName||!b.targetCustomer){$('status').textContent='Enter brand, product/service and target customer.';return;}
 $('generate').disabled=true;
 $('generate').textContent='Generating…';
 $('status').textContent='Building campaign…';
 try{
   const local=CampaignGenerator.buildCampaign(b);
   state.strategy=local.strategy;
   state.copy=local.copy;
   state.creative=local.creative;
   state.reels=local.reels;
   state.selectedCopy=state.copy[0].name;
   state.aiMode=false;
   state.aiUsage.strategy=null;state.aiUsage.copy=null;state.aiUsage.creative=null;state.aiUsage.reels=null;

   const stagesToTry=['strategy','copy','creative','reels'].filter(stageIsAi);
   let anyAiFailed=false;
   for(const stage of stagesToTry){
     $('status').textContent='Calling '+providerLabel(state.aiConfig.textProvider)+' for '+stage+'…';
     try{
       const data=await callGenerateStage(stage,b);
       applyAiStageResult(stage,data,b);
       state.aiMode=true;
     }catch(stageErr){
       anyAiFailed=true;
       $('status').textContent=stage+' AI generation failed ('+stageErr.message+') — showing ₹0 built-in result instead';
     }
   }

   renderResults();
   if(!stagesToTry.length)$('status').textContent='₹0 campaign generated — no paid AI/API used';
   else if(!anyAiFailed)$('status').textContent='Campaign generated — some stages used AI, see AI Usage for cost';
   showTab('strategy');
 }catch(err){
   $('status').textContent='Campaign generation failed — '+err.message;
 }finally{
   $('generate').disabled=false;
   renderAiControlSummary();
 }
}
async function callGenerateStage(stage,b,extra){
 const payload=Object.assign({stage,provider:state.aiConfig.textProvider,model:state.aiConfig.textModel,brief:b},extra||{});
 const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const data=await res.json();
 if(!res.ok)throw new Error(data.error||'AI request failed ('+res.status+')');
 return data;
}
function applyAiStageResult(stage,data,b){
 if(stage==='strategy'){
   const s=data.strategy||{};
   s.tone=b.tone||s.tone||'Professional + Friendly';
   state.strategy=s;
 }
 if(stage==='copy'&&Array.isArray(data.copy)&&data.copy.length){
   state.copy=data.copy;
   state.selectedCopy=state.copy[0].name;
 }
 if(stage==='creative'&&Array.isArray(data.creative)&&data.creative.length){
   state.creative=data.creative;
 }
 if(stage==='reels'&&Array.isArray(data.reels)&&data.reels.length){
   state.reels=data.reels;
 }
 state.aiUsage[stage]={
   provider:state.aiConfig.textProvider,
   model:state.aiConfig.textModel,
   inputTokens:(data.usage&&data.usage.inputTokens)||0,
   outputTokens:(data.usage&&data.usage.outputTokens)||0,
   costUsd:actualStageCostUsd(stage,state.aiConfig.textProvider,data.usage)
 };
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
function stageBadge(stage){
 const usage=state.aiUsage&&state.aiUsage[stage];
 if(usage)return 'AI MODE — '+providerLabel(usage.provider)+' ('+usage.model+'); est. cost '+formatInr(usage.costUsd||0);
 return '₹0 MODE — built-in campaign engine; no paid API used';
}
function shortText(value,max){return CampaignGenerator.shortText(value,max);}

function renderResults(){
 $('strategyResult').innerHTML='<h3>Campaign strategy generated — review before use</h3><div class="result-grid">'+Object.entries(state.strategy).map(([k,v])=>'<div class="result-card"><strong>'+esc(k)+'</strong><p>'+esc(Array.isArray(v)?v.join(' • '):v)+'</p></div>').join('')+'</div><small class="demo-badge">'+stageBadge('strategy')+'</small>';
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
 $('copyResult').innerHTML='<div class="copy-list">'+copies.map((a,i)=>'<article class="copy-card '+(state.selectedCopy===a.name?'selected':'')+'"><h3>'+esc(a.name)+(state.selectedCopy===a.name?'<span class="selected-tag">Selected</span>':'')+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="hook">'+esc(a.hook)+'</textarea></label><label><span class="field-title">Primary Text</span><textarea class="editable textarea copy-field" data-index="'+i+'" data-key="primaryText">'+esc(a.primaryText)+'</textarea>'+charCountHtml(i,'primaryText',a.primaryText)+'</label><label><span class="field-title">Headline</span><input class="editable copy-field" data-index="'+i+'" data-key="headline" value="'+attr(a.headline)+'">'+charCountHtml(i,'headline',a.headline)+'</label><label><span class="field-title">Description</span><input class="editable copy-field" data-index="'+i+'" data-key="description" value="'+attr(a.description)+'">'+charCountHtml(i,'description',a.description)+'</label><label><span class="field-title">CTA</span><input class="editable copy-field" data-index="'+i+'" data-key="cta" value="'+attr(a.cta)+'"></label><div class="card-actions"><button class="secondary useCopyBtn" data-index="'+i+'">'+(state.selectedCopy===a.name?'✓ Selected':'Use This Version')+'</button><button class="secondary copyBtn" data-index="'+i+'">Copy Ad</button></div></article>').join('')+'</div><small class="demo-badge">'+stageBadge('copy')+' — editable; confirm before use</small>';
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
  const aiImg=Array.isArray(state.aiImages)?state.aiImages.find(img=>img.format===x.format):null;
  const fallbackSrc=ASSET_BY_FORMAT[x.format]||assets[i%assets.length];
  const previewSrc=aiImg?aiImg.image:fallbackSrc;
  const body=editingCreativeIndex===i
   ?'<textarea class="editable textarea creativeEditField" data-index="'+i+'" rows="4">'+esc(x.concept)+'</textarea><div class="card-actions"><button class="secondary creativeSave" data-index="'+i+'">Save</button><button class="ghost creativeCancel" data-index="'+i+'">Cancel</button></div>'
   :'<p>'+esc(x.concept)+'</p><div class="card-actions"><button class="secondary creativeEdit" data-index="'+i+'">Edit</button><button class="secondary creativeUse" data-index="'+i+'">Use Idea</button><a class="secondary creativeDownload" href="'+previewSrc+'" download>Download'+(aiImg?' AI Image':'')+'</a></div>';
  return '<article class="creative-card"><img class="creative-preview" src="'+previewSrc+'" alt="'+esc(x.format)+(aiImg?' AI-generated creative':' sample creative')+'" loading="lazy"><h3>'+esc(x.format)+(aiImg?'<span class="ai-badge">AI</span>':'')+'</h3>'+body+'</article>';
 }).join('');
 $('creativeResult').innerHTML=board+'<div class="creative-grid">'+cards+'</div><small class="demo-badge">'+stageBadge('creative')+' — individual sample creatives included; editable before use</small>';
 document.querySelectorAll('.creativeEdit').forEach(btn=>btn.onclick=()=>{editingCreativeIndex=Number(btn.dataset.index);renderCreative();});
 document.querySelectorAll('.creativeCancel').forEach(btn=>btn.onclick=()=>{editingCreativeIndex=null;renderCreative();});
 document.querySelectorAll('.creativeSave').forEach(btn=>btn.onclick=()=>{const i=Number(btn.dataset.index);const field=document.querySelector('.creativeEditField[data-index="'+i+'"]');if(field&&field.value.trim())state.creative[i].concept=field.value.trim();editingCreativeIndex=null;renderCreative();});
 document.querySelectorAll('.creativeUse').forEach(btn=>btn.onclick=()=>{$('status').textContent='Creative idea '+(Number(btn.dataset.index)+1)+' selected';});
}
function renderReels(){
 const reels=Array.isArray(state.reels)&&state.reels.length?state.reels:REFERENCE_REELS.slice();
 if(!Array.isArray(state.reels)||!state.reels.length)state.reels=reels;
 $('reelsResult').innerHTML='<div class="copy-list">'+reels.map((r,i)=>'<article class="copy-card"><h3>'+esc(r.title||r.name)+'</h3><label><span class="field-title">Hook</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="hook">'+esc(r.hook)+'</textarea></label><div class="field-title">Scenes</div><ol class="reel-scenes">'+(Array.isArray(r.scenes)?r.scenes:[]).map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><button class="secondary copyReel" data-index="'+i+'">Copy Script</button></article>').join('')+'</div><small class="demo-badge">'+stageBadge('reels')+' — editable; confirm before use</small>';
 document.querySelectorAll('.reel-field').forEach(el=>el.oninput=()=>state.reels[Number(el.dataset.index)][el.dataset.key]=el.value);
 document.querySelectorAll('.copyReel').forEach(btn=>btn.onclick=()=>{const r=state.reels[Number(btn.dataset.index)];navigator.clipboard?.writeText(r.title+'\nHook: '+r.hook+'\nScenes:\n- '+r.scenes.join('\n- '));$('status').textContent='Reel script copied';});
}
async function regenerate(type){
 if(!state.brief.productName){$('status').textContent='Generate a campaign first.';showTab('brief');return;}
 if(stageIsAi(type)){
   $('status').textContent='Calling '+providerLabel(state.aiConfig.textProvider)+' for '+type+'…';
   try{
     const data=await callGenerateStage(type,state.brief);
     applyAiStageResult(type,data,state.brief);
     if(type==='copy')renderCopy();
     if(type==='creative')renderCreative();
     if(type==='reels')renderReels();
     if(type==='strategy')renderResults();
     $('status').textContent='New '+type+' generated via '+providerLabel(state.aiConfig.textProvider);
     showTab(type);
     renderAiControlSummary();
     return;
   }catch(err){
     $('status').textContent=type+' AI regeneration failed ('+err.message+') — showing ₹0 variation instead';
   }
 }
 const oldBrief={...state.brief};
 const local=CampaignGenerator.buildCampaign(state.brief);
 const stamp=' · Regenerated '+new Date().toLocaleTimeString();
 if(type==='strategy'){state.strategy=local.strategy;state.strategy.testing=state.strategy.testing.map(x=>x+stamp);state.aiUsage.strategy=null;renderResults();showTab('strategy');}
 if(type==='copy'){state.copy=local.copy.map((a,i)=>({...a,name:a.name+stamp,hook:i===0?'A different way to look at '+(oldBrief.problem||'the problem')+'.':i===1?'What if '+(oldBrief.outcome||'the desired result')+' became easier to reach?':'Could this be the practical next step you have been looking for?'}));state.selectedCopy=state.copy[0].name;state.aiUsage.copy=null;renderCopy();showTab('copy');}
 if(type==='creative'){state.creative=local.creative.map((x,i)=>({...x,concept:'Alternative angle '+(i+1)+': '+x.concept}));state.aiUsage.creative=null;renderCreative();showTab('creative');}
 if(type==='reels'){state.reels=local.reels.map((r,i)=>({...r,title:r.title+stamp,hook:i===0?'Here is another way to think about '+(oldBrief.outcome||'the desired outcome')+'.':r.hook}));state.aiUsage.reels=null;renderReels();showTab('reels');}
 $('status').textContent='New '+type+' ideas generated — ₹0';
 renderAiControlSummary();
}

// ---- Phase 2: Audience Builder (₹0, local heuristics) ----
const AWARENESS_GUIDANCE={
 'Unaware':'They do not yet recognise the problem. Lead with a relatable scenario or question before naming a solution.',
 'Problem Aware':'They know the problem but not the solution. Lead with the problem in their own words, then introduce a solution.',
 'Solution Aware':'They know solutions like this exist but not yours. Lead with what makes this one different.',
 'Product Aware':'They know this product but have not decided. Lead with proof, offer details and objection handling.',
 'Most Aware':'They are ready to buy. Lead with the offer and a clear CTA.'
};
const AUDIENCE_STRATEGY_NOTES={
 'Broad':'Let Meta’s delivery system find responders with minimal targeting restrictions.',
 'Interest':'Target based on stated interests and behaviours related to the problem or outcome.',
 'Custom':'Target people who already interacted with the brand (site visitors, engagers, customer lists).',
 'Lookalike':'Target people who resemble an existing high-value custom audience.',
 'Advantage+':'Let Meta’s automated targeting combine signals across audience types.',
 'Retargeting':'Re-engage people who showed intent but did not convert.'
};
function audienceInputs(){
 return {
  primaryCustomer:$('audPrimaryCustomer').value.trim(),
  location:$('audLocation').value.trim(),
  age:$('audAge').value.trim(),
  gender:$('audGender').value,
  occupation:$('audOccupation').value.trim(),
  income:$('audIncome').value,
  problem:$('audProblem').value.trim(),
  outcome:$('audOutcome').value.trim(),
  awareness:$('audAwareness').value,
  intent:$('audIntent').value,
  strategies:Array.from(document.querySelectorAll('.audStrategyBox:checked')).map(el=>el.value)
 };
}
function fillAudienceInputs(a){
 if(!a)return;
 $('audPrimaryCustomer').value=a.primaryCustomer||'';
 $('audLocation').value=a.location||'';
 $('audAge').value=a.age||'';
 $('audGender').value=a.gender||'Any';
 $('audOccupation').value=a.occupation||'';
 $('audIncome').value=a.income||'Mid-market';
 $('audProblem').value=a.problem||'';
 $('audOutcome').value=a.outcome||'';
 $('audAwareness').value=a.awareness||'Problem Aware';
 $('audIntent').value=a.intent||'Warm';
 const strategies=a.strategies&&a.strategies.length?a.strategies:['Broad'];
 document.querySelectorAll('.audStrategyBox').forEach(el=>{el.checked=strategies.includes(el.value);});
}
function generateAudiencePlan(){
 state.brief=brief();
 const a=audienceInputs();
 state.audience=Object.assign(state.audience||defaultAudience(),a);
 const clean=s=>String(s).trim().replace(/[.!?]+$/,'');
 const customer=a.primaryCustomer||state.brief.targetCustomer||'your ideal customer';
 const problem=a.problem||state.brief.problem||'a frustrating problem';
 const outcome=a.outcome||state.brief.outcome||'a clear desired outcome';
 const strategies=a.strategies.length?a.strategies:['Broad'];
 const plan={
  primaryAudience:customer+(a.age?' · '+a.age:'')+(a.gender&&a.gender!=='Any'?' · '+a.gender:'')+(a.occupation?' · '+a.occupation:'')+(a.location?' · '+a.location:''),
  pain:problem,
  motivation:outcome,
  awareness:a.awareness+' — '+(AWARENESS_GUIDANCE[a.awareness]||''),
  message:'For '+clean(customer).toLowerCase()+' dealing with '+clean(problem).toLowerCase()+', position the offer as the practical next step toward '+clean(outcome).toLowerCase()+'.',
  options:strategies.map(s=>s+': '+(AUDIENCE_STRATEGY_NOTES[s]||''))
 };
 state.audience.plan=plan;
 if(!Array.isArray(state.audience.matrix)||!state.audience.matrix.length){
   const angles=['Problem-led','Outcome-led','Question-led'];
   state.audience.matrix=strategies.slice(0,3).map((s,i)=>({audience:s,angle:angles[i%angles.length],creative:'Single Image Ad',purpose:'Test '+s+' audience with a '+angles[i%angles.length].toLowerCase()+' angle'}));
 }
 renderAudiencePlan();
 renderAudienceMatrix();
 $('status').textContent='Audience plan generated — ₹0';
}
function renderAudiencePlan(){
 const p=state.audience&&state.audience.plan;
 if(!p){$('audiencePlanResult').innerHTML='<div class="placeholder">Fill in audience details and generate a plan.</div>';return;}
 $('audiencePlanResult').innerHTML='<div class="result-grid">'+
  '<div class="result-card"><strong>Primary Audience</strong><p>'+esc(p.primaryAudience)+'</p></div>'+
  '<div class="result-card"><strong>Pain</strong><p>'+esc(p.pain)+'</p></div>'+
  '<div class="result-card"><strong>Motivation</strong><p>'+esc(p.motivation)+'</p></div>'+
  '<div class="result-card"><strong>Awareness</strong><p>'+esc(p.awareness)+'</p></div>'+
  '<div class="result-card wide-card"><strong>Message</strong><p>'+esc(p.message)+'</p></div>'+
  '<div class="result-card wide-card"><strong>Audience Options</strong><p>'+p.options.map(o=>esc(o)).join('<br>')+'</p></div>'+
 '</div><small class="demo-badge">₹0 MODE — built-in audience engine</small>';
}
function renderAudienceMatrix(){
 const rows=(state.audience&&state.audience.matrix)||[];
 $('audienceMatrix').innerHTML=rows.length?'<table class="matrix-table"><thead><tr><th>Audience</th><th>Angle</th><th>Creative</th><th>Purpose</th><th></th></tr></thead><tbody>'+
  rows.map((r,i)=>'<tr><td><input class="matrix-field" data-index="'+i+'" data-key="audience" value="'+attr(r.audience)+'"></td><td><input class="matrix-field" data-index="'+i+'" data-key="angle" value="'+attr(r.angle)+'"></td><td><input class="matrix-field" data-index="'+i+'" data-key="creative" value="'+attr(r.creative)+'"></td><td><input class="matrix-field" data-index="'+i+'" data-key="purpose" value="'+attr(r.purpose)+'"></td><td><button class="ghost danger matrixRemove" data-index="'+i+'" type="button">✕</button></td></tr>').join('')+
 '</tbody></table>':'<div class="placeholder">No testing rows yet. Generate a plan or add a row.</div>';
 document.querySelectorAll('.matrix-field').forEach(el=>el.oninput=()=>{state.audience.matrix[Number(el.dataset.index)][el.dataset.key]=el.value;});
 document.querySelectorAll('.matrixRemove').forEach(btn=>btn.onclick=()=>{state.audience.matrix.splice(Number(btn.dataset.index),1);renderAudienceMatrix();});
}

// ---- Phase 3: Offer Module (₹0, local heuristics) ----
function offerInputs(){
 return {
  product:$('offerProduct').value.trim(),
  price:$('offerPrice').value.trim(),
  discount:$('offerDiscount').value.trim(),
  duration:$('offerDuration').value.trim(),
  scarcity:$('offerScarcity').value.trim(),
  cta:$('offerCta').value.trim(),
  bonuses:$('offerBonuses').value.trim(),
  guarantee:$('offerGuarantee').value.trim(),
  proof:$('offerProof').value.trim()
 };
}
function fillOfferInputs(o){
 if(!o)return;
 $('offerProduct').value=o.product||'';
 $('offerPrice').value=o.price||'';
 $('offerDiscount').value=o.discount||'';
 $('offerDuration').value=o.duration||'';
 $('offerScarcity').value=o.scarcity||'';
 $('offerCta').value=o.cta||'';
 $('offerBonuses').value=o.bonuses||'';
 $('offerGuarantee').value=o.guarantee||'';
 $('offerProof').value=o.proof||'';
}
function analyzeOffer(){
 state.brief=brief();
 const o=offerInputs();
 state.offer=Object.assign(state.offer||defaultOffer(),o);
 const product=o.product||state.brief.productName||'the product/service';
 const price=o.price||state.brief.offer||'';
 const checks=[
  {label:'Offer clarity',ok:!!(product&&price),note:(product&&price)?'Product and price are both specified.':'Suggested improvement: specify both what is being offered and the price.'},
  {label:'Value proposition',ok:!!o.duration,note:o.duration?'Duration/scope is specified, helping set expectations.':'Potential weakness: no duration or scope specified — add what exactly is included.'},
  {label:'Risk reversal',ok:!!o.guarantee,note:o.guarantee?'A guarantee is included.':'Potential weakness: no guarantee or risk reversal — consider adding one to reduce hesitation.'},
  {label:'Proof',ok:!!o.proof,note:o.proof?'Proof/evidence is included.':'Potential weakness: no proof or evidence provided — consider adding testimonials, numbers or case studies.'},
  {label:'Urgency',ok:!!(o.scarcity||o.discount),note:(o.scarcity||o.discount)?'A scarcity or time-limited element is present.':'Suggested test: add a genuine scarcity or deadline element if one exists.'},
  {label:'CTA',ok:!!o.cta,note:o.cta?'A clear CTA is specified.':'Suggested improvement: specify a single, clear call to action.'}
 ];
 state.offer.analysis=checks;
 const cleanOffer=s=>String(s).trim().replace(/[.!?]+$/,'');
 const outcomeText=cleanOffer(state.brief.outcome||'the desired outcome').toLowerCase();
 state.offer.variants=[
  {name:'Current Offer',description:product+(price?' · '+price:'')+(o.discount?' · '+o.discount:'')+(o.bonuses?' · Includes: '+o.bonuses:'')+(o.guarantee?' · '+o.guarantee:'')},
  {name:'Outcome-focused',description:'Get '+outcomeText+' with '+product+(price?' · '+price:'')+'.'+(o.guarantee?' '+o.guarantee:'')},
  {name:'Bonus-focused',description:product+(price?' · '+price:'')+(o.bonuses?' · Plus: '+o.bonuses:' · (add a bonus to strengthen this angle)')+(o.scarcity?' · '+o.scarcity:'')}
 ];
 renderOfferAnalysis();
 $('status').textContent='Offer analysed — ₹0';
}
function renderOfferAnalysis(){
 const checks=state.offer&&state.offer.analysis;
 if(!checks){$('offerAnalysisResult').innerHTML='<div class="placeholder">Fill in the offer and click Analyse Offer.</div>';$('offerVariantsResult').innerHTML='';return;}
 $('offerAnalysisResult').innerHTML='<div class="offer-checklist">'+checks.map(c=>'<div class="offer-check-row '+(c.ok?'ok':'warn')+'"><span class="offer-check-icon">'+(c.ok?'✓':'⚠')+'</span><div><strong>'+esc(c.label)+'</strong><p>'+esc(c.note)+'</p></div></div>').join('')+'</div><small class="demo-badge">₹0 MODE — built-in offer engine; heuristic checks, not a guarantee of results</small>';
 const variants=state.offer.variants||[];
 $('offerVariantsResult').innerHTML=variants.length?'<h3 class="variants-head">Offer Variants</h3><div class="result-grid">'+variants.map(v=>'<div class="result-card"><strong>'+esc(v.name)+'</strong><p>'+esc(v.description)+'</p></div>').join('')+'</div>':'';
}

async function loadReferenceExample(){
  const btn=$('useReference');
  btn.disabled=true;
  $('status').textContent='Loading complete reference campaign…';
  try{
    const base='/reference/';
    let referenceBrief, adData, reelData, strategyData, creativeData;
    try{
      const [briefResponse,adResponse,reelResponse,strategyResponse,creativeResponse]=await Promise.all([
        fetch(base+'reference-input.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-copy-variations.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-reel-scripts.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-strategy.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-creative.json?v='+Date.now(),{cache:'no-store'})
      ]);
      if(!briefResponse.ok)throw new Error('Reference brief '+briefResponse.status);
      if(!adResponse.ok)throw new Error('Reference ads '+adResponse.status);
      if(!reelResponse.ok)throw new Error('Reference reels '+reelResponse.status);
      if(!strategyResponse.ok)throw new Error('Reference strategy '+strategyResponse.status);
      if(!creativeResponse.ok)throw new Error('Reference creative '+creativeResponse.status);
      referenceBrief=await briefResponse.json();
      adData=await adResponse.json();
      reelData=await reelResponse.json();
      strategyData=await strategyResponse.json();
      creativeData=await creativeResponse.json();
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
      strategyData={strategy:REFERENCE_STRATEGY};
      creativeData={creative:REFERENCE_CREATIVE};
    }

    const missing=ids.filter(id=>referenceBrief[id]===undefined);
    fillBrief(referenceBrief);
    const stillBlank=ids.filter(id=>referenceBrief[id]!==undefined&&$(id)&&$(id).value!==String(referenceBrief[id]??''));
    if(missing.length||stillBlank.length){
      throw new Error('Reference brief fields missing: '+[...new Set([...missing,...stillBlank])].join(', '));
    }

    state.brief=brief();
    state.aiMode=false;
    state.aiUsage=emptyAiUsage();
    state.aiImages=null;
    state.audience=defaultAudience();
    state.offer=defaultOffer();
    state.strategy=strategyData.strategy||REFERENCE_STRATEGY;
    state.copy=Array.isArray(adData.ads)?adData.ads.slice():REFERENCE_ADS.slice();
    state.creative=Array.isArray(creativeData.creative)?creativeData.creative.slice():REFERENCE_CREATIVE.slice();
    state.reels=Array.isArray(reelData.scripts)?reelData.scripts.slice():REFERENCE_REELS.slice();
    state.selectedCopy=state.copy.length?state.copy[0].name:null;

    if(!state.strategy||!state.copy.length||!state.creative.length||!state.reels.length)throw new Error('Reference outputs are empty');

    renderResults();
    renderAiControlSummary();
    fillAudienceInputs(state.audience);
    renderAudiencePlan();
    renderAudienceMatrix();
    fillOfferInputs(state.offer);
    renderOfferAnalysis();
    $('status').textContent='Reference loaded — Strategy + 3 Ad Copies + 4 Creative Ideas + 3 Reel Scripts ready';
    showTab('brief');
  }catch(err){
    $('status').textContent='Reference loading error — '+err.message;
  }finally{
    btn.disabled=false;
  }
}
$('useReference').onclick=loadReferenceExample;
$('generate').onclick=()=>{state.brief=brief();generateAI();};
$('regenStrategy').onclick=()=>regenerate('strategy');$('regenCopy').onclick=()=>regenerate('copy');$('regenCreative').onclick=()=>regenerate('creative');$('regenReels').onclick=()=>regenerate('reels');$('nextAudience').onclick=()=>showTab('audience');$('nextOffer').onclick=()=>showTab('offer');$('nextCopyFromOffer').onclick=()=>showTab('copy');$('nextCreative').onclick=()=>showTab('creative');$('nextReels').onclick=()=>showTab('reels');$('nextSaved').onclick=()=>showTab('saved');
$('genAudiencePlan').onclick=generateAudiencePlan;
$('addMatrixRow').onclick=()=>{if(!state.audience)state.audience=defaultAudience();if(!Array.isArray(state.audience.matrix))state.audience.matrix=[];state.audience.matrix.push({audience:'',angle:'',creative:'',purpose:''});renderAudienceMatrix();};
$('analyzeOffer').onclick=analyzeOffer;

$('aiMasterSwitch').onchange=onAiControlChange;
document.querySelectorAll('.ai-stage-grid input[type=checkbox]').forEach(el=>el.onchange=onAiControlChange);
$('textProviderSelect').onchange=onAiControlChange;
$('textModelSelect').onchange=onAiControlChange;
$('imageProviderSelect').onchange=onAiControlChange;
$('imageModelSelect').onchange=onAiControlChange;
$('imageQualitySelect').onchange=onAiControlChange;
$('imageAspectSelect').onchange=onAiControlChange;
$('aiImagesOnlyBtn').onclick=()=>{
 $('aiMasterSwitch').checked=true;
 document.querySelectorAll('.ai-stage-grid input[type=checkbox]').forEach(el=>{el.checked=el.dataset.stage==='images';});
 onAiControlChange();
 $('status').textContent='AI Images Only preset applied';
};
$('generateImagesBtn').onclick=async()=>{
 if(!stageIsAi('images'))return;
 if(!Array.isArray(state.creative)||!state.creative.length){$('status').textContent='Generate creative concepts first.';return;}
 const btn=$('generateImagesBtn');
 btn.disabled=true;const orig=btn.textContent;btn.textContent='Generating images…';
 $('status').textContent='Calling '+providerLabel(state.aiConfig.imageProvider)+' for images…';
 try{
   const data=await callGenerateStage('images',state.brief,{quality:state.aiConfig.imageQuality,aspectRatio:state.aiConfig.imageAspectRatio,creativeConcepts:state.creative,model:state.aiConfig.imageModel,provider:state.aiConfig.imageProvider});
   state.aiImages=Array.isArray(data.images)?data.images:[];
   const imageCount=(data.usage&&data.usage.imageCount)||state.aiImages.length;
   state.aiUsage.images={
     provider:state.aiConfig.imageProvider,
     model:state.aiConfig.imageModel,
     quality:state.aiConfig.imageQuality,
     aspectRatio:state.aiConfig.imageAspectRatio,
     imageCount,
     costUsd:estimateImageCostUsd(state.aiConfig.imageQuality,imageCount)
   };
   $('status').textContent='AI images generated';
   renderCreative();
 }catch(err){
   $('status').textContent='AI image generation failed ('+err.message+') — showing ₹0 reference creatives';
 }finally{
   btn.disabled=false;btn.textContent=orig;renderAiControlSummary();
 }
};

$('save').onclick=()=>{const b=brief();if(!b.productName){$('status').textContent='Enter a product/service first.';return;}const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');items.unshift({id:Date.now(),savedAt:new Date().toISOString(),brief:b,state});localStorage.setItem('aiAdsCampaigns',JSON.stringify(items.slice(0,50)));$('status').textContent='Campaign saved';};
function startNewCampaign(){ids.forEach(id=>$(id).value='');resetState();$('strategyResult').innerHTML='<div class="placeholder">Complete the brief and generate a strategy.</div>';$('copyResult').innerHTML='<div class="placeholder">Generate a campaign to create ad copy.</div>';$('creativeResult').innerHTML='<article><h3>Image Ad</h3><p>Visual concept and text hierarchy.</p></article><article><h3>Carousel</h3><p>Problem → solution → proof → CTA.</p></article><article><h3>Story</h3><p>Vertical 9:16 concept.</p></article><article><h3>Reel</h3><p>Scene-by-scene creative concept.</p></article>';$('reelsResult').innerHTML='<div class="placeholder">Generate a campaign to create reel scripts.</div>';fillAudienceInputs(state.audience);renderAudiencePlan();renderAudienceMatrix();fillOfferInputs(state.offer);renderOfferAnalysis();$('status').textContent='New campaign ready';renderAiControlSummary();showTab('brief');}
$('newCampaign').onclick=()=>{$('newCampaignConfirm').hidden=false;};
$('confirmNewCampaign').onclick=()=>{$('newCampaignConfirm').hidden=true;startNewCampaign();};
$('cancelNewCampaign').onclick=()=>{$('newCampaignConfirm').hidden=true;};
$('clear').onclick=()=>{$('newCampaignConfirm').hidden=false;};
$('exportJson').onclick=()=>download('ai-ads-campaign.json',JSON.stringify(state,null,2),'application/json');
$('exportText').onclick=()=>{
 const briefText=Object.entries(brief()).map(([k,v])=>k+': '+v).join('\n');
 const cfg=state.aiConfig||defaultAiConfig();
 const aiText='\n\nAI CONFIGURATION\nMaster: '+(cfg.master?'ON':'OFF')+'\nText Provider: '+providerLabel(cfg.textProvider)+' ('+cfg.textModel+')\nImage Provider: '+providerLabel(cfg.imageProvider)+' ('+cfg.imageModel+', '+cfg.imageQuality+', '+cfg.imageAspectRatio+')\nStages: '+Object.entries(cfg.stages).map(([k,v])=>k+'='+(v?'ON':'OFF')).join(', ')+'\n\n'+($('aiUsagePre')?$('aiUsagePre').textContent:'');
 download('ai-ads-campaign.txt',briefText+aiText,'text/plain');
};
function renderSaved(){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');$('savedList').innerHTML=items.length?items.map(x=>'<div class="saved-card"><div class="saved-meta"><strong>'+esc(x.brief.productName||'Untitled campaign')+'</strong><small>'+esc(x.brief.brandName||'')+' · '+new Date(x.savedAt).toLocaleString()+'</small></div><div class="saved-actions"><button class="secondary loadBtn" data-id="'+x.id+'">Load</button><button class="secondary duplicateBtn" data-id="'+x.id+'">Duplicate</button><button class="secondary danger deleteBtn" data-id="'+x.id+'">Delete</button></div></div>').join(''):'<div class="placeholder">No saved campaigns yet.</div>';document.querySelectorAll('.loadBtn').forEach(btn=>btn.onclick=()=>loadCampaign(Number(btn.dataset.id)));document.querySelectorAll('.duplicateBtn').forEach(btn=>btn.onclick=()=>duplicateCampaign(Number(btn.dataset.id)));document.querySelectorAll('.deleteBtn').forEach(btn=>btn.onclick=()=>deleteCampaign(Number(btn.dataset.id)));}
function duplicateCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');const item=items.find(x=>x.id===id);if(!item)return;const copyBrief={...item.brief,productName:(item.brief.productName||'Untitled campaign')+' (Copy)'};const copyState=item.state?{...item.state,brief:copyBrief}:{brief:copyBrief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:item.state&&item.state.aiConfig||defaultAiConfig(),aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer()};items.unshift({id:Date.now(),savedAt:new Date().toISOString(),brief:copyBrief,state:copyState});localStorage.setItem('aiAdsCampaigns',JSON.stringify(items.slice(0,50)));renderSaved();$('status').textContent='Campaign duplicated';}
function loadCampaign(id){
 const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');
 const item=items.find(x=>x.id===id);
 if(!item)return;
 fillBrief(item.brief);
 state=item.state||{brief:item.brief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:null,aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer()};
 state.aiConfig=state.aiConfig||defaultAiConfig();
 state.aiUsage=state.aiUsage||emptyAiUsage();
 if(state.aiImages===undefined)state.aiImages=null;
 state.audience=Object.assign(defaultAudience(),state.audience||{});
 state.offer=Object.assign(defaultOffer(),state.offer||{});
 applyAiConfigToUI();
 fillAudienceInputs(state.audience);
 renderAudiencePlan();
 renderAudienceMatrix();
 fillOfferInputs(state.offer);
 renderOfferAnalysis();
 if(!state.copy)generateDemo();else{renderResults();}
 state.brief=item.brief;
 $('status').textContent='Saved campaign loaded';
 showTab('strategy');
}
function deleteCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]').filter(x=>x.id!==id);localStorage.setItem('aiAdsCampaigns',JSON.stringify(items));renderSaved();}
function renderPreview(){$('preview').textContent=JSON.stringify(state,null,2);}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function attr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

state.aiConfig=defaultAiConfig();
applyAiConfigToUI();
