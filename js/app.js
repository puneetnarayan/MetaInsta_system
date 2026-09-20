const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
function defaultAiConfig(){return {master:false,stages:{strategy:false,copy:false,creative:false,images:false,reels:false},textProvider:'openai',textModel:AI_MODELS.openai.text[0],imageProvider:'openai',imageModel:AI_MODELS.openai.image[0],imageQuality:'medium'};}
function emptyAiUsage(){return {strategy:null,copy:null,creative:null,images:null,reels:null};}
function defaultAudience(){return {primaryCustomer:'',location:'',age:'',gender:'Any',occupation:'',income:'Mid-market',problem:'',outcome:'',awareness:'Problem Aware',intent:'Warm',strategies:['Broad'],plan:null,matrix:[]};}
function defaultOffer(){return {product:'',price:'',discount:'',duration:'',scarcity:'',cta:'',bonuses:'',guarantee:'',proof:'',analysis:null,variants:null};}
function defaultCampaignStructure(){return {name:'',objective:'',budget:'',location:'',destination:'',adSets:[]};}
function defaultImageFactory(){return {selected:[],global:{emotion:'',lighting:'',brandContext:'',textOverlay:'No readable text in the image — text overlays are added afterward in the app.',negative:'no watermark, no distorted hands, no extra limbs',aspectRatio:'1:1'},prompts:[]};}
const PROMPT_FIELD_ORDER=['subject','setting','emotion','composition','lighting','brandContext','textOverlay','aspectRatio','negative'];
function promptFieldLabel(key){return {subject:'Subject',setting:'Setting',emotion:'Emotion',composition:'Composition',lighting:'Lighting',brandContext:'Brand context',textOverlay:'Text-overlay guidance',aspectRatio:'Aspect ratio',negative:'Negative guidance'}[key]||key;}
function buildPromptText(fields){return PROMPT_FIELD_ORDER.filter(k=>fields[k]).map(k=>promptFieldLabel(k)+': '+fields[k]).join('. ');}
function derivePromptFields(concept,b){
 const customer=(b&&b.targetCustomer)||'the target customer';
 const firstLine=String((concept&&concept.concept)||'').split(/[.\n]/)[0].trim();
 const fields={subject:customer+(firstLine?' — '+firstLine:''),setting:'A realistic, relatable environment relevant to '+customer,composition:'Clear focal subject, natural framing, mobile-friendly'};
 const format=concept&&concept.format;
 if(format==='Single Image Ad')fields.composition='Single hero shot, centered subject, calm negative space reserved for a text overlay to be added later in the app';
 else if(format==='Carousel')fields.composition='Consistent visual style suitable for a multi-card carousel sequence, subject clearly visible on each card';
 else if(format==='Instagram Story')fields.composition='Vertical 9:16 framing, subject centered with safe margins at top and bottom for on-screen UI elements';
 else if(format==='Instagram Reel')fields.composition='Vertical 9:16 framing, expressive first-frame suitable as a video thumbnail, subject mid-action';
 return fields;
}
function defaultReelFactory(){return {selected:[],shots:[]};}
function defaultLandingPage(){return {url:'',source:null,page:null,analysis:null,messageMatch:null};}
const CHECKLIST_SECTIONS=[
 {key:'preLaunch',title:'Pre-launch',items:['Business Manager ready','Ad account selected','Payment method configured','Facebook Page connected','Instagram connected','Tracking configured where applicable','Domain configured where applicable','Conversion event selected','Landing page tested','Mobile page tested','UTM parameters ready']},
 {key:'campaign',title:'Campaign',items:['Objective selected','Budget selected','Campaign name','Ad set structure','Audience','Placements','Optimisation']},
 {key:'ads',title:'Ads',items:['Primary text','Headline','Description','CTA','Image/video','Destination URL','Tracking']},
 {key:'final',title:'Final',items:['Preview','Links tested','Mobile preview','Policy-sensitive wording checked','Tracking checked','Ready to publish']}
];
function defaultChecklist(){
 const c={};
 CHECKLIST_SECTIONS.forEach(s=>{c[s.key]=s.items.map(label=>({label,checked:false}));});
 return c;
}
function normalizeChecklist(existing){
 const c=existing||{};
 const out={};
 CHECKLIST_SECTIONS.forEach(s=>{
  const saved=Array.isArray(c[s.key])?c[s.key]:[];
  out[s.key]=s.items.map(label=>{
   const match=saved.find(x=>x&&x.label===label);
   return {label,checked:!!(match&&match.checked)};
  });
 });
 return out;
}
// ---- Phase 10: Performance Analyzer (₹0, local; never invents missing values) ----
const PERF_FIELDS=[
 {key:'campaign',label:'Campaign',type:'text'},
 {key:'adSet',label:'Ad Set',type:'text'},
 {key:'ad',label:'Ad',type:'text'},
 {key:'spend',label:'Spend',type:'number'},
 {key:'impressions',label:'Impressions',type:'number'},
 {key:'reach',label:'Reach',type:'number'},
 {key:'clicks',label:'Clicks',type:'number'},
 {key:'ctr',label:'CTR (%)',type:'number'},
 {key:'cpc',label:'CPC',type:'number'},
 {key:'leads',label:'Leads',type:'number'},
 {key:'cpl',label:'CPL',type:'number'},
 {key:'conversions',label:'Conversions',type:'number'},
 {key:'revenue',label:'Revenue',type:'number'}
];
const PERF_HEADER_ALIASES={
 campaign:['campaign','campaign name'],adSet:['ad set','adset','ad set name'],ad:['ad','ad name'],
 spend:['spend','amount spent','cost'],impressions:['impressions'],reach:['reach'],clicks:['clicks','link clicks'],
 ctr:['ctr','ctr (%)','click-through rate'],cpc:['cpc','cost per click'],leads:['leads','results'],
 cpl:['cpl','cost per lead','cost per result'],conversions:['conversions','purchases'],revenue:['revenue','purchase value','conversion value']
};
function defaultPerformance(){return {rows:[],source:null};}
function defaultPerformanceRow(){const r={};PERF_FIELDS.forEach(f=>r[f.key]='');return r;}
function num(v){if(v===''||v===null||v===undefined)return null;const n=parseFloat(String(v).replace(/[^0-9.\-]/g,''));return isFinite(n)?n:null;}
function computeDerivedMetrics(row){
 const spend=num(row.spend),impressions=num(row.impressions),reach=num(row.reach),clicks=num(row.clicks),leads=num(row.leads),conversions=num(row.conversions),revenue=num(row.revenue);
 const reportedCtr=num(row.ctr),reportedCpc=num(row.cpc),reportedCpl=num(row.cpl);
 const unavailable={value:null,status:'unavailable'};
 return {
  ctr:reportedCtr!=null?{value:reportedCtr,status:'reported'}:(impressions&&clicks!=null&&impressions>0?{value:clicks/impressions*100,status:'calculated'}:unavailable),
  cpc:reportedCpc!=null?{value:reportedCpc,status:'reported'}:(clicks&&spend!=null&&clicks>0?{value:spend/clicks,status:'calculated'}:unavailable),
  cpl:reportedCpl!=null?{value:reportedCpl,status:'reported'}:(leads&&spend!=null&&leads>0?{value:spend/leads,status:'calculated'}:unavailable),
  conversionRate:(clicks&&conversions!=null&&clicks>0)?{value:conversions/clicks*100,status:'calculated'}:unavailable,
  frequency:(reach&&impressions!=null&&reach>0)?{value:impressions/reach,status:'calculated'}:unavailable,
  roas:(spend&&revenue!=null&&spend>0)?{value:revenue/spend,status:'calculated'}:unavailable,
  costPerConversion:(conversions&&spend!=null&&conversions>0)?{value:spend/conversions,status:'calculated'}:unavailable
 };
}
function fmtMetric(m,decimals,suffix){return m.value==null?'—':m.value.toFixed(decimals==null?2:decimals)+(suffix||'');}
function computePerformanceDashboard(rows){
 const sum=key=>{const vals=rows.map(r=>num(r[key])).filter(v=>v!=null);return vals.length?vals.reduce((a,b)=>a+b,0):null;};
 const spend=sum('spend'),impressions=sum('impressions'),clicks=sum('clicks'),leads=sum('leads'),conversions=sum('conversions'),revenue=sum('revenue');
 return {
  spend,impressions,clicks,leads,conversions,
  ctr:(impressions&&clicks!=null&&impressions>0)?clicks/impressions*100:null,
  cpc:(clicks&&spend!=null&&clicks>0)?spend/clicks:null,
  cpl:(leads&&spend!=null&&leads>0)?spend/leads:null,
  roas:(spend&&revenue!=null&&spend>0)?revenue/spend:null
 };
}
function parseDelimitedText(text){
 const lines=String(text||'').replace(/\r\n/g,'\n').split('\n').filter(l=>l.trim()!=='');
 if(!lines.length)return {headers:[],rows:[]};
 const delimiter=lines[0].includes('\t')?'\t':',';
 const parseLine=line=>{
  const out=[];let cur='',inQuotes=false;
  for(let i=0;i<line.length;i++){
   const ch=line[i];
   if(ch==='"'){if(inQuotes&&line[i+1]==='"'){cur+='"';i++;}else{inQuotes=!inQuotes;}}
   else if(ch===delimiter&&!inQuotes){out.push(cur);cur='';}
   else cur+=ch;
  }
  out.push(cur);
  return out.map(s=>s.trim());
 };
 const headers=parseLine(lines[0]);
 const rows=lines.slice(1).map(parseLine);
 return {headers,rows};
}
function guessColumnMapping(headers){
 return headers.map(h=>{
  const norm=String(h||'').trim().toLowerCase();
  for(const f of PERF_FIELDS){
   if((PERF_HEADER_ALIASES[f.key]||[]).includes(norm))return f.key;
  }
  return 'ignore';
 });
}
function defaultOptimisation(){return {tests:[]};}
// ---- Phase 12: Prompt Library (₹0, original, local) ----
const PROMPT_CATEGORIES=['Strategy','Audience','Offer','Copy','Creative','Reels','Landing Page','Analysis','Optimisation'];
const PROMPT_FRAMEWORKS=['Problem-led','Outcome-led','PAS','AIDA','Story','Question','Objection','Education','Proof'];
const PROMPT_LIBRARY=[
 {id:'p1',category:'Strategy',framework:'Problem-led',title:'Problem-First Positioning Brief',description:'Frame the campaign strategy around the customer\'s problem before introducing the solution.',promptText:'Describe the customer\'s problem in their own words, as if they were complaining about it to a friend. Then explain, in one sentence, why most solutions fail to fix it. Finally, state how {{product}} addresses the root cause rather than the symptom.'},
 {id:'p2',category:'Strategy',framework:'Outcome-led',title:'Outcome-First Positioning Brief',description:'Frame the strategy around the transformation the customer wants, then work backward.',promptText:'Describe the specific outcome the customer wants in concrete, observable terms (not a feeling, but something they could point to). Then explain the one belief or habit standing between them and that outcome. Position {{product}} as the bridge across that specific gap.'},
 {id:'p3',category:'Audience',framework:'Question',title:'Audience Reflection Prompt',description:'Use direct questions to help the customer recognise themselves before you describe them.',promptText:'Write three questions a member of {{audience}} would answer "yes" to if they matched the target profile. Each question should reference a specific moment or behaviour, not a demographic trait.'},
 {id:'p4',category:'Audience',framework:'Story',title:'Day-in-the-Life Framework',description:'Describe the audience through a short scene rather than a list of traits.',promptText:'Write a 3-4 sentence scene describing a typical day for {{audience}}, ending at the exact moment they encounter the problem {{product}} solves. Keep it specific and ordinary — avoid generic language.'},
 {id:'p5',category:'Offer',framework:'PAS',title:'PAS Offer Stack',description:'Problem, Agitate, Solve — used to structure an offer summary.',promptText:'Problem: state the customer\'s problem in one sentence.\nAgitate: describe what it costs them (time, money, confidence) if it goes unsolved.\nSolve: describe how {{product}} solves it, what\'s included, and the price.'},
 {id:'p6',category:'Offer',framework:'Proof',title:'Proof-Led Offer Summary',description:'Lead the offer with evidence rather than claims.',promptText:'List every piece of real evidence you have for {{product}} — results, testimonials, credentials, guarantees, before/afters. Then write a one-paragraph offer summary that leads with the strongest piece of proof.'},
 {id:'p7',category:'Copy',framework:'AIDA',title:'AIDA Ad Template',description:'Attention, Interest, Desire, Action — a classic structure for short ad copy.',promptText:'Attention: one line that stops the scroll for {{audience}}.\nInterest: one line connecting to their specific situation.\nDesire: one line showing the outcome {{product}} makes possible.\nAction: a single, clear CTA.'},
 {id:'p8',category:'Copy',framework:'PAS',title:'PAS Ad Copy',description:'Structure a short ad around Problem-Agitate-Solve.',promptText:'Open with the problem in the customer\'s own words. Agitate it with one honest consequence of leaving it unsolved. Resolve it by introducing {{product}} and a single next step.'},
 {id:'p9',category:'Copy',framework:'Question',title:'Question-Hook Ad Copy',description:'Open with a question that makes the reader self-identify.',promptText:'Write an opening question that only someone dealing with {{problem}} would stop to answer. Follow it with two sentences that validate the feeling, then introduce {{product}} as the next step.'},
 {id:'p10',category:'Copy',framework:'Objection',title:'Objection-Handling Ad Copy',description:'Name the most common hesitation directly, then reframe it.',promptText:'State the single most common reason {{audience}} hesitates to try {{product}}. Acknowledge it directly in one sentence, then reframe it with one piece of evidence or a guarantee.'},
 {id:'p11',category:'Creative',framework:'Story',title:'Before/After Story Concept',description:'A visual concept built around contrast.',promptText:'Describe a single visual moment that captures the "before" state (the problem). Describe a second visual moment that captures the "after" state (the outcome). Describe how the two would sit side by side in one image or a short sequence.'},
 {id:'p12',category:'Creative',framework:'Proof',title:'Proof-Led Creative Concept',description:'A visual concept that leads with evidence.',promptText:'Choose the single strongest piece of proof for {{product}} (a number, a result, a quote). Describe a visual that puts that proof front and centre, with the product/offer as a secondary element.'},
 {id:'p13',category:'Reels',framework:'Story',title:'Reel Story Arc Template',description:'A five-beat story arc for a short-form video.',promptText:'Hook (0-3s): the moment the problem shows up.\nProblem (3-10s): why it\'s frustrating, in the audience\'s own words.\nTurn (10-18s): the shift — what changes.\nSolution (18-25s): {{product}} in action.\nCTA (25-30s): the single next step.'},
 {id:'p14',category:'Reels',framework:'Education',title:'Educational Reel Template',description:'Teach one useful thing, then connect it to the offer.',promptText:'State one genuinely useful tip related to {{problem}} that works whether or not someone buys {{product}}. Explain it in under 20 seconds of spoken script. Then connect it to {{product}} as a natural next step, not a hard pivot.'},
 {id:'p15',category:'Landing Page',framework:'Proof',title:'Proof Block Template',description:'Structure a proof section for a landing page.',promptText:'List 3 pieces of proof for {{product}} in order of strength. Write one sentence of context for each (who, what result, in what timeframe). Avoid vague claims — cite something specific for each.'},
 {id:'p16',category:'Landing Page',framework:'Objection',title:'FAQ / Objection Block Template',description:'Turn common hesitations into an FAQ section.',promptText:'List the top 3 objections {{audience}} would have about {{product}}. Write each as a question in their own words, followed by a direct, honest answer (no more than 2 sentences).'},
 {id:'p17',category:'Analysis',framework:'Question',title:'Diagnostic Question Set',description:'A set of questions to diagnose why a campaign underperformed.',promptText:'For the metric that concerns you most (CTR, CPL, ROAS, etc.), ask: Is this a reach problem, a relevance problem, or a conversion problem? Which single stage of the funnel (hook, offer, landing page, checkout) is most likely responsible? What is the smallest test that would confirm or rule that out?'},
 {id:'p18',category:'Optimisation',framework:'Outcome-led',title:'Hypothesis Framing Template',description:'Frame a test as a hypothesis, not a guess.',promptText:'Observation: what you actually saw in the data.\nHypothesis: what you think might explain it (stated as "might" or "may", never as certain).\nTest: the smallest, single-variable change that would confirm or rule out the hypothesis.'}
];
function defaultPromptLibrary(){return {overrides:{},custom:[]};}
// ---- Phase 13: 90-Day Plan (₹0, editable, saved with the campaign) ----
const PLAN90_SEED=[
 {title:'Month 1 — Foundation',weeks:[
  {label:'Week 1 — Offer + Audience',tasks:['Analyse the offer on the Offer tab','Generate the audience plan on the Audience tab','Confirm the campaign brief is complete']},
  {label:'Week 2 — Landing Page',tasks:['Analyse the landing page on the Landing Page tab','Fix any ✕/⚠ items flagged by Campaign Doctor','Check Message Match against the planned ad hook']},
  {label:'Week 3 — Creative Production',tasks:['Generate the Creative Matrix','Generate AI Images or finalise reference creatives','Write and review reel scripts']},
  {label:'Week 4 — Campaign Launch',tasks:['Generate the Campaign Structure','Complete the Launch Checklist','Publish the campaign in Meta Ads Manager']}
 ]},
 {title:'Month 2 — Optimisation',weeks:[
  {label:'Week 5 — Analyse',tasks:['Import performance data on the Performance tab','Review Campaign Doctor and Performance Observations']},
  {label:'Week 6 — Creative Testing',tasks:['Generate Optimisation Ideas','Generate a new creative set to test']},
  {label:'Week 7 — Audience Testing',tasks:['Test an alternative audience strategy','Update the Audience testing matrix with results']},
  {label:'Week 8 — Landing Page Testing',tasks:['Re-analyse the landing page after any changes','Re-check Message Match']}
 ]},
 {title:'Month 3 — Consolidation',weeks:[
  {label:'Week 9 — Review Results',tasks:['Re-import updated performance data','Update Performance Observations and Campaign Doctor']},
  {label:'Week 10 — Test Budget Changes',tasks:['Test a budget change on the best-performing ad set','Log the change and the result']},
  {label:'Week 11 — Retargeting',tasks:['Add or refine a Retargeting audience strategy','Plan retargeting-specific creative']},
  {label:'Week 12 — Consolidate Learnings',tasks:['Update the Prompt Library with what worked','Summarise learnings for the next 90-day cycle']}
 ]}
];
function defaultPlan90(){
 return {months:PLAN90_SEED.map(m=>({title:m.title,weeks:m.weeks.map(w=>({label:w.label,tasks:w.tasks.map(t=>({text:t,done:false}))}))}))};
}
function normalizePlan90(existing){
 if(!existing||!Array.isArray(existing.months)||!existing.months.length)return defaultPlan90();
 return {months:existing.months.map(m=>({
  title:(m&&m.title)||'',
  weeks:Array.isArray(m&&m.weeks)?m.weeks.map(w=>({
   label:(w&&w.label)||'',
   tasks:Array.isArray(w&&w.tasks)?w.tasks.map(t=>({text:(t&&t.text)||'',done:!!(t&&t.done)})):[]
  })):[]
 }))};
}
const REEL_BEATS=['Hook','Problem','Turn','Solution','CTA'];
const REEL_SHOT_FIELDS=['time','visual','voiceover','onScreenText','sound'];
function reelShotFieldLabel(key){return {time:'Time',visual:'Visual Direction',voiceover:'Voiceover / Caption',onScreenText:'On-Screen Text',sound:'Sound / Music'}[key]||key;}
function deriveReelShots(reel,b){
 const problem=(b&&b.problem)||'the problem';
 const outcome=(b&&b.outcome)||'the desired outcome';
 const product=(b&&b.productName)||'the offer';
 const cta=b&&b.objective==='Sales'?'Shop Now':b&&b.objective==='WhatsApp Leads'?'Send Message':'Learn More';
 const hook=(reel&&reel.hook)||'';
 return [
  {beat:'Hook',time:'0–3s',visual:'Open on a relatable moment that matches the hook',voiceover:hook,onScreenText:shortText(hook,40),sound:'Upbeat, attention-grabbing opener'},
  {beat:'Problem',time:'3–10s',visual:'Show the problem as it actually happens — no exaggeration',voiceover:'You know the feeling: '+problem,onScreenText:'',sound:'Tension holds, minimal music'},
  {beat:'Turn',time:'10–18s',visual:'Introduce a shift — the moment things start to change',voiceover:'But it does not have to stay that way.',onScreenText:'',sound:'Music lifts'},
  {beat:'Solution',time:'18–25s',visual:'Show '+product+' in action, or the outcome being achieved',voiceover:'With '+product+', you can '+String(outcome).toLowerCase()+'.',onScreenText:product,sound:'Music builds'},
  {beat:'CTA',time:'25–30s',visual:'End frame with offer details and a clear call to action',voiceover:'Ready to get started?',onScreenText:cta,sound:'Music resolves, CTA sound cue'}
 ];
}
const CREATIVE_ANGLES=['Problem','Outcome','Question','Story','Objection','Myth','Education','Proof','Testimonial','Comparison','Before/After','Demonstration','FAQ','Urgency','Offer'];
const REEL_ANGLES=['Problem-led','Outcome-led','Question','Story','Educational','Objection','Testimonial'];
const REEL_DURATIONS=['15','30','45','60'];
function normalizeReel(r){
 return {
  title:r.title||r.name||'',
  hook:r.hook||'',
  angle:REEL_ANGLES.includes(r.angle)?r.angle:REEL_ANGLES[0],
  duration:REEL_DURATIONS.includes(String(r.duration))?String(r.duration):'30',
  scenes:Array.isArray(r.scenes)?r.scenes:[],
  voiceover:r.voiceover||'',
  onScreenText:r.onScreenText||'',
  cameraDirection:r.cameraDirection||'',
  bRoll:r.bRoll||'',
  cta:r.cta||'',
  caption:r.caption||''
 };
}
const CREATIVE_FORMATS=['Single Image Ad','Carousel','Instagram Story','Instagram Reel'];
let state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:null,aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer(),campaign:defaultCampaignStructure(),creativeMatrix:[],imageFactory:defaultImageFactory(),reelFactory:defaultReelFactory(),landingPage:defaultLandingPage(),checklist:defaultChecklist(),performance:defaultPerformance(),optimisation:defaultOptimisation(),promptLibrary:defaultPromptLibrary(),plan90:defaultPlan90()};

const REFERENCE_ADS=[{"name":"Ad Version 1 · Problem-led","hook":"Still knowing what you want to say — but hesitating when it's your turn to speak?","primaryText":"You know the answer.\n\nYou have an idea.\n\nBut when the meeting turns to you, you suddenly start searching for words, translating in your head or wondering whether you are saying it correctly.\n\nIf this sounds familiar, you are not alone.\n\nThe Speak in Meetings Workshop is designed for working professionals who want to express their ideas more clearly and participate with greater confidence in workplace conversations.\n\n4-day live workshop · ₹997\n\nExplore the workshop and see if it is right for you.","headline":"Speak with more confidence in meetings","description":"4-day live workshop for working professionals.","cta":"Learn More"},{"name":"Ad Version 2 · Outcome-led","hook":"Imagine expressing your idea clearly when the meeting turns to you.","primaryText":"You don't necessarily need more words.\n\nYou need to feel more comfortable using the words you already know.\n\nThe Speak in Meetings Workshop helps working professionals practise how to express ideas, respond naturally and participate more confidently in workplace conversations.\n\nIf your goal is to speak more clearly without constantly worrying about finding the perfect words, this workshop may be a useful next step.\n\n4-day live workshop · ₹997","headline":"Express your ideas with confidence","description":"Practical workplace communication training.","cta":"Learn More"},{"name":"Ad Version 3 · Conversational","hook":"Quick question: do you stay quiet in meetings even when you have something useful to say?","primaryText":"Maybe you know exactly what you want to say.\n\nThen the moment comes.\n\nYou hesitate.\n\nYou search for the right words.\n\nSomeone else speaks.\n\nAnd the opportunity passes.\n\nThe Speak in Meetings Workshop is created for working professionals who want to become more comfortable expressing themselves in meetings and workplace conversations.\n\nLearn, practise and build confidence through a focused 4-day live workshop.\n\n₹997","headline":"Have something to say? Say it clearly.","description":"Build practical speaking confidence at work.","cta":"Learn More"}];
const REFERENCE_REELS=[{"title": "Reel 1 · Problem to Solution", "hook": "Ever had the perfect answer five minutes after the meeting ended?", "angle": "Problem-led", "duration": "30", "scenes": ["0–3s — Hook: “Ever had the perfect answer five minutes after the meeting ended?”", "3–7s — Show a professional listening in a meeting but not speaking. Voiceover: “You knew exactly what you wanted to say...”", "7–12s — Show hesitation. Voiceover: “...but you started searching for words and the conversation moved on.”", "12–18s — Show a confident interaction. Voiceover: “With practice, you can learn to express your ideas more naturally.”", "18–24s — Introduce the workshop. Voiceover: “That's what we practise in the Speak in Meetings Workshop.”", "24–30s — End frame: “4-day live workshop · ₹997” and “Tap Learn More to see the details.”"], "voiceover": "Ever had the perfect answer five minutes after the meeting ended? You knew exactly what you wanted to say, but you started searching for words and the conversation moved on. With practice, you can learn to express your ideas more naturally — that's what we practise in the Speak in Meetings Workshop.", "onScreenText": "Ever had the perfect answer... after the meeting ended?", "cameraDirection": "Handheld, relatable meeting-room framing for the opening scene; cut to a clean end card with workshop details for the CTA.", "bRoll": "A professional in a video call, listening but staying quiet, followed by a confident follow-up conversation.", "cta": "Learn More", "caption": "Ever had the perfect answer... 5 minutes too late? 👀 4-day live workshop · ₹997 · Learn More."}, {"title": "Reel 2 · Outcome-led", "hook": "Imagine your next meeting feeling easier.", "angle": "Outcome-led", "duration": "30", "scenes": ["0–3s — Show the desired outcome immediately.", "3–8s — Voiceover: “You have the knowledge. You have the ideas.”", "8–15s — Show the person speaking clearly. Voiceover: “The next step is expressing those ideas clearly when the moment comes.”", "15–24s — Show workshop practice. Voiceover: “The Speak in Meetings Workshop gives you a focused environment to practise workplace communication.”", "24–30s — End frame: “4-day live workshop · ₹997” and “Learn More.”"], "voiceover": "Imagine your next meeting feeling easier. You have the knowledge, you have the ideas — the next step is expressing them clearly when the moment comes. The Speak in Meetings Workshop gives you a focused environment to practise workplace communication.", "onScreenText": "Imagine your next meeting feeling easier.", "cameraDirection": "Open on a confident, resolved moment for the outcome shot, then cut to workshop-practice footage, ending on a clean end card.", "bRoll": "A professional speaking clearly and confidently in a meeting, contrasted with a brief earlier hesitation.", "cta": "Learn More", "caption": "Imagine your next meeting feeling easier 🙌 4-day live workshop · ₹997 · Learn More."}, {"title": "Reel 3 · Question Format", "hook": "Do you stay quiet in meetings even when you have something useful to say?", "angle": "Question", "duration": "30", "scenes": ["0–3s — Put the question on screen and pause for recognition.", "3–9s — Show a meeting situation. Voiceover: “Maybe you're searching for the right words.”", "9–17s — Show a simple speaking exercise. Voiceover: “Maybe you're worried about making a mistake.”", "17–25s — Introduce the workshop. Voiceover: “The Speak in Meetings Workshop helps you practise expressing your ideas more clearly and confidently.”", "25–30s — End frame: “4-day live workshop · ₹997” and “Tap Learn More.”"], "voiceover": "Do you stay quiet in meetings even when you have something useful to say? Maybe you're searching for the right words, or worried about making a mistake. The Speak in Meetings Workshop helps you practise expressing your ideas more clearly and confidently.", "onScreenText": "Do you stay quiet in meetings even when you have something to say?", "cameraDirection": "Direct-to-camera delivery for the opening question, cut to a simple speaking-exercise demonstration, ending on a clean end card.", "bRoll": "A relatable meeting scene where someone visibly hesitates before staying silent.", "cta": "Learn More", "caption": "Quick question 👇 do you stay quiet even when you have something to say? 4-day live workshop · ₹997 · Learn More."}];
const REFERENCE_STRATEGY={"objective": "Generate qualified leads from working professionals in India who want to communicate more confidently in workplace meetings.", "audience": "Working professionals aged approximately 25–45 who understand English but hesitate when speaking in meetings, presentations or workplace conversations. They may know the answer but hesitate to speak, mentally translate before responding, search for the right words while speaking, avoid participating in meetings and worry about making mistakes. They want to sound clear and professional rather than simply \"speak more English.\"", "corePain": "I know what I want to say, but when the meeting starts I hesitate, search for words and lose confidence.", "desiredOutcome": "Move the customer from hesitation to clear expression, greater confidence and more participation, focused on practical workplace communication rather than presenting fluency as an abstract goal.", "positioning": "Speak in Meetings Workshop is positioned as a practical, focused workshop for working professionals who want to communicate more clearly and confidently during real workplace situations.", "keyMessage": "You may already have the intent or ability to express yourself. The barrier is turning that intention into action. The workshop provides a structured way to practise the communication skills needed in meetings and workplace conversations.", "funnelAngle": "Problem awareness → Recognition → Practical solution → Workshop → Lead. The first interaction should make the viewer recognise their own situation before the workshop is introduced as a possible next step.", "testing": ["Test 1 — Problem-led: focus on hesitation, searching for words and staying silent in meetings.", "Test 2 — Outcome-led: focus on speaking clearly, expressing ideas and participating confidently.", "Test 3 — Question-led: use questions that make the viewer reflect on their own meeting experience."], "tone": "Professional + Friendly"};
const REFERENCE_CREATIVE=[{"format": "Single Image Ad", "concept": "Show a professional sitting in a meeting while others are speaking. They have an idea but appear hesitant to raise their hand or enter the conversation. On-image headline: \"I know what I want to say...\" Supporting text: \"...but I hesitate when it's my turn.\" Bottom CTA: \"Speak with more confidence in meetings.\" Visual direction: a clean professional workplace photograph, with the text kept minimal and readable on mobile."}, {"format": "Carousel", "concept": "Card 1 — Problem: \"Do you hesitate before speaking in meetings?\" Card 2 — Recognition: You know the idea, you just struggle to express it quickly. Card 3 — Insight: You don't always need more vocabulary — you need practice expressing your ideas naturally. Card 4 — Solution: Speak in Meetings Workshop, a focused 4-day live workshop for working professionals. Card 5 — CTA: \"Ready to speak with more confidence?\" ₹997 · Learn More."}, {"format": "Instagram Story", "concept": "Frame 1: Meeting starts, someone asks \"What do you think?\" Frame 2: You know the answer, but you start searching for the right words. Frame 3: What if you could express your ideas more naturally? Frame 4: Speak in Meetings Workshop — 4-day live workshop for working professionals. Frame 5: ₹997 — Explore the workshop. Learn More."}, {"format": "Instagram Reel", "concept": "A short 20–30 second video contrasting hesitation with confident participation. Opening text: \"Ever had the perfect answer... after the meeting ended?\" Visual sequence: person in an online meeting → manager asks a question → person hesitates → another participant answers → person later thinks of the answer → transition to the workshop → show practical speaking practice → end with workshop details. End frame: Speak in Meetings Workshop, 4-day live workshop · ₹997 · Learn More."}];
const REFERENCE_AUDIENCE={"primaryCustomer": "Working professionals who hesitate to speak in English at work", "location": "India", "age": "25–45", "gender": "Any", "occupation": "Mid-level managers and individual contributors who attend regular meetings", "income": "Mid-market", "problem": "I know what I want to say, but I hesitate, search for words and lose confidence when speaking in meetings.", "outcome": "Speak naturally and confidently in meetings, express ideas clearly and participate without fear or hesitation.", "awareness": "Problem Aware", "intent": "Warm", "strategies": ["Broad", "Interest", "Retargeting"], "plan": {"primaryAudience": "Working professionals who hesitate to speak in English at work · 25–45 · Mid-level managers and individual contributors who attend regular meetings · India", "pain": "I know what I want to say, but I hesitate, search for words and lose confidence when speaking in meetings.", "motivation": "Speak naturally and confidently in meetings, express ideas clearly and participate without fear or hesitation.", "awareness": "Problem Aware — They know the problem but not the solution. Lead with the problem in their own words, then introduce a solution.", "message": "For working professionals who hesitate to speak in English at work dealing with hesitation and lost confidence in meetings, position Speak in Meetings Workshop as the practical next step toward speaking naturally and confidently.", "options": ["Broad: Let Meta’s delivery system find responders with minimal targeting restrictions.", "Interest: Target based on stated interests and behaviours related to workplace communication, public speaking and professional development.", "Retargeting: Re-engage people who visited the landing page or engaged with an ad but did not sign up."]}, "matrix": [{"audience": "Broad", "angle": "Problem-led", "creative": "Single Image Ad", "purpose": "Test broad reach with a problem-recognition hook"}, {"audience": "Interest", "angle": "Outcome-led", "creative": "Instagram Reel", "purpose": "Test interest-based targeting with an outcome-focused reel"}, {"audience": "Retargeting", "angle": "Question-led", "creative": "Instagram Story", "purpose": "Re-engage warm visitors with a reflective question"}]};
const REFERENCE_OFFER={"product": "Speak in Meetings Workshop", "price": "₹997", "discount": "", "duration": "4 days", "scarcity": "Limited to 20 participants per cohort", "cta": "Learn More", "bonuses": "Free 1:1 feedback session after Day 4", "guarantee": "Not satisfied after Day 1? Full refund, no questions asked.", "proof": "Delivered to working professionals across India; testimonials and outcomes shared on the landing page.", "analysis": [{"label": "Offer clarity", "ok": true, "note": "Product and price are both specified."}, {"label": "Value proposition", "ok": true, "note": "Duration/scope is specified, helping set expectations."}, {"label": "Risk reversal", "ok": true, "note": "A guarantee is included."}, {"label": "Proof", "ok": true, "note": "Proof/evidence is included."}, {"label": "Urgency", "ok": true, "note": "A scarcity or time-limited element is present."}, {"label": "CTA", "ok": true, "note": "A clear CTA is specified."}], "variants": [{"name": "Current Offer", "description": "Speak in Meetings Workshop · ₹997 · Includes: Free 1:1 feedback session after Day 4 · Not satisfied after Day 1? Full refund, no questions asked."}, {"name": "Outcome-focused", "description": "Get speak naturally and confidently in meetings with Speak in Meetings Workshop · ₹997. Not satisfied after Day 1? Full refund, no questions asked."}, {"name": "Bonus-focused", "description": "Speak in Meetings Workshop · ₹997 · Plus: Free 1:1 feedback session after Day 4 · Limited to 20 participants per cohort"}]};
const REFERENCE_CAMPAIGN_STRUCTURE={"name": "SM_LeadGen_IN_25-45_Sept26", "objective": "Lead Generation", "budget": "₹500/day", "location": "India", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "adSets": [{"id": "adset-0", "name": "AS_Broad_IN_25-45", "audience": "Broad", "age": "25–45", "location": "India", "placements": "Advantage+ Placements", "optimisationEvent": "Lead", "budget": "₹200/day", "ads": [{"id": "ad-0-0", "name": "AD_Problem_Hook01", "copy": "Ad Version 1 · Problem-led", "creative": "Single Image Ad", "headline": "Speak with more confidence in meetings", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_broad&utm_content=problem_hook01"}, {"id": "ad-0-1", "name": "AD_Outcome_Hook02", "copy": "Ad Version 2 · Outcome-led", "creative": "Carousel", "headline": "Express your ideas with confidence", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_broad&utm_content=outcome_hook02"}, {"id": "ad-0-2", "name": "AD_Conversational_Hook03", "copy": "Ad Version 3 · Conversational", "creative": "Instagram Story", "headline": "Have something to say? Say it clearly.", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_broad&utm_content=conversational_hook03"}]}, {"id": "adset-1", "name": "AS_Interest_IN_25-45", "audience": "Interest", "age": "25–45", "location": "India", "placements": "Advantage+ Placements", "optimisationEvent": "Lead", "budget": "₹200/day", "ads": [{"id": "ad-1-0", "name": "AD_Problem_Hook01", "copy": "Ad Version 1 · Problem-led", "creative": "Single Image Ad", "headline": "Speak with more confidence in meetings", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_interest&utm_content=problem_hook01"}, {"id": "ad-1-1", "name": "AD_Outcome_Hook02", "copy": "Ad Version 2 · Outcome-led", "creative": "Carousel", "headline": "Express your ideas with confidence", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_interest&utm_content=outcome_hook02"}, {"id": "ad-1-2", "name": "AD_Conversational_Hook03", "copy": "Ad Version 3 · Conversational", "creative": "Instagram Story", "headline": "Have something to say? Say it clearly.", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_interest&utm_content=conversational_hook03"}]}, {"id": "adset-2", "name": "AS_Retargeting_IN_25-45", "audience": "Retargeting", "age": "25–45", "location": "India", "placements": "Advantage+ Placements", "optimisationEvent": "Lead", "budget": "₹100/day", "ads": [{"id": "ad-2-0", "name": "AD_Problem_Hook01", "copy": "Ad Version 1 · Problem-led", "creative": "Single Image Ad", "headline": "Speak with more confidence in meetings", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_retargeting&utm_content=problem_hook01"}, {"id": "ad-2-1", "name": "AD_Outcome_Hook02", "copy": "Ad Version 2 · Outcome-led", "creative": "Carousel", "headline": "Express your ideas with confidence", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_retargeting&utm_content=outcome_hook02"}, {"id": "ad-2-2", "name": "AD_Conversational_Hook03", "copy": "Ad Version 3 · Conversational", "creative": "Instagram Story", "headline": "Have something to say? Say it clearly.", "cta": "Learn More", "destination": "https://coachsapnanarayan.com/speak-in-meetings", "tracking": "utm_source=facebook&utm_medium=paid&utm_campaign=leadgen_retargeting&utm_content=conversational_hook03"}]}]};
const REFERENCE_CREATIVE_MATRIX=[{"angle": "Problem", "format": "Single Image Ad", "hook": "Still knowing what you want to say — but hesitating when it's your turn to speak?", "visual": "A professional sitting in a meeting, hesitating to raise their hand or enter the conversation", "cta": "Learn More"}, {"angle": "Outcome", "format": "Instagram Reel", "hook": "Imagine expressing your idea clearly when the meeting turns to you.", "visual": "A confident professional speaking naturally in a meeting, contrasted with the earlier hesitation", "cta": "Learn More"}, {"angle": "Question", "format": "Instagram Story", "hook": "Quick question: do you stay quiet in meetings even when you have something useful to say?", "visual": "The question on screen, followed by a relatable meeting scene", "cta": "Learn More"}, {"angle": "Proof", "format": "Carousel", "hook": "What actually changes after 4 days of practice?", "visual": "A before/after contrast across the carousel cards — hesitant participation versus confident participation", "cta": "Learn More"}, {"angle": "Objection", "format": "Instagram Reel", "hook": "\"My English isn't the problem — I just freeze up.\"", "visual": "A professional voicing the common hesitation directly, then a reassuring reframe toward practice over vocabulary", "cta": "Learn More"}];

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
 state={brief:{},strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:keepAiConfig,aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer(),campaign:defaultCampaignStructure(),creativeMatrix:[],imageFactory:defaultImageFactory(),reelFactory:defaultReelFactory(),landingPage:defaultLandingPage(),checklist:defaultChecklist(),performance:defaultPerformance(),optimisation:defaultOptimisation(),promptLibrary:defaultPromptLibrary(),plan90:defaultPlan90()};
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
 if(name==='structure'){
   const currentBrief=brief();
   $('campaignObjective').value=currentBrief.objective||'';
   if(!state.campaign.budget)$('campaignBudget').value=state.campaign.budget=currentBrief.budget||'';else $('campaignBudget').value=state.campaign.budget;
   if(!state.campaign.location)$('campaignLocation').value=state.campaign.location=state.audience.location||currentBrief.location||'';else $('campaignLocation').value=state.campaign.location;
   if(!state.campaign.destination)$('campaignDestination').value=state.campaign.destination=currentBrief.landingPage||'';else $('campaignDestination').value=state.campaign.destination;
   $('campaignName').value=state.campaign.name||'';
   renderCampaignStructure();
 }
 if(name==='audience')renderAudiencePlan(),renderAudienceMatrix();
 if(name==='offer')renderOfferAnalysis();
 if(name==='creative'){renderCreativeMatrix();renderImageConceptSelect();fillImageFactoryGlobalInputs();renderImagePrompts();}
 if(name==='copy')renderCopy();
 if(name==='reels'){renderReels();renderReelSelect();renderReelShotList();}
 if(name==='landing'){
   if(!state.landingPage)state.landingPage=defaultLandingPage();
   if(!state.landingPage.url){const currentBrief=brief();if(currentBrief.landingPage)state.landingPage.url=currentBrief.landingPage;}
   fillLandingPageInputs();
   renderLandingPageAnalysis();
 }
 if(name==='checklist'){if(!state.checklist)state.checklist=defaultChecklist();renderChecklist();}
 if(name==='performance')renderPerformance();
 if(name==='optimisation')renderOptimisationTab();
 if(name==='prompts')renderPromptLibrary();
 if(name==='plan90')renderPlan90();
 if(name==='saved')renderSaved();
 if(name==='export')renderPreview();
 if(name==='help')renderHelp();
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
 const factory=state.imageFactory||defaultImageFactory();
 const imgCount=(factory.prompts&&factory.prompts.length)||(factory.selected&&factory.selected.length)||0;
 $('aiImagesCostEstimate').textContent=!imagesOn?'':imgCount?('Estimated '+formatInr(perImg*imgCount)+' for '+imgCount+' image'+(imgCount===1?'':'s')):'Select concepts and generate prompts to see a cost estimate';

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
 renderImageConceptSelect();
}

// ---- Phase 6: AI Image Factory (select concepts -> generate prompts -> review -> generate images) ----
function fillImageFactoryGlobalInputs(){
 const g=(state.imageFactory&&state.imageFactory.global)||defaultImageFactory().global;
 $('imgEmotion').value=g.emotion||'';
 $('imgLighting').value=g.lighting||'';
 $('imgBrandContext').value=g.brandContext||'';
 $('imgTextOverlay').value=g.textOverlay||'';
 $('imgNegative').value=g.negative||'';
 $('imgAspectSelect').value=g.aspectRatio||'1:1';
}
function readImageFactoryGlobal(){
 if(!state.imageFactory)state.imageFactory=defaultImageFactory();
 state.imageFactory.global={
  emotion:$('imgEmotion').value.trim(),
  lighting:$('imgLighting').value.trim(),
  brandContext:$('imgBrandContext').value.trim(),
  textOverlay:$('imgTextOverlay').value.trim(),
  negative:$('imgNegative').value.trim(),
  aspectRatio:$('imgAspectSelect').value
 };
}
function renderImageConceptSelect(){
 const container=$('imageConceptSelect');
 if(!container)return;
 if(!state.imageFactory)state.imageFactory=defaultImageFactory();
 const concepts=Array.isArray(state.creative)?state.creative:[];
 if(!concepts.length){container.innerHTML='<div class="placeholder">Generate creative ideas first.</div>';return;}
 state.imageFactory.selected=state.imageFactory.selected.filter(i=>i<concepts.length);
 container.innerHTML='<div class="field-title">Select concepts for image generation</div>'+concepts.map((c,i)=>'<label class="checkbox-item"><input type="checkbox" class="imgConceptBox" value="'+i+'" '+(state.imageFactory.selected.includes(i)?'checked':'')+'>'+esc(c.format)+' — '+esc(shortText(c.concept,60))+'</label>').join('');
 document.querySelectorAll('.imgConceptBox').forEach(el=>el.onchange=()=>{
  const i=Number(el.value);
  const sel=state.imageFactory.selected;
  if(el.checked){if(!sel.includes(i))sel.push(i);}else{state.imageFactory.selected=sel.filter(x=>x!==i);}
 });
}
function generateImagePrompts(){
 if(!state.imageFactory)state.imageFactory=defaultImageFactory();
 if(!Array.isArray(state.creative)||!state.creative.length){$('status').textContent='Generate creative ideas first.';return;}
 if(!state.imageFactory.selected.length){$('status').textContent='Select at least one concept to generate prompts for.';return;}
 readImageFactoryGlobal();
 const g=state.imageFactory.global;
 state.imageFactory.prompts=state.imageFactory.selected.map(i=>{
  const concept=state.creative[i];
  const derived=derivePromptFields(concept,state.brief||{});
  const fields=Object.assign({},derived,{emotion:g.emotion,lighting:g.lighting,brandContext:g.brandContext,textOverlay:g.textOverlay,aspectRatio:g.aspectRatio,negative:g.negative});
  return {conceptIndex:i,format:concept.format,fields,promptText:buildPromptText(fields)};
 });
 renderImagePrompts();
 renderAiControlSummary();
 $('status').textContent='Prompts generated — ₹0, review and edit before generating images';
}
function renderImagePrompts(){
 const container=$('imagePromptsResult');
 if(!container)return;
 const prompts=(state.imageFactory&&state.imageFactory.prompts)||[];
 if(!prompts.length){container.innerHTML='';return;}
 container.innerHTML=prompts.map((p,i)=>'<article class="prompt-card"><h4>'+esc(p.format)+'</h4>'+
  PROMPT_FIELD_ORDER.filter(k=>k!=='aspectRatio').map(k=>'<label><span class="field-title">'+esc(promptFieldLabel(k))+'</span><textarea class="editable textarea promptField" data-index="'+i+'" data-key="'+k+'" rows="2">'+esc(p.fields[k]||'')+'</textarea></label>').join('')+
  '<label>Aspect Ratio<select class="promptField" data-index="'+i+'" data-key="aspectRatio"><option value="1:1"'+(p.fields.aspectRatio==='1:1'?' selected':'')+'>1:1 Square</option><option value="4:5"'+(p.fields.aspectRatio==='4:5'?' selected':'')+'>4:5 Portrait</option><option value="9:16"'+(p.fields.aspectRatio==='9:16'?' selected':'')+'>9:16 Story/Reel</option><option value="16:9"'+(p.fields.aspectRatio==='16:9'?' selected':'')+'>16:9 Landscape</option></select></label>'+
  '<div class="prompt-preview" data-index="'+i+'">'+esc(p.promptText)+'</div>'+
 '</article>').join('');
 document.querySelectorAll('.promptField').forEach(el=>{
  const evt=el.tagName==='SELECT'?'change':'input';
  el.addEventListener(evt,()=>{
   const i=Number(el.dataset.index),key=el.dataset.key;
   const p=state.imageFactory.prompts[i];
   p.fields[key]=el.value;
   p.promptText=buildPromptText(p.fields);
   const preview=document.querySelector('.prompt-preview[data-index="'+i+'"]');
   if(preview)preview.textContent=p.promptText;
  });
 });
}

// ---- Phase 5: Creative Factory matrix (₹0, local; additive to the existing format cards above) ----
function generateCreativeMatrix(){
 state.brief=brief();
 const b=state.brief;
 const clean=s=>String(s).trim().replace(/[.!?]+$/,'');
 const problem=clean(b.problem||'a frustrating problem');
 const outcome=clean(b.outcome||'a clear desired outcome');
 const cta=b.objective==='Sales'?'Shop Now':b.objective==='WhatsApp Leads'?'Send Message':'Learn More';
 state.creativeMatrix=[
  {angle:'Problem',format:'Single Image Ad',hook:'Still '+problem.toLowerCase()+'?',visual:'A realistic, relatable moment showing the problem as it actually happens',cta},
  {angle:'Outcome',format:'Instagram Reel',hook:'Imagine being able to '+outcome.toLowerCase()+'.',visual:'A confident before/after contrast built around the desired outcome',cta},
  {angle:'Question',format:'Instagram Story',hook:'Quick question — does this sound familiar?',visual:'The question on screen, followed by a relatable scene',cta},
  {angle:'Proof',format:'Carousel',hook:'What actually changes with practice?',visual:'Evidence, results or a before/after sequence, card by card',cta},
  {angle:'Objection',format:'Instagram Reel',hook:'"This probably won’t work for me because..."',visual:'Name the most common hesitation directly, then reframe it',cta}
 ];
 renderCreativeMatrix();
 $('status').textContent='Creative matrix generated — ₹0';
}
function renderCreativeMatrix(){
 const rows=state.creativeMatrix||[];
 $('creativeMatrixResult').innerHTML=rows.length?'<table class="matrix-table"><thead><tr><th>Angle</th><th>Format</th><th>Hook</th><th>Visual</th><th>CTA</th><th></th></tr></thead><tbody>'+
  rows.map((r,i)=>'<tr>'+
   '<td><select class="cmField" data-index="'+i+'" data-key="angle">'+CREATIVE_ANGLES.map(a=>'<option value="'+attr(a)+'"'+(r.angle===a?' selected':'')+'>'+esc(a)+'</option>').join('')+'</select></td>'+
   '<td><select class="cmField" data-index="'+i+'" data-key="format">'+CREATIVE_FORMATS.map(f=>'<option value="'+attr(f)+'"'+(r.format===f?' selected':'')+'>'+esc(f)+'</option>').join('')+'</select></td>'+
   '<td><input class="cmField" data-index="'+i+'" data-key="hook" value="'+attr(r.hook)+'"></td>'+
   '<td><input class="cmField" data-index="'+i+'" data-key="visual" value="'+attr(r.visual)+'"></td>'+
   '<td><input class="cmField" data-index="'+i+'" data-key="cta" value="'+attr(r.cta)+'"></td>'+
   '<td><button class="ghost danger cmRemove" data-index="'+i+'" type="button">✕</button></td>'+
  '</tr>').join('')+
 '</tbody></table>':'<div class="placeholder">No creative matrix rows yet. Generate a matrix or add a row.</div>';
 document.querySelectorAll('.cmField').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{state.creativeMatrix[Number(el.dataset.index)][el.dataset.key]=el.value;}));
 document.querySelectorAll('.cmRemove').forEach(btn=>btn.onclick=()=>{state.creativeMatrix.splice(Number(btn.dataset.index),1);renderCreativeMatrix();});
}
function renderReels(){
 const source=Array.isArray(state.reels)&&state.reels.length?state.reels:REFERENCE_REELS.slice();
 if(!Array.isArray(state.reels)||!state.reels.length)state.reels=source;
 const reels=state.reels.map(normalizeReel);
 state.reels=reels;
 $('reelsResult').innerHTML='<div class="copy-list">'+reels.map((r,i)=>'<article class="copy-card"><h3>'+esc(r.title)+'</h3>'+
  '<label><span class="field-title">Hook</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="hook">'+esc(r.hook)+'</textarea></label>'+
  '<div class="ai-select-grid"><label>Angle<select class="reel-field" data-index="'+i+'" data-key="angle">'+REEL_ANGLES.map(a=>'<option value="'+attr(a)+'"'+(r.angle===a?' selected':'')+'>'+esc(a)+'</option>').join('')+'</select></label>'+
  '<label>Duration<select class="reel-field" data-index="'+i+'" data-key="duration">'+REEL_DURATIONS.map(d=>'<option value="'+d+'"'+(r.duration===d?' selected':'')+'>'+d+' sec</option>').join('')+'</select></label></div>'+
  '<div class="field-title">Scenes</div><ol class="reel-scenes">'+r.scenes.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
  '<label><span class="field-title">Voiceover</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="voiceover" rows="3">'+esc(r.voiceover)+'</textarea></label>'+
  '<label><span class="field-title">On-Screen Text</span><input class="editable reel-field" data-index="'+i+'" data-key="onScreenText" value="'+attr(r.onScreenText)+'"></label>'+
  '<label><span class="field-title">Camera Direction</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="cameraDirection" rows="2">'+esc(r.cameraDirection)+'</textarea></label>'+
  '<label><span class="field-title">B-Roll</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="bRoll" rows="2">'+esc(r.bRoll)+'</textarea></label>'+
  '<label><span class="field-title">CTA</span><input class="editable reel-field" data-index="'+i+'" data-key="cta" value="'+attr(r.cta)+'"></label>'+
  '<label><span class="field-title">Caption</span><textarea class="editable textarea reel-field" data-index="'+i+'" data-key="caption" rows="2">'+esc(r.caption)+'</textarea></label>'+
  '<button class="secondary copyReel" data-index="'+i+'">Copy Script</button></article>').join('')+'</div><small class="demo-badge">'+stageBadge('reels')+' — editable; confirm before use</small>';
 document.querySelectorAll('.reel-field').forEach(el=>{
  const evt=el.tagName==='SELECT'?'change':'input';
  el.addEventListener(evt,()=>state.reels[Number(el.dataset.index)][el.dataset.key]=el.value);
 });
 document.querySelectorAll('.copyReel').forEach(btn=>btn.onclick=()=>{
  const r=state.reels[Number(btn.dataset.index)];
  const text=r.title+'\nAngle: '+r.angle+' · Duration: '+r.duration+'s\nHook: '+r.hook+'\nScenes:\n- '+r.scenes.join('\n- ')+'\n\nVoiceover: '+r.voiceover+'\nOn-Screen Text: '+r.onScreenText+'\nCamera Direction: '+r.cameraDirection+'\nB-Roll: '+r.bRoll+'\nCTA: '+r.cta+'\nCaption: '+r.caption;
  navigator.clipboard?.writeText(text);
  $('status').textContent='Reel script copied';
 });
 renderReelSelect();
}

// ---- Phase 7: Reel Factory (₹0, local beat-by-beat shot list) ----
function renderReelSelect(){
 const container=$('reelFactorySelect');
 if(!container)return;
 if(!state.reelFactory)state.reelFactory=defaultReelFactory();
 const reels=Array.isArray(state.reels)?state.reels:[];
 if(!reels.length){container.innerHTML='<div class="placeholder">Generate reel scripts first.</div>';return;}
 state.reelFactory.selected=state.reelFactory.selected.filter(i=>i<reels.length);
 container.innerHTML='<div class="field-title">Select reels for a shot list</div>'+reels.map((r,i)=>'<label class="checkbox-item"><input type="checkbox" class="reelSelectBox" value="'+i+'" '+(state.reelFactory.selected.includes(i)?'checked':'')+'>'+esc(r.title||r.name||('Reel '+(i+1)))+'</label>').join('');
 document.querySelectorAll('.reelSelectBox').forEach(el=>el.onchange=()=>{
  const i=Number(el.value);
  const sel=state.reelFactory.selected;
  if(el.checked){if(!sel.includes(i))sel.push(i);}else{state.reelFactory.selected=sel.filter(x=>x!==i);}
 });
}
function generateReelShotList(){
 if(!state.reelFactory)state.reelFactory=defaultReelFactory();
 if(!Array.isArray(state.reels)||!state.reels.length){$('status').textContent='Generate reel scripts first.';return;}
 if(!state.reelFactory.selected.length){$('status').textContent='Select at least one reel to build a shot list for.';return;}
 const b=state.brief||{};
 state.reelFactory.shots=state.reelFactory.selected.map(i=>{
  const reel=state.reels[i];
  return {reelIndex:i,title:reel.title||reel.name||('Reel '+(i+1)),scenes:deriveReelShots(reel,b)};
 });
 renderReelShotList();
 $('status').textContent='Shot list generated — ₹0, review and edit before production';
}
function renderReelShotList(){
 const container=$('reelShotListResult');
 if(!container)return;
 const shots=(state.reelFactory&&state.reelFactory.shots)||[];
 if(!shots.length){container.innerHTML='';return;}
 container.innerHTML=shots.map((s,si)=>'<article class="prompt-card"><h4>'+esc(s.title)+'</h4>'+
  s.scenes.map((sc,ci)=>'<div class="shot-row"><strong>'+esc(sc.beat)+'</strong>'+
   REEL_SHOT_FIELDS.map(k=>'<label><span class="field-title">'+esc(reelShotFieldLabel(k))+'</span><textarea class="editable textarea shotField" data-shot="'+si+'" data-scene="'+ci+'" data-key="'+k+'" rows="2">'+esc(sc[k]||'')+'</textarea></label>').join('')+
  '</div>').join('')+
  '<button class="secondary copyShotList" data-index="'+si+'">Copy Shot List</button>'+
 '</article>').join('');
 document.querySelectorAll('.shotField').forEach(el=>el.oninput=()=>{
  const si=Number(el.dataset.shot),ci=Number(el.dataset.scene),key=el.dataset.key;
  state.reelFactory.shots[si].scenes[ci][key]=el.value;
 });
 document.querySelectorAll('.copyShotList').forEach(btn=>btn.onclick=()=>{
  const s=state.reelFactory.shots[Number(btn.dataset.index)];
  const text=s.title+'\n\n'+s.scenes.map(sc=>sc.beat+' ('+sc.time+')\nVisual: '+sc.visual+'\nVoiceover: '+sc.voiceover+'\nOn-screen text: '+sc.onScreenText+'\nSound: '+sc.sound).join('\n\n');
  navigator.clipboard?.writeText(text);
  $('status').textContent='Shot list copied';
 });
}

// ---- Phase 8: Landing Page Intelligence (₹0, local heuristics on real extracted signals) ----
function fillLandingPageInputs(){
 const l=state.landingPage||defaultLandingPage();
 $('lpUrl').value=l.url||'';
}
function messageOverlap(a,b){
 const stop=new Set(['the','a','an','and','or','of','to','for','in','on','with','your','you','is','are','this','that','it','at','be','by','as']);
 const words=String(a||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!stop.has(w));
 const target=String(b||'').toLowerCase();
 return words.some(w=>target.includes(w));
}
function buildLandingPageChecks(page,technical){
 const text=(page.text||'').toLowerCase();
 const h1=(page.h1s&&page.h1s[0])||'';
 const h2=(page.h2s&&page.h2s[0])||'';
 const ctaTexts=page.ctaTexts||[];
 const hasPrice=/[₹$€£]\s?\d|\b\d+\s?(rs|inr|usd)\b/i.test(page.text||'');
 const hasProof=['testimonial','review','rated','trusted by','case stud','5-star','5 star','★','⭐','success stor'].some(k=>text.includes(k));
 const hasObjectionHandling=['faq','frequently asked','money back','refund','guarantee','cancel anytime','no risk'].some(k=>text.includes(k));
 const hasTrustSignals=['privacy policy','terms of service','terms & conditions','secure checkout','ssl'].some(k=>text.includes(k));
 const ctaKeywords=['learn more','buy now','sign up','get started','book','register','enroll','join','contact','call','whatsapp','download','start now','claim','reserve'];
 const matchedCta=ctaTexts.find(t=>ctaKeywords.some(k=>t.toLowerCase().includes(k)));
 const notCheckedNote='Not checked — this signal can only be detected by fetching the live page markup; this analysis used pasted text.';
 return [
  {label:'Headline',ok:!!h1,note:h1?('Headline detected: "'+shortText(h1,80)+'"'):'No clear headline (an <h1> or a strong first line) was detected on the page.'},
  {label:'Subheadline',ok:!!(h2||page.metaDescription),note:h2?('Supporting heading detected: "'+shortText(h2,80)+'"'):(page.metaDescription?('Meta description found instead: "'+shortText(page.metaDescription,80)+'"'):'No supporting subheadline or meta description was detected.')},
  {label:'Offer',ok:hasPrice,note:hasPrice?'A price or currency amount was detected on the page.':'No price/currency amount was detected — confirm the offer is stated clearly on the page.'},
  {label:'CTA',ok:!!matchedCta,note:matchedCta?('Button/link text matching a call-to-action pattern was found: "'+esc(matchedCta)+'".'):'No obvious call-to-action button/link text was detected.'},
  {label:'Proof',ok:hasProof,note:hasProof?'Proof-related language (testimonials/reviews/ratings) was detected.':'No testimonial, review or ratings language was detected — consider adding social proof.'},
  {label:'Benefits',ok:(page.listItemCount||0)>=3,note:(page.listItemCount||0)>=3?(page.listItemCount+' list items detected — likely a benefits or feature list.'):'Fewer than 3 list items were detected — benefits may not be presented as a scannable list.'},
  {label:'Objections',ok:hasObjectionHandling,note:hasObjectionHandling?'FAQ/guarantee/refund language was detected, which typically addresses objections.':'No FAQ, guarantee or refund language was detected.'},
  {label:'Trust',ok:hasTrustSignals,note:hasTrustSignals?'A privacy policy, terms link or secure-checkout signal was detected.':'No privacy policy, terms link or trust-badge language was detected.'},
  {label:'Form',ok:technical?!!page.hasFormTag:null,note:technical?(page.hasFormTag?'A <form> element was detected on the page.':'No <form> element was detected — confirm how visitors actually convert (form, WhatsApp link, phone number).'):notCheckedNote},
  {label:'Mobile usability',ok:technical?!!page.hasViewportMeta:null,note:technical?(page.hasViewportMeta?'A responsive viewport meta tag was detected.':'No viewport meta tag was detected — the page may not be optimised for mobile.'):notCheckedNote}
 ];
}
function buildMessageMatch(page,ctx){
 const selected=Array.isArray(ctx.copy)&&ctx.copy.find(c=>c.name===ctx.selectedCopy);
 const hook=selected?selected.hook:'';
 const offerText=(ctx.offer&&ctx.offer.product)||(ctx.brief&&ctx.brief.productName)||'';
 const ctaText=(selected&&selected.cta)||(ctx.offer&&ctx.offer.cta)||'';
 const pageHeadline=(page.h1s&&page.h1s[0])||page.title||'';
 const pageText=page.text||'';
 return [
  {step:'Ad Hook → Landing Page Headline',ok:!hook?null:(messageOverlap(hook,pageHeadline)||messageOverlap(hook,pageText)),note:hook?('Ad hook: "'+shortText(hook,60)+'" vs. page headline: "'+shortText(pageHeadline,60)+'"'):'No ad hook selected yet — generate or select Ad Copy first to compare.'},
  {step:'Offer / Product Match',ok:!offerText?null:messageOverlap(offerText,pageText),note:offerText?('Product/offer "'+shortText(offerText,60)+'" '+(messageOverlap(offerText,pageText)?'appears to be mentioned on the page.':'was not found in the page text — a testable mismatch worth checking manually.')):'No product/offer name available to compare yet.'},
  {step:'CTA Match',ok:!ctaText?null:messageOverlap(ctaText,pageText),note:ctaText?('Ad CTA "'+shortText(ctaText,40)+'" '+(messageOverlap(ctaText,pageText)?'has similar wording on the page.':'was not found in similar wording on the page — a testable mismatch, not a certainty.')):'No CTA available to compare yet.'}
 ];
}
function applyLandingPageAnalysis(page,source){
 if(!state.landingPage)state.landingPage=defaultLandingPage();
 state.landingPage.page=page;
 state.landingPage.source=source;
 state.landingPage.analysis=buildLandingPageChecks(page,source==='fetched');
 state.landingPage.messageMatch=buildMessageMatch(page,{brief:state.brief||{},offer:state.offer,copy:state.copy,selectedCopy:state.selectedCopy});
 renderLandingPageAnalysis();
}
function renderLandingPageAnalysis(){
 const lp=state.landingPage||defaultLandingPage();
 const checks=lp.analysis;
 const resultEl=$('lpAnalysisResult'),matchEl=$('lpMessageMatchResult');
 if(!resultEl)return;
 if(!checks){resultEl.innerHTML='<div class="placeholder">Enter a URL and click Analyse Landing Page.</div>';matchEl.innerHTML='';return;}
 const rowHtml=c=>'<div class="offer-check-row '+(c.ok===null?'':c.ok?'ok':'warn')+'"><span class="offer-check-icon">'+(c.ok===null?'•':c.ok?'✓':'⚠')+'</span><div><strong>'+esc(c.label||c.step)+'</strong><p>'+esc(c.note)+'</p></div></div>';
 resultEl.innerHTML='<div class="offer-checklist">'+checks.map(rowHtml).join('')+'</div><small class="demo-badge">₹0 MODE — heuristic checks from '+(lp.source==='manual'?'pasted text':'the fetched page')+'; not a guarantee of results</small>';
 const mm=lp.messageMatch||[];
 matchEl.innerHTML=mm.length?'<h3 class="variants-head">Message Match</h3><div class="offer-checklist">'+mm.map(rowHtml).join('')+'</div><small class="demo-badge">Testable observations, not certainties — verify manually.</small>':'';
}
async function analyzeLandingPage(){
 if(!state.landingPage)state.landingPage=defaultLandingPage();
 const url=$('lpUrl').value.trim();
 if(!url){$('status').textContent='Enter a landing page URL first.';return;}
 state.landingPage.url=url;
 const btn=$('analyzeLandingPage');
 btn.disabled=true;const orig=btn.textContent;btn.textContent='Fetching…';
 $('lpManualWrap').hidden=true;
 $('status').textContent='Fetching landing page…';
 try{
  const res=await fetch('/api/fetch-landing-page',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
  const data=await res.json();
  if(!res.ok||!data.ok)throw new Error(data.error||'Could not fetch that page.');
  applyLandingPageAnalysis(data,'fetched');
  $('status').textContent='Landing page analysed — ₹0';
 }catch(err){
  $('lpManualWrap').hidden=false;
  $('status').textContent='Could not fetch automatically ('+err.message+') — paste the page text below instead.';
 }finally{
  btn.disabled=false;btn.textContent=orig;
 }
}
function analyzeLandingPageManual(){
 if(!state.landingPage)state.landingPage=defaultLandingPage();
 const text=$('lpManualText').value.trim();
 if(!text){$('status').textContent='Paste the page text first.';return;}
 const page={title:'',metaDescription:'',h1s:[],h2s:[],ctaTexts:[],listItemCount:(text.match(/\n\s*[-*•]\s/g)||[]).length,hasFormTag:false,hasViewportMeta:false,text};
 applyLandingPageAnalysis(page,'manual');
 $('status').textContent='Pasted text analysed — ₹0 (Form/Mobile usability need the live page and are marked not checked)';
}

// ---- Phase 9: Launch Checklist (₹0, editable, saved with the campaign) ----
function renderChecklist(){
 const container=$('checklistResult');
 if(!container)return;
 if(!state.checklist)state.checklist=defaultChecklist();
 state.checklist=normalizeChecklist(state.checklist);
 container.innerHTML=CHECKLIST_SECTIONS.map(s=>{
  const items=state.checklist[s.key];
  const done=items.filter(i=>i.checked).length;
  return '<div class="ai-image-panel" data-section="'+s.key+'"><div class="ai-image-head"><strong>'+esc(s.title)+'</strong><span class="ai-tab-status">'+done+' / '+items.length+' complete</span></div>'+
   '<div class="checkbox-group">'+items.map((it,i)=>'<label class="checkbox-item"><input type="checkbox" class="checklistBox" data-section="'+s.key+'" data-index="'+i+'" '+(it.checked?'checked':'')+'>'+esc(it.label)+'</label>').join('')+'</div></div>';
 }).join('');
 document.querySelectorAll('.checklistBox').forEach(el=>el.onchange=()=>{
  state.checklist[el.dataset.section][Number(el.dataset.index)].checked=el.checked;
  renderChecklist();
 });
}

// ---- Phase 10: Performance Analyzer (₹0, local; never invents missing values) ----
let perfPendingParse=null;
function renderPerformance(){
 if(!state.performance)state.performance=defaultPerformance();
 const rows=state.performance.rows;
 renderPerformanceDashboard(rows);
 renderPerformanceChart(rows);
 renderPerformanceTable(rows);
}
function renderPerformanceDashboard(rows){
 const el=$('perfDashboard');
 if(!el)return;
 if(!rows.length){el.innerHTML='';return;}
 const d=computePerformanceDashboard(rows);
 const cards=[
  {label:'Spend',value:fmtCurrency(d.spend)},
  {label:'Impressions',value:d.impressions==null?'—':Math.round(d.impressions).toLocaleString()},
  {label:'Clicks',value:d.clicks==null?'—':Math.round(d.clicks).toLocaleString()},
  {label:'CTR',value:d.ctr==null?'—':d.ctr.toFixed(2)+'%'},
  {label:'CPC',value:d.cpc==null?'—':d.cpc.toFixed(2)},
  {label:'Leads',value:d.leads==null?'—':Math.round(d.leads).toLocaleString()},
  {label:'CPL',value:d.cpl==null?'—':d.cpl.toFixed(2)},
  {label:'Conversions',value:d.conversions==null?'—':Math.round(d.conversions).toLocaleString()},
  {label:'ROAS',value:d.roas==null?'—':d.roas.toFixed(2)+'x'}
 ];
 el.innerHTML='<div class="perf-dashboard">'+cards.map(c=>'<div class="perf-card"><div class="perf-card-label">'+esc(c.label)+'</div><div class="perf-card-value">'+esc(c.value)+'</div></div>').join('')+'</div>';
}
function renderPerformanceChart(rows){
 const el=$('perfChart');
 if(!el)return;
 const byCampaign={};
 rows.forEach(r=>{const spend=num(r.spend);if(spend==null)return;const key=r.campaign||'(No campaign name)';byCampaign[key]=(byCampaign[key]||0)+spend;});
 const entries=Object.entries(byCampaign).sort((a,b)=>b[1]-a[1]);
 if(!entries.length){el.innerHTML='';return;}
 const max=entries[0][1]||1;
 el.innerHTML='<div class="ai-image-panel"><div class="ai-image-head"><strong>Spend by Campaign</strong></div>'+
  entries.map(([name,spend])=>'<div class="perf-bar-row"><span class="perf-bar-label" title="'+attr(name)+'">'+esc(name)+'</span><span class="perf-bar-track"><span class="perf-bar-fill" style="width:'+(spend/max*100).toFixed(1)+'%"></span></span><span class="perf-bar-value">'+fmtCurrency(spend)+'</span></div>').join('')+
 '</div>';
}
function fmtCurrency(v){return v==null?'—':'₹'+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
function metricCellHtml(m,decimals,suffix){
 const label={reported:'Reported',calculated:'Calculated',unavailable:'Unavailable'}[m.status];
 return '<span class="metric-'+m.status+'" title="'+label+'">'+fmtMetric(m,decimals,suffix)+'</span>';
}
function renderPerformanceTable(rows){
 const el=$('perfTableResult');
 if(!el)return;
 if(!rows.length){el.innerHTML='<div class="placeholder">No performance data yet. Upload a CSV, paste a table, or add a row manually.</div>';return;}
 const rawCols=PERF_FIELDS;
 const derivedCols=[
  {key:'ctr',label:'CTR',decimals:2,suffix:'%'},{key:'cpc',label:'CPC',decimals:2,suffix:''},{key:'cpl',label:'CPL',decimals:2,suffix:''},
  {key:'conversionRate',label:'Conv. Rate',decimals:2,suffix:'%'},{key:'frequency',label:'Frequency',decimals:2,suffix:''},
  {key:'roas',label:'ROAS',decimals:2,suffix:'x'},{key:'costPerConversion',label:'Cost / Conversion',decimals:2,suffix:''}
 ];
 const head='<tr>'+rawCols.map(f=>'<th>'+esc(f.label)+'</th>').join('')+derivedCols.map(c=>'<th>'+esc(c.label)+'</th>').join('')+'<th></th></tr>';
 const body=rows.map((r,i)=>{
  const derived=computeDerivedMetrics(r);
  const rawCells=rawCols.map(f=>'<td><input class="perfField" data-index="'+i+'" data-key="'+f.key+'" value="'+attr(r[f.key])+'"></td>').join('');
  const derivedCells=derivedCols.map(c=>'<td>'+metricCellHtml(derived[c.key],c.decimals,c.suffix)+'</td>').join('');
  return '<tr>'+rawCells+derivedCells+'<td><button class="ghost danger perfRemoveRow" data-index="'+i+'" type="button">✕</button></td></tr>';
 }).join('');
 el.innerHTML='<div class="perf-table-wrap"><table class="matrix-table"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div><small class="demo-badge">₹0 MODE — Reported = you entered this value directly; Calculated = derived from other reported values; Unavailable = not enough data, never invented</small>';
 document.querySelectorAll('.perfField').forEach(input=>input.oninput=()=>{
  state.performance.rows[Number(input.dataset.index)][input.dataset.key]=input.value;
  renderPerformanceDashboard(state.performance.rows);
  renderPerformanceChart(state.performance.rows);
 });
 document.querySelectorAll('.perfRemoveRow').forEach(btn=>btn.onclick=()=>{state.performance.rows.splice(Number(btn.dataset.index),1);renderPerformance();});
}
function addPerformanceRow(){
 if(!state.performance)state.performance=defaultPerformance();
 state.performance.rows.push(defaultPerformanceRow());
 state.performance.source=state.performance.source||'manual';
 renderPerformance();
 $('status').textContent='Row added — fill in the values you have; leave the rest blank';
}
function clearPerformanceRows(){
 if(!state.performance)state.performance=defaultPerformance();
 state.performance.rows=[];
 state.performance.source=null;
 perfPendingParse=null;
 $('perfMappingResult').innerHTML='';
 renderPerformance();
 $('status').textContent='Performance data cleared';
}
function renderMappingUI(){
 const el=$('perfMappingResult');
 if(!el||!perfPendingParse)return;
 const {headers,rows,mapping}=perfPendingParse;
 el.innerHTML='<div class="ai-image-panel"><div class="ai-image-head"><strong>Map Columns</strong><span class="ai-tab-status">'+rows.length+' row'+(rows.length===1?'':'s')+' detected</span></div>'+
  '<p class="section-help">Match each column from your data to a field below, or leave it as Ignore.</p>'+
  '<div class="ai-select-grid">'+headers.map((h,i)=>'<label>'+esc(h||'Column '+(i+1))+'<select class="perfMapField" data-index="'+i+'"><option value="ignore">Ignore</option>'+PERF_FIELDS.map(f=>'<option value="'+f.key+'"'+(mapping[i]===f.key?' selected':'')+'>'+esc(f.label)+'</option>').join('')+'</select></label>').join('')+'</div>'+
  '<div class="ai-image-controls"><button id="perfImportMapped" class="primary" type="button">Import '+rows.length+' Row'+(rows.length===1?'':'s')+'</button><button id="perfCancelMapping" class="ghost" type="button">Cancel</button></div></div>';
 document.querySelectorAll('.perfMapField').forEach(sel=>sel.onchange=()=>{perfPendingParse.mapping[Number(sel.dataset.index)]=sel.value;});
 $('perfImportMapped').onclick=()=>{
  if(!state.performance)state.performance=defaultPerformance();
  const {rows:parsedRows,mapping}=perfPendingParse;
  const imported=parsedRows.map(cols=>{
   const row=defaultPerformanceRow();
   mapping.forEach((key,i)=>{if(key!=='ignore'&&cols[i]!==undefined)row[key]=cols[i];});
   return row;
  });
  state.performance.rows=state.performance.rows.concat(imported);
  state.performance.source=state.performance.source&&state.performance.source!=='manual'?state.performance.source:(perfPendingParse.source||'import');
  perfPendingParse=null;
  el.innerHTML='';
  renderPerformance();
  $('status').textContent=imported.length+' row'+(imported.length===1?'':'s')+' imported — ₹0';
 };
 $('perfCancelMapping').onclick=()=>{perfPendingParse=null;el.innerHTML='';};
}
function startPerformanceMapping(headers,rows,source){
 if(!rows.length){$('status').textContent='No data rows found to import.';return;}
 perfPendingParse={headers,rows,mapping:guessColumnMapping(headers),source};
 renderMappingUI();
}
function handlePerfParsePaste(){
 const text=$('perfPasteInput').value;
 const {headers,rows}=parseDelimitedText(text);
 if(!headers.length){$('status').textContent='Paste some data first.';return;}
 startPerformanceMapping(headers,rows,'paste');
}
function handlePerfCsvInput(e){
 const file=e.target.files&&e.target.files[0];
 if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  const {headers,rows}=parseDelimitedText(String(reader.result||''));
  if(!headers.length){$('status').textContent='Could not read that CSV file.';return;}
  startPerformanceMapping(headers,rows,'csv');
 };
 reader.onerror=()=>{$('status').textContent='Could not read that CSV file.';};
 reader.readAsText(file);
 e.target.value='';
}

// ---- Phase 11: Campaign Doctor + Optimisation (₹0, local; computed from the rest of the campaign) ----
function computeCampaignDoctor(){
 const b=state.brief||{};
 const checks=[];
 const briefFields=['brandName','productName','targetCustomer','problem','outcome'];
 const briefFilled=briefFields.filter(k=>b[k]);
 checks.push({area:'Brief',status:briefFilled.length===briefFields.length?'complete':briefFilled.length?'needs-attention':'missing',
  note:briefFilled.length===briefFields.length?'All core brief fields are filled in.':briefFilled.length?('Missing: '+briefFields.filter(k=>!b[k]).join(', ')+'.'):'Brief has not been filled in yet.'});
 const offerAnalysis=state.offer&&state.offer.analysis;
 if(!offerAnalysis){checks.push({area:'Offer',status:'missing',note:'Offer has not been analysed yet.'});}
 else{
  const warn=offerAnalysis.filter(c=>!c.ok);
  checks.push({area:'Offer',status:warn.length?'needs-attention':'complete',note:warn.length?('Needs attention: '+warn.map(c=>c.label).join(', ')+'.'):'Offer analysis shows no gaps.'});
 }
 if(state.audience&&state.audience.plan){checks.push({area:'Audience',status:'complete',note:'Audience plan generated.'});}
 else if(state.audience&&(state.audience.primaryCustomer||state.audience.problem)){checks.push({area:'Audience',status:'needs-attention',note:'Audience details entered but no plan generated yet.'});}
 else{checks.push({area:'Audience',status:'missing',note:'Audience has not been defined yet.'});}
 checks.push({area:'Strategy',status:state.strategy?'complete':'missing',note:state.strategy?'Strategy generated.':'Strategy has not been generated yet.'});
 checks.push({area:'Copy',status:(Array.isArray(state.copy)&&state.copy.length)?'complete':'missing',note:(Array.isArray(state.copy)&&state.copy.length)?(state.copy.length+' ad copy variant(s) available.'):'No ad copy generated yet.'});
 const hasCreative=Array.isArray(state.creative)&&state.creative.length;
 const hasMatrix=Array.isArray(state.creativeMatrix)&&state.creativeMatrix.length;
 checks.push({area:'Creative',status:(hasCreative&&hasMatrix)?'complete':(hasCreative||hasMatrix)?'needs-attention':'missing',
  note:(hasCreative&&hasMatrix)?'Creative concepts and creative matrix are both ready.':(hasCreative||hasMatrix)?'Only one of creative concepts / creative matrix is ready.':'No creative concepts generated yet.'});
 if(state.landingPage&&state.landingPage.analysis){checks.push({area:'Landing Page',status:'complete',note:'Landing page analysed ('+(state.landingPage.source==='manual'?'pasted text':'fetched page')+').'});}
 else if(state.landingPage&&state.landingPage.url){checks.push({area:'Landing Page',status:'needs-attention',note:'URL is set but has not been analysed yet.'});}
 else{checks.push({area:'Landing Page',status:'missing',note:'No landing page URL set.'});}
 const adSets=(state.campaign&&state.campaign.adSets)||[];
 const hasAds=adSets.some(as=>Array.isArray(as.ads)&&as.ads.length);
 checks.push({area:'Campaign Structure',status:hasAds?'complete':(state.campaign&&state.campaign.name)?'needs-attention':'missing',
  note:hasAds?(adSets.length+' ad set(s) with ads planned.'):(state.campaign&&state.campaign.name)?'Campaign name set but no ad sets/ads planned yet.':'Campaign structure not planned yet.'});
 const allAds=adSets.reduce((acc,as)=>acc.concat(Array.isArray(as.ads)?as.ads:[]),[]);
 const withTracking=allAds.filter(ad=>ad.tracking);
 checks.push({area:'Tracking',status:!allAds.length?'missing':(withTracking.length===allAds.length?'complete':'needs-attention'),
  note:!allAds.length?'No ads planned yet to check tracking on.':(withTracking.length===allAds.length?'All planned ads have tracking parameters.':((allAds.length-withTracking.length)+' of '+allAds.length+' planned ads are missing tracking parameters.'))});
 const rows=(state.performance&&state.performance.rows)||[];
 checks.push({area:'Performance',status:rows.length?'complete':'missing',note:rows.length?(rows.length+' performance row(s) imported.'):'No performance data imported yet.'});
 return checks;
}
function doctorRowHtml(c){
 const icon={complete:'✓',['needs-attention']:'⚠',missing:'✕'}[c.status];
 const cls={complete:'ok',['needs-attention']:'warn',missing:'missing'}[c.status];
 return '<div class="offer-check-row '+cls+'"><span class="offer-check-icon">'+icon+'</span><div><strong>'+esc(c.area)+'</strong><p>'+esc(c.note)+'</p></div></div>';
}
function renderCampaignDoctor(){
 const el=$('doctorResult');
 if(!el)return;
 const checks=computeCampaignDoctor();
 el.innerHTML='<div class="offer-checklist">'+checks.map(doctorRowHtml).join('')+'</div><small class="demo-badge">₹0 MODE — Complete / Needs attention / Missing; no overall score, each area checked independently</small>';
}
function computePerformanceObservations(){
 const rows=(state.performance&&state.performance.rows)||[];
 if(!rows.length)return [];
 const d=computePerformanceDashboard(rows);
 const obs=[];
 if(d.spend!=null)obs.push('Total spend across '+rows.length+' row(s): '+fmtCurrency(d.spend)+' (reported).');
 if(d.ctr!=null)obs.push('Blended CTR: '+d.ctr.toFixed(2)+'% (calculated from total clicks ÷ total impressions).');
 if(d.cpc!=null)obs.push('Blended CPC: '+fmtCurrency(d.cpc)+' (calculated from total spend ÷ total clicks).');
 if(d.cpl!=null)obs.push('Blended CPL: '+fmtCurrency(d.cpl)+' (calculated from total spend ÷ total leads).');
 if(d.roas!=null)obs.push('Blended ROAS: '+d.roas.toFixed(2)+'x (calculated from total revenue ÷ total spend).');
 const byCampaign={};
 rows.forEach(r=>{const spend=num(r.spend);if(spend==null)return;const key=r.campaign||'(No campaign name)';byCampaign[key]=(byCampaign[key]||0)+spend;});
 const entries=Object.entries(byCampaign).sort((a,b)=>b[1]-a[1]);
 if(entries.length>1)obs.push('Highest-spend campaign: "'+entries[0][0]+'" ('+fmtCurrency(entries[0][1])+').');
 return obs;
}
function renderOptObservations(){
 const el=$('optObservations');
 if(!el)return;
 const obs=computePerformanceObservations();
 el.innerHTML=obs.length?('<ul class="reel-scenes">'+obs.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul><small class="demo-badge">Factual, from your imported data — not a judgement of good/bad.</small>'):'<div class="placeholder">Import performance data to see factual observations here.</div>';
}
function generateOptimisation(){
 if(!state.optimisation)state.optimisation=defaultOptimisation();
 const angles=(state.creativeMatrix||[]).map(c=>c.angle).filter(Boolean);
 const altAngle=angles.find(a=>a!==angles[0])||'a different angle (e.g. Outcome-led or Question-led)';
 const formats=(state.creativeMatrix||[]).map(c=>c.format).filter(Boolean);
 const altFormat=formats.find(f=>f!==formats[0])||'a different format (e.g. Reel or Carousel)';
 const strategies=(state.audience&&state.audience.strategies)||[];
 const altStrategy=strategies.length>1?strategies[1]:'a second audience strategy (e.g. Interest or Retargeting)';
 const rows=(state.performance&&state.performance.rows)||[];
 const hasLpAnalysis=state.landingPage&&state.landingPage.analysis;
 const tests=[
  {area:'Hook',hypothesis:'Changing the ad hook may improve early engagement (CTR).',
   possibleExplanation:'The current hook may not create enough relevance or pattern interrupt for the audience in the first line or first 1-2 seconds.',
   suggestedTest:'Test 1 — Hook: run the current copy against a hook using the "'+(altAngle)+'" angle from the Creative Matrix and compare CTR.'},
  {area:'Creative',hypothesis:'Changing the creative format may change engagement or conversion.',
   possibleExplanation:'Different formats (image vs. carousel vs. reel) surface differently in placements and may resonate differently with this audience.',
   suggestedTest:'Test 2 — Creative: run the current top creative against '+altFormat+' with the same offer and compare results.'},
  {area:'Audience',hypothesis:'Testing a different audience structure may change cost per result.',
   possibleExplanation:'The current audience/targeting may not be the most efficient path to this outcome — a broader or narrower structure could perform differently.',
   suggestedTest:'Test 3 — Audience: run the current structure against '+altStrategy+' and compare CPL/CPA.'},
  {area:'Landing Page',hypothesis:'Changing the landing page headline may improve message match and conversion.',
   possibleExplanation:hasLpAnalysis?'The Landing Page tab may have flagged specific gaps (e.g. headline, offer clarity, trust) worth addressing directly.':'The landing page has not been analysed yet, so this is a general recommendation rather than one grounded in a specific gap.',
   suggestedTest:'Test 4 — Landing Page: try a headline that mirrors the winning ad\'s hook more closely, then re-check Message Match on the Landing Page tab.'}
 ];
 state.optimisation.tests=tests.map((t,i)=>Object.assign({id:i+1,done:false},t));
 renderOptTests();
 $('status').textContent='Optimisation ideas generated — ₹0, hypotheses to test, not guaranteed improvements'+(rows.length?'':' (add performance data for more grounded observations)');
}
function renderOptTests(){
 const el=$('optTestsResult');
 if(!el)return;
 const tests=(state.optimisation&&state.optimisation.tests)||[];
 if(!tests.length){el.innerHTML='<div class="placeholder">Click Generate Optimisation Ideas to get testable hypotheses.</div>';return;}
 el.innerHTML=tests.map((t,i)=>'<article class="prompt-card"><h4>'+esc(t.area)+'</h4>'+
  '<label class="checkbox-item"><input type="checkbox" class="optTestDone" data-index="'+i+'" '+(t.done?'checked':'')+'>Marked as tested</label>'+
  '<label><span class="field-title">Hypothesis</span><textarea class="editable textarea optTestField" data-index="'+i+'" data-key="hypothesis" rows="2">'+esc(t.hypothesis)+'</textarea></label>'+
  '<label><span class="field-title">Possible Explanation</span><textarea class="editable textarea optTestField" data-index="'+i+'" data-key="possibleExplanation" rows="2">'+esc(t.possibleExplanation)+'</textarea></label>'+
  '<label><span class="field-title">Suggested Test</span><textarea class="editable textarea optTestField" data-index="'+i+'" data-key="suggestedTest" rows="2">'+esc(t.suggestedTest)+'</textarea></label>'+
 '</article>').join('')+'<small class="demo-badge">₹0 MODE — testable hypotheses, never a guarantee of improved results</small>';
 document.querySelectorAll('.optTestField').forEach(el2=>el2.oninput=()=>{state.optimisation.tests[Number(el2.dataset.index)][el2.dataset.key]=el2.value;});
 document.querySelectorAll('.optTestDone').forEach(el2=>el2.onchange=()=>{state.optimisation.tests[Number(el2.dataset.index)].done=el2.checked;});
}
function renderOptimisationTab(){
 renderCampaignDoctor();
 renderOptObservations();
 renderOptTests();
}

// ---- Phase 12: Prompt Library rendering (search, filter, copy, edit, save) ----
function effectivePromptList(){
 if(!state.promptLibrary)state.promptLibrary=defaultPromptLibrary();
 const overrides=state.promptLibrary.overrides||{};
 const builtIn=PROMPT_LIBRARY.map(p=>Object.assign({},p,overrides[p.id]||{},{custom:false}));
 const custom=(state.promptLibrary.custom||[]).map(p=>Object.assign({},p,{custom:true}));
 return builtIn.concat(custom);
}
function populatePromptFilterOptions(){
 const catSel=$('promptCategoryFilter'),fwSel=$('promptFrameworkFilter');
 if(catSel&&catSel.options.length<=1){PROMPT_CATEGORIES.forEach(c=>catSel.insertAdjacentHTML('beforeend','<option value="'+attr(c)+'">'+esc(c)+'</option>'));}
 if(fwSel&&fwSel.options.length<=1){PROMPT_FRAMEWORKS.forEach(f=>fwSel.insertAdjacentHTML('beforeend','<option value="'+attr(f)+'">'+esc(f)+'</option>'));}
}
function renderPromptLibrary(){
 const el=$('promptLibraryResult');
 if(!el)return;
 populatePromptFilterOptions();
 const search=($('promptSearch').value||'').trim().toLowerCase();
 const catFilter=$('promptCategoryFilter').value;
 const fwFilter=$('promptFrameworkFilter').value;
 const list=effectivePromptList().filter(p=>{
  if(catFilter&&p.category!==catFilter)return false;
  if(fwFilter&&p.framework!==fwFilter)return false;
  if(search){
   const hay=(p.title+' '+p.description+' '+p.promptText).toLowerCase();
   if(!hay.includes(search))return false;
  }
  return true;
 });
 if(!list.length){el.innerHTML='<div class="placeholder">No prompts match your search/filter.</div>';return;}
 el.innerHTML=list.map((p,i)=>'<article class="prompt-card" data-id="'+attr(p.id)+'"><h4>'+esc(p.title)+(p.custom?' <span class="ai-badge">Custom</span>':'')+'</h4>'+
  '<div class="ai-select-grid"><label>Title<input class="promptField" data-id="'+attr(p.id)+'" data-key="title" value="'+attr(p.title)+'"></label>'+
  '<label>Category<select class="promptField" data-id="'+attr(p.id)+'" data-key="category">'+PROMPT_CATEGORIES.map(c=>'<option value="'+attr(c)+'"'+(p.category===c?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label>'+
  '<label>Framework<select class="promptField" data-id="'+attr(p.id)+'" data-key="framework">'+PROMPT_FRAMEWORKS.map(f=>'<option value="'+attr(f)+'"'+(p.framework===f?' selected':'')+'>'+esc(f)+'</option>').join('')+'</select></label></div>'+
  '<label><span class="field-title">Description</span><input class="promptField" data-id="'+attr(p.id)+'" data-key="description" value="'+attr(p.description)+'"></label>'+
  '<label><span class="field-title">Prompt Text</span><textarea class="editable textarea promptField" data-id="'+attr(p.id)+'" data-key="promptText" rows="4">'+esc(p.promptText)+'</textarea></label>'+
  '<div class="card-actions"><button class="secondary copyPromptBtn" data-id="'+attr(p.id)+'">Copy</button>'+(p.custom?'<button class="ghost danger removeCustomPromptBtn" data-id="'+attr(p.id)+'">Remove</button>':'')+'</div></article>').join('');
 document.querySelectorAll('.promptField').forEach(input=>{
  const evt=input.tagName==='SELECT'?'change':'input';
  input.addEventListener(evt,()=>updatePromptField(input.dataset.id,input.dataset.key,input.value));
 });
 document.querySelectorAll('.copyPromptBtn').forEach(btn=>btn.onclick=()=>{
  const p=effectivePromptList().find(x=>x.id===btn.dataset.id);
  if(p){navigator.clipboard?.writeText(p.promptText);$('status').textContent='Prompt copied';}
 });
 document.querySelectorAll('.removeCustomPromptBtn').forEach(btn=>btn.onclick=()=>{
  state.promptLibrary.custom=state.promptLibrary.custom.filter(p=>p.id!==btn.dataset.id);
  renderPromptLibrary();
  $('status').textContent='Custom prompt removed';
 });
}
function updatePromptField(id,key,value){
 if(!state.promptLibrary)state.promptLibrary=defaultPromptLibrary();
 const custom=state.promptLibrary.custom.find(p=>p.id===id);
 if(custom){custom[key]=value;return;}
 if(!state.promptLibrary.overrides[id])state.promptLibrary.overrides[id]={};
 state.promptLibrary.overrides[id][key]=value;
}
function addCustomPrompt(){
 if(!state.promptLibrary)state.promptLibrary=defaultPromptLibrary();
 const id='custom-'+Date.now();
 state.promptLibrary.custom.push({id,category:PROMPT_CATEGORIES[0],framework:PROMPT_FRAMEWORKS[0],title:'New Custom Prompt',description:'',promptText:''});
 renderPromptLibrary();
 $('status').textContent='Custom prompt added — edit it below';
}

// ---- Phase 13: 90-Day Plan rendering ----
function renderPlan90(){
 const el=$('plan90Result');
 if(!el)return;
 if(!state.plan90)state.plan90=defaultPlan90();
 const months=state.plan90.months;
 const allTasks=months.flatMap(m=>m.weeks.flatMap(w=>w.tasks));
 const totalDone=allTasks.filter(t=>t.done).length;
 el.innerHTML='<p class="section-help">'+totalDone+' / '+allTasks.length+' tasks marked done. This is a customisable planning structure, not a guarantee of results — edit it to fit your own campaign.</p>'+
  months.map((m,mi)=>{
   const monthTasks=m.weeks.flatMap(w=>w.tasks);
   const monthDone=monthTasks.filter(t=>t.done).length;
   return '<div class="ai-image-panel"><div class="ai-image-head"><input class="editable plan90Field" data-mi="'+mi+'" data-key="title" value="'+attr(m.title)+'" style="font-weight:800;border:none;background:transparent;flex:1"><span class="ai-tab-status">'+monthDone+' / '+monthTasks.length+' complete</span></div>'+
    m.weeks.map((w,wi)=>'<div class="shot-row"><label><span class="field-title">Week focus</span><input class="editable plan90Field" data-mi="'+mi+'" data-wi="'+wi+'" data-key="label" value="'+attr(w.label)+'"></label>'+
     '<div class="checkbox-group">'+w.tasks.map((t,ti)=>'<div class="checkbox-item"><input type="checkbox" class="plan90TaskDone" data-mi="'+mi+'" data-wi="'+wi+'" data-ti="'+ti+'" '+(t.done?'checked':'')+'><input class="editable plan90TaskText" data-mi="'+mi+'" data-wi="'+wi+'" data-ti="'+ti+'" value="'+attr(t.text)+'" style="border:none;background:transparent;width:260px"><button class="ghost danger plan90RemoveTask" data-mi="'+mi+'" data-wi="'+wi+'" data-ti="'+ti+'" type="button">✕</button></div>').join('')+
     '</div><button class="secondary plan90AddTask" data-mi="'+mi+'" data-wi="'+wi+'" type="button">+ Add Task</button></div>').join('')+
   '</div>';
  }).join('');
 document.querySelectorAll('.plan90Field').forEach(input=>input.oninput=()=>{
  const mi=Number(input.dataset.mi);
  if(input.dataset.wi===undefined){state.plan90.months[mi].title=input.value;}
  else{state.plan90.months[mi].weeks[Number(input.dataset.wi)].label=input.value;}
 });
 document.querySelectorAll('.plan90TaskText').forEach(input=>input.oninput=()=>{
  state.plan90.months[Number(input.dataset.mi)].weeks[Number(input.dataset.wi)].tasks[Number(input.dataset.ti)].text=input.value;
 });
 document.querySelectorAll('.plan90TaskDone').forEach(input=>input.onchange=()=>{
  state.plan90.months[Number(input.dataset.mi)].weeks[Number(input.dataset.wi)].tasks[Number(input.dataset.ti)].done=input.checked;
  renderPlan90();
 });
 document.querySelectorAll('.plan90RemoveTask').forEach(btn=>btn.onclick=()=>{
  state.plan90.months[Number(btn.dataset.mi)].weeks[Number(btn.dataset.wi)].tasks.splice(Number(btn.dataset.ti),1);
  renderPlan90();
 });
 document.querySelectorAll('.plan90AddTask').forEach(btn=>btn.onclick=()=>{
  state.plan90.months[Number(btn.dataset.mi)].weeks[Number(btn.dataset.wi)].tasks.push({text:'',done:false});
  renderPlan90();
 });
}

// ---- Help tab ----
const HELP_TOPICS=[
 {tab:'brief',group:'Plan',title:'Campaign Brief',summary:'Start here. Enter your brand, product/service, target customer, problem, outcome, objective and (optionally) a landing page URL.',tips:['Click "Use Reference Example" to see a fully filled-in example campaign before starting your own.','The AI Control panel here is OFF by default — everything works at ₹0 until you explicitly turn a stage on.']},
 {tab:'strategy',group:'Plan',title:'Strategy',summary:'A campaign strategy generated from your brief — audience, core pain, positioning, key message and testing angles.',tips:['Generate a campaign from the Brief tab first if this is empty.','Review and edit before moving on — tone and positioning here carry into later tabs.']},
 {tab:'audience',group:'Plan',title:'Audience',summary:'Define who the campaign speaks to: demographics, awareness level, buying intent and audience strategy (Broad / Interest / Custom / Lookalike / Advantage+ / Retargeting).',tips:['Click "Generate Audience Plan" for a message and a testing matrix.','Feeds the Campaign tab\'s ad-set naming and the Optimisation tab\'s audience test ideas.']},
 {tab:'offer',group:'Plan',title:'Offer',summary:'Define price, bonuses, guarantee, scarcity and proof, then run a ₹0 heuristic analysis (clarity, value proposition, risk reversal, proof, urgency, CTA).',tips:['A ⚠ here means "consider adding this" — it is not a guarantee of better results.']},
 {tab:'structure',group:'Plan',title:'Campaign (Structure)',summary:'Plan the Campaign → Ad Set → Ad hierarchy with an editable naming convention, budgets and UTM tracking.',tips:['Planning only — nothing here is created in Meta Ads Manager.','Fill in Audience and Ad Copy first for better auto-generated names.']},
 {tab:'copy',group:'Create',title:'Ad Copy',summary:'Primary text, headline, description and CTA for 3 ad variations, with live Meta character-count guidance.',tips:['Yellow fields are generated starting points — edit them freely before use.']},
 {tab:'creative',group:'Create',title:'Creative Ideas',summary:'Visual concepts per format, an editable Creative Matrix (Angle × Format), and the AI Image Factory for optional AI-generated images.',tips:['AI Images are OFF by default and never generate automatically — you always click "Generate AI Images" yourself after reviewing the prompt.','Do not rely on generated images for readable text — add text overlays separately.']},
 {tab:'reels',group:'Create',title:'Reel Scripts',summary:'Full reel scripts (title, hook, angle, duration, scenes, voiceover, on-screen text, camera direction, b-roll, CTA, caption) plus the Reel Factory beat-by-beat shot-list builder.',tips:[]},
 {tab:'landing',group:'Create',title:'Landing Page',summary:'Analyse your destination URL — fetched automatically where possible, or paste the page text if it can\'t be fetched — and compare it against your ad hook with Message Match.',tips:['Checks are only ever based on real signals found on the page — never invented.']},
 {tab:'checklist',group:'Launch',title:'Launch Checklist',summary:'A 31-item Pre-launch / Campaign / Ads / Final checklist to work through before publishing in Meta Ads Manager.',tips:['Checking an item only records that you confirmed it yourself — nothing is verified automatically.']},
 {tab:'performance',group:'Analyse',title:'Performance',summary:'Import real ad performance data (CSV, paste, or manual entry) and see ₹0 dashboard metrics and a spend-by-campaign chart.',tips:['A ratio only shows when the underlying numbers are present — a blank/— means the data isn\'t there, never a guess.']},
 {tab:'optimisation',group:'Analyse',title:'Optimisation',summary:'Campaign Doctor checks 10 areas of your campaign; Optimisation Ideas turns performance data into testable hypotheses; Generate New Creative Set closes the loop.',tips:['Come back here after each round of running the campaign and importing fresh Performance data.']},
 {tab:'prompts',group:'Tools',title:'Prompt Library',summary:'18 original prompt/framework templates — search, filter by category/framework, copy, edit, and save your own.',tips:['Use these as starting points for writing strategy, copy, creative, reel or optimisation content yourself.']},
 {tab:'plan90',group:'Tools',title:'90-Day Plan',summary:'A 3-month, 12-week planning structure (Foundation → Optimisation → Consolidation) with editable tasks tied back into this app\'s own tabs.',tips:['A planning aid, not a guarantee of results — adjust it to your own timeline.']},
 {tab:'saved',group:'Tools',title:'Saved',summary:'Every campaign you save lives here, in this browser\'s local storage — load, duplicate or delete.',tips:['Nothing leaves your browser unless you explicitly export it.']},
 {tab:'export',group:'Tools',title:'Export',summary:'Export the full campaign as JSON or a text summary — never includes API keys.',tips:[]}
];
function renderHelp(){
 const el=$('helpResult');
 if(!el)return;
 const groups=['Plan','Create','Launch','Analyse','Tools'];
 el.innerHTML='<div class="ai-image-panel"><div class="ai-image-head"><strong>Field colours</strong></div>'+
  '<p class="section-help">Light orange fields need your input. Light yellow fields are generated/heuristic starting points — freely editable. A yellow field turns a deeper yellow while you\'re actively editing it.</p></div>'+
  '<div class="ai-image-panel"><div class="ai-image-head"><strong>AI is optional, everywhere</strong></div>'+
  '<p class="section-help">Every stage works at ₹0 by default using this app\'s built-in local logic. AI (OpenAI/Anthropic) is only used for a stage if you explicitly switch it on in the AI Control panel on the Campaign Brief tab, and AI Images specifically only generate when you click "Generate AI Images" after reviewing the prompt.</p></div>'+
  '<div class="ai-image-panel"><div class="ai-image-head"><strong>Recommended sequence</strong></div>'+
  '<p class="section-help">'+HELP_TOPICS.map(t=>esc(t.title)).join(' → ')+'</p></div>'+
  groups.map(g=>'<h3 class="variants-head">'+esc(g)+'</h3>'+HELP_TOPICS.filter(t=>t.group===g).map(t=>
   '<article class="prompt-card"><h4>'+esc(t.title)+'</h4><p>'+esc(t.summary)+'</p>'+
   (t.tips.length?'<ul class="reel-scenes">'+t.tips.map(tip=>'<li>'+esc(tip)+'</li>').join('')+'</ul>':'')+
   '<div class="card-actions"><button class="secondary helpGoToTab" data-tab="'+attr(t.tab)+'">Go to '+esc(t.title)+' →</button></div></article>'
  ).join('')).join('');
 document.querySelectorAll('.helpGoToTab').forEach(btn=>btn.onclick=()=>showTab(btn.dataset.tab));
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

// ---- Phase 4: Campaign Structure (planning layer only, ₹0, local naming heuristics) ----
const MONTH_ABBR=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
const OBJECTIVE_ABBR={'Lead Generation':'LeadGen','Website Traffic':'Traffic','Sales':'Sales','WhatsApp Leads':'WA_Leads','Workshop / Webinar':'Workshop','Course':'Course','Service':'Service','Product':'Product'};
const COUNTRY_CODES={'india':'IN','united states':'US','usa':'US','united states of america':'US','uk':'UK','united kingdom':'UK','canada':'CA','australia':'AU','singapore':'SG','uae':'AE','united arab emirates':'AE','germany':'DE','france':'FR'};
function countryCode(location){
 const key=String(location||'').trim().toLowerCase();
 if(!key)return 'XX';
 if(COUNTRY_CODES[key])return COUNTRY_CODES[key];
 return key.slice(0,2).toUpperCase();
}
function monthTag(){const d=new Date();return MONTH_ABBR[d.getMonth()]+String(d.getFullYear()).slice(-2);}
function angleFromCopyName(name){
 const m=String(name||'').match(/·\s*([A-Za-z]+)/);
 return m?m[1]:'General';
}
function setByPath(obj,path,value){
 const keys=path.split('.');
 let cur=obj;
 for(let i=0;i<keys.length-1;i++){
   const k=/^\d+$/.test(keys[i])?Number(keys[i]):keys[i];
   cur=cur[k];
 }
 const lastKey=keys[keys.length-1];
 const lk=/^\d+$/.test(lastKey)?Number(lastKey):lastKey;
 cur[lk]=value;
}
function generateCampaignStructure(){
 state.brief=brief();
 const b=state.brief;
 const cc=countryCode(state.audience.location||b.location);
 const age=state.audience.age||b.ageRange||'25-45';
 const objAbbr=OBJECTIVE_ABBR[b.objective]||(b.objective||'Campaign').replace(/[^A-Za-z]/g,'');
 const campaignNameField=$('campaignName').value.trim();
 const campaignName=campaignNameField||('SM_'+objAbbr+'_'+cc+'_'+age+'_'+monthTag());
 const strategies=(state.audience.strategies&&state.audience.strategies.length)?state.audience.strategies:['Broad','Interest','Lookalike'];
 const copies=(Array.isArray(state.copy)&&state.copy.length)?state.copy:CampaignGenerator.buildCampaign(b).copy;
 const creatives=(Array.isArray(state.creative)&&state.creative.length)?state.creative:CampaignGenerator.buildCampaign(b).creative;
 const optimisationEvent=b.objective==='Sales'?'Purchase':b.objective==='WhatsApp Leads'?'Conversation started':b.objective==='Website Traffic'?'Landing Page Views':'Lead';
 const adSets=strategies.slice(0,3).map((strategy,si)=>{
  const adSetName='AS_'+String(strategy).replace(/\s+/g,'')+'_'+cc+'_'+age;
  const ads=copies.slice(0,3).map((c,ai)=>{
   const angle=angleFromCopyName(c.name);
   return {
    id:'ad-'+si+'-'+ai,
    name:'AD_'+angle.replace(/\s+/g,'')+'_Hook'+String(ai+1).padStart(2,'0'),
    copy:c.name||'',
    creative:(creatives[ai]&&creatives[ai].format)||'Single Image Ad',
    headline:c.headline||'',
    cta:c.cta||'Learn More',
    destination:b.landingPage||'',
    tracking:''
   };
  });
  return {
   id:'adset-'+si,
   name:adSetName,
   audience:strategy,
   age,
   location:state.audience.location||b.location||'',
   placements:'Advantage+ Placements',
   optimisationEvent,
   budget:'',
   ads
  };
 });
 state.campaign={
  name:campaignName,
  objective:b.objective||'',
  budget:state.campaign.budget||b.budget||'',
  location:state.audience.location||b.location||'',
  destination:state.campaign.destination||b.landingPage||'',
  adSets
 };
 $('campaignName').value=state.campaign.name;
 renderCampaignStructure();
 $('status').textContent='Campaign structure generated — ₹0 (planning only)';
}
function renderCampaignStructure(){
 const c=state.campaign;
 if(!c||!Array.isArray(c.adSets)||!c.adSets.length){
   $('campaignStructureResult').innerHTML='<div class="placeholder">Complete the brief (and ideally Audience/Ad Copy) and click Generate Structure.</div>';
   return;
 }
 $('campaignStructureResult').innerHTML='<div class="structure-tree"><div class="structure-node campaign-node"><strong>CAMPAIGN</strong> · '+esc(c.name)+'</div>'+
  c.adSets.map((as,si)=>
   '<div class="structure-node adset-node">'+
    '<div class="structure-node-head"><span class="structure-tag">AD SET '+(si+1)+'</span><input class="structure-field" data-path="adSets.'+si+'.name" value="'+attr(as.name)+'"></div>'+
    '<div class="structure-grid">'+
     '<label>Audience<input class="structure-field" data-path="adSets.'+si+'.audience" value="'+attr(as.audience)+'"></label>'+
     '<label>Age<input class="structure-field" data-path="adSets.'+si+'.age" value="'+attr(as.age)+'"></label>'+
     '<label>Location<input class="structure-field" data-path="adSets.'+si+'.location" value="'+attr(as.location)+'"></label>'+
     '<label>Placements<input class="structure-field" data-path="adSets.'+si+'.placements" value="'+attr(as.placements)+'"></label>'+
     '<label>Optimisation Event<input class="structure-field" data-path="adSets.'+si+'.optimisationEvent" value="'+attr(as.optimisationEvent)+'"></label>'+
     '<label>Budget<input class="structure-field" data-path="adSets.'+si+'.budget" value="'+attr(as.budget)+'" placeholder="e.g. ₹150/day"></label>'+
    '</div>'+
    as.ads.map((ad,ai)=>
     '<div class="structure-node ad-node">'+
      '<div class="structure-node-head"><span class="structure-tag">AD '+(ai+1)+'</span><input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.name" value="'+attr(ad.name)+'"></div>'+
      '<div class="structure-grid">'+
       '<label>Copy<input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.copy" value="'+attr(ad.copy)+'"></label>'+
       '<label>Creative<input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.creative" value="'+attr(ad.creative)+'"></label>'+
       '<label>Headline<input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.headline" value="'+attr(ad.headline)+'"></label>'+
       '<label>CTA<input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.cta" value="'+attr(ad.cta)+'"></label>'+
       '<label>Destination<input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.destination" value="'+attr(ad.destination)+'"></label>'+
       '<label>Tracking<input class="structure-field" data-path="adSets.'+si+'.ads.'+ai+'.tracking" value="'+attr(ad.tracking)+'" placeholder="e.g. UTM params"></label>'+
      '</div>'+
     '</div>'
    ).join('')+
   '</div>'
  ).join('')+
 '</div><small class="demo-badge">₹0 MODE — planning layer only; nothing is created in Meta Ads Manager</small>';
 document.querySelectorAll('.structure-field').forEach(el=>el.oninput=()=>setByPath(state.campaign,el.dataset.path,el.value));
}

async function loadReferenceExample(){
  const btn=$('useReference');
  btn.disabled=true;
  $('status').textContent='Loading complete reference campaign…';
  try{
    const base='/reference/';
    let referenceBrief, adData, reelData, strategyData, creativeData, audienceData, offerData, structureData, creativeMatrixData;
    try{
      const [briefResponse,adResponse,reelResponse,strategyResponse,creativeResponse,audienceResponse,offerResponse,structureResponse,creativeMatrixResponse]=await Promise.all([
        fetch(base+'reference-input.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-copy-variations.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-reel-scripts.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-strategy.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-creative.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-audience.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-offer.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-campaign-structure.json?v='+Date.now(),{cache:'no-store'}),
        fetch(base+'reference-creative-matrix.json?v='+Date.now(),{cache:'no-store'})
      ]);
      if(!briefResponse.ok)throw new Error('Reference brief '+briefResponse.status);
      if(!adResponse.ok)throw new Error('Reference ads '+adResponse.status);
      if(!reelResponse.ok)throw new Error('Reference reels '+reelResponse.status);
      if(!strategyResponse.ok)throw new Error('Reference strategy '+strategyResponse.status);
      if(!creativeResponse.ok)throw new Error('Reference creative '+creativeResponse.status);
      if(!audienceResponse.ok)throw new Error('Reference audience '+audienceResponse.status);
      if(!offerResponse.ok)throw new Error('Reference offer '+offerResponse.status);
      if(!structureResponse.ok)throw new Error('Reference campaign structure '+structureResponse.status);
      if(!creativeMatrixResponse.ok)throw new Error('Reference creative matrix '+creativeMatrixResponse.status);
      referenceBrief=await briefResponse.json();
      adData=await adResponse.json();
      reelData=await reelResponse.json();
      strategyData=await strategyResponse.json();
      creativeData=await creativeResponse.json();
      audienceData=await audienceResponse.json();
      offerData=await offerResponse.json();
      structureData=await structureResponse.json();
      creativeMatrixData=await creativeMatrixResponse.json();
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
      audienceData={audience:REFERENCE_AUDIENCE};
      offerData={offer:REFERENCE_OFFER};
      structureData={structure:REFERENCE_CAMPAIGN_STRUCTURE};
      creativeMatrixData={creativeMatrix:REFERENCE_CREATIVE_MATRIX};
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
    state.imageFactory=defaultImageFactory();
    state.reelFactory=defaultReelFactory();
    state.audience=Object.assign(defaultAudience(),audienceData.audience||REFERENCE_AUDIENCE);
    state.offer=Object.assign(defaultOffer(),offerData.offer||REFERENCE_OFFER);
    state.campaign=Object.assign(defaultCampaignStructure(),structureData.structure||REFERENCE_CAMPAIGN_STRUCTURE);
    state.creativeMatrix=Array.isArray(creativeMatrixData.creativeMatrix)?creativeMatrixData.creativeMatrix.slice():REFERENCE_CREATIVE_MATRIX.slice();
    state.strategy=strategyData.strategy||REFERENCE_STRATEGY;
    state.copy=Array.isArray(adData.ads)?adData.ads.slice():REFERENCE_ADS.slice();
    state.creative=Array.isArray(creativeData.creative)?creativeData.creative.slice():REFERENCE_CREATIVE.slice();
    state.reels=Array.isArray(reelData.scripts)?reelData.scripts.slice():REFERENCE_REELS.slice();
    state.selectedCopy=state.copy.length?state.copy[0].name:null;
    state.landingPage=Object.assign(defaultLandingPage(),{url:referenceBrief.landingPage||''});
    state.checklist=defaultChecklist();
    state.performance=defaultPerformance();
    state.optimisation=defaultOptimisation();
    state.promptLibrary=defaultPromptLibrary();
    state.plan90=defaultPlan90();

    if(!state.strategy||!state.copy.length||!state.creative.length||!state.reels.length)throw new Error('Reference outputs are empty');

    renderResults();
    renderAiControlSummary();
    fillAudienceInputs(state.audience);
    renderAudiencePlan();
    renderAudienceMatrix();
    fillOfferInputs(state.offer);
    renderOfferAnalysis();
    $('campaignName').value=state.campaign.name||'';
    $('campaignObjective').value=state.campaign.objective||'';
    $('campaignBudget').value=state.campaign.budget||'';
    $('campaignLocation').value=state.campaign.location||'';
    $('campaignDestination').value=state.campaign.destination||'';
    renderCampaignStructure();
    renderCreativeMatrix();
    fillImageFactoryGlobalInputs();
    renderImageConceptSelect();
    renderImagePrompts();
    renderReelSelect();
    renderReelShotList();
    fillLandingPageInputs();
    renderLandingPageAnalysis();
    renderChecklist();
    renderPerformance();
    renderOptimisationTab();
    renderPromptLibrary();
    renderPlan90();
    $('status').textContent='Reference loaded — Strategy, Audience, Offer, Campaign Structure, 3 Ad Copies, Creative Matrix + 4 Creative Ideas, 3 Reel Scripts ready';
    showTab('brief');
  }catch(err){
    $('status').textContent='Reference loading error — '+err.message;
  }finally{
    btn.disabled=false;
  }
}
$('useReference').onclick=loadReferenceExample;
$('generate').onclick=()=>{state.brief=brief();generateAI();};
$('regenStrategy').onclick=()=>regenerate('strategy');$('regenCopy').onclick=()=>regenerate('copy');$('regenCreative').onclick=()=>regenerate('creative');$('regenReels').onclick=()=>regenerate('reels');$('nextAudience').onclick=()=>showTab('audience');$('nextOffer').onclick=()=>showTab('offer');$('nextStructure').onclick=()=>showTab('structure');$('nextCopyFromStructure').onclick=()=>showTab('copy');$('nextCreative').onclick=()=>showTab('creative');$('nextReels').onclick=()=>showTab('reels');$('nextLanding').onclick=()=>showTab('landing');$('nextChecklist').onclick=()=>showTab('checklist');$('nextPerformance').onclick=()=>showTab('performance');$('nextOptimisation').onclick=()=>showTab('optimisation');$('nextPrompts').onclick=()=>showTab('prompts');$('nextPlan90').onclick=()=>showTab('plan90');$('nextSaved').onclick=()=>showTab('saved');
$('genAudiencePlan').onclick=generateAudiencePlan;
$('addMatrixRow').onclick=()=>{if(!state.audience)state.audience=defaultAudience();if(!Array.isArray(state.audience.matrix))state.audience.matrix=[];state.audience.matrix.push({audience:'',angle:'',creative:'',purpose:''});renderAudienceMatrix();};
$('analyzeOffer').onclick=analyzeOffer;
$('genCampaignStructure').onclick=generateCampaignStructure;
$('campaignName').oninput=()=>{state.campaign.name=$('campaignName').value;};
$('campaignBudget').oninput=()=>{state.campaign.budget=$('campaignBudget').value;};
$('campaignLocation').oninput=()=>{state.campaign.location=$('campaignLocation').value;};
$('campaignDestination').oninput=()=>{state.campaign.destination=$('campaignDestination').value;};
$('genCreativeMatrix').onclick=generateCreativeMatrix;
$('addCreativeMatrixRow').onclick=()=>{if(!Array.isArray(state.creativeMatrix))state.creativeMatrix=[];state.creativeMatrix.push({angle:CREATIVE_ANGLES[0],format:CREATIVE_FORMATS[0],hook:'',visual:'',cta:'Learn More'});renderCreativeMatrix();};

$('aiMasterSwitch').onchange=onAiControlChange;
document.querySelectorAll('.ai-stage-grid input[type=checkbox]').forEach(el=>el.onchange=onAiControlChange);
$('textProviderSelect').onchange=onAiControlChange;
$('textModelSelect').onchange=onAiControlChange;
$('imageProviderSelect').onchange=onAiControlChange;
$('imageModelSelect').onchange=onAiControlChange;
$('imageQualitySelect').onchange=onAiControlChange;
$('aiImagesOnlyBtn').onclick=()=>{
 $('aiMasterSwitch').checked=true;
 document.querySelectorAll('.ai-stage-grid input[type=checkbox]').forEach(el=>{el.checked=el.dataset.stage==='images';});
 onAiControlChange();
 $('status').textContent='AI Images Only preset applied';
};
$('genImagePrompts').onclick=generateImagePrompts;
$('genReelShotList').onclick=generateReelShotList;
$('analyzeLandingPage').onclick=analyzeLandingPage;
$('analyzeLpManual').onclick=analyzeLandingPageManual;
$('perfAddRow').onclick=addPerformanceRow;
$('perfClearAll').onclick=clearPerformanceRows;
$('perfParsePaste').onclick=handlePerfParsePaste;
$('perfCsvInput').onchange=handlePerfCsvInput;
$('refreshDoctor').onclick=renderCampaignDoctor;
$('genOptimisation').onclick=generateOptimisation;
$('genNewCreativeSet').onclick=()=>{generateCreativeMatrix();$('status').textContent='New creative set generated — ₹0, closing the optimisation loop';showTab('creative');};
$('promptSearch').oninput=renderPromptLibrary;
$('promptCategoryFilter').onchange=renderPromptLibrary;
$('promptFrameworkFilter').onchange=renderPromptLibrary;
$('addCustomPrompt').onclick=addCustomPrompt;
$('generateImagesBtn').onclick=async()=>{
 if(!stageIsAi('images'))return;
 if(!Array.isArray(state.creative)||!state.creative.length){$('status').textContent='Generate creative concepts first.';return;}
 if(!state.imageFactory)state.imageFactory=defaultImageFactory();
 if(!state.imageFactory.prompts.length){
   if(!state.imageFactory.selected.length)state.imageFactory.selected=state.creative.map((c,i)=>i);
   generateImagePrompts();
 }
 if(!state.imageFactory.prompts.length){$('status').textContent='Generate prompts first.';return;}
 const btn=$('generateImagesBtn');
 btn.disabled=true;const orig=btn.textContent;btn.textContent='Generating images…';
 $('status').textContent='Calling '+providerLabel(state.aiConfig.imageProvider)+' for images…';
 try{
   const concepts=state.imageFactory.prompts.map(p=>({format:p.format,prompt:p.promptText,aspectRatio:p.fields.aspectRatio}));
   const data=await callGenerateStage('images',state.brief,{quality:state.aiConfig.imageQuality,aspectRatio:state.imageFactory.global.aspectRatio,creativeConcepts:concepts,model:state.aiConfig.imageModel,provider:state.aiConfig.imageProvider});
   state.aiImages=Array.isArray(data.images)?data.images:[];
   const imageCount=(data.usage&&data.usage.imageCount)||state.aiImages.length;
   state.aiUsage.images={
     provider:state.aiConfig.imageProvider,
     model:state.aiConfig.imageModel,
     quality:state.aiConfig.imageQuality,
     aspectRatio:state.imageFactory.global.aspectRatio,
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
function startNewCampaign(){ids.forEach(id=>$(id).value='');resetState();$('strategyResult').innerHTML='<div class="placeholder">Complete the brief and generate a strategy.</div>';$('copyResult').innerHTML='<div class="placeholder">Generate a campaign to create ad copy.</div>';$('creativeResult').innerHTML='<article><h3>Image Ad</h3><p>Visual concept and text hierarchy.</p></article><article><h3>Carousel</h3><p>Problem → solution → proof → CTA.</p></article><article><h3>Story</h3><p>Vertical 9:16 concept.</p></article><article><h3>Reel</h3><p>Scene-by-scene creative concept.</p></article>';$('reelsResult').innerHTML='<div class="placeholder">Generate a campaign to create reel scripts.</div>';fillAudienceInputs(state.audience);renderAudiencePlan();renderAudienceMatrix();fillOfferInputs(state.offer);renderOfferAnalysis();$('campaignName').value='';$('campaignObjective').value='';$('campaignBudget').value='';$('campaignLocation').value='';$('campaignDestination').value='';renderCampaignStructure();renderCreativeMatrix();fillImageFactoryGlobalInputs();renderImageConceptSelect();renderImagePrompts();renderReelSelect();renderReelShotList();fillLandingPageInputs();renderLandingPageAnalysis();renderChecklist();renderPerformance();renderOptimisationTab();renderPromptLibrary();renderPlan90();$('status').textContent='New campaign ready';renderAiControlSummary();showTab('brief');}
$('newCampaign').onclick=()=>{$('newCampaignConfirm').hidden=false;};
$('confirmNewCampaign').onclick=()=>{$('newCampaignConfirm').hidden=true;startNewCampaign();};
$('cancelNewCampaign').onclick=()=>{$('newCampaignConfirm').hidden=true;};
$('clear').onclick=()=>{$('newCampaignConfirm').hidden=false;};
$('exportJson').onclick=()=>download('ai-ads-campaign.json',JSON.stringify(state,null,2),'application/json');
$('exportText').onclick=()=>{
 const briefText=Object.entries(brief()).map(([k,v])=>k+': '+v).join('\n');
 const cfg=state.aiConfig||defaultAiConfig();
 const factory=state.imageFactory||defaultImageFactory();
 const aiText='\n\nAI CONFIGURATION\nMaster: '+(cfg.master?'ON':'OFF')+'\nText Provider: '+providerLabel(cfg.textProvider)+' ('+cfg.textModel+')\nImage Provider: '+providerLabel(cfg.imageProvider)+' ('+cfg.imageModel+', '+cfg.imageQuality+', '+factory.global.aspectRatio+')\nStages: '+Object.entries(cfg.stages).map(([k,v])=>k+'='+(v?'ON':'OFF')).join(', ')+'\n\n'+($('aiUsagePre')?$('aiUsagePre').textContent:'');
 download('ai-ads-campaign.txt',briefText+aiText,'text/plain');
};
function renderSaved(){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');$('savedList').innerHTML=items.length?items.map(x=>'<div class="saved-card"><div class="saved-meta"><strong>'+esc(x.brief.productName||'Untitled campaign')+'</strong><small>'+esc(x.brief.brandName||'')+' · '+new Date(x.savedAt).toLocaleString()+'</small></div><div class="saved-actions"><button class="secondary loadBtn" data-id="'+x.id+'">Load</button><button class="secondary duplicateBtn" data-id="'+x.id+'">Duplicate</button><button class="secondary danger deleteBtn" data-id="'+x.id+'">Delete</button></div></div>').join(''):'<div class="placeholder">No saved campaigns yet.</div>';document.querySelectorAll('.loadBtn').forEach(btn=>btn.onclick=()=>loadCampaign(Number(btn.dataset.id)));document.querySelectorAll('.duplicateBtn').forEach(btn=>btn.onclick=()=>duplicateCampaign(Number(btn.dataset.id)));document.querySelectorAll('.deleteBtn').forEach(btn=>btn.onclick=()=>deleteCampaign(Number(btn.dataset.id)));}
function duplicateCampaign(id){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');const item=items.find(x=>x.id===id);if(!item)return;const copyBrief={...item.brief,productName:(item.brief.productName||'Untitled campaign')+' (Copy)'};const copyState=item.state?{...item.state,brief:copyBrief}:{brief:copyBrief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:item.state&&item.state.aiConfig||defaultAiConfig(),aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer(),campaign:defaultCampaignStructure(),creativeMatrix:[],imageFactory:defaultImageFactory(),reelFactory:defaultReelFactory(),landingPage:defaultLandingPage(),checklist:defaultChecklist(),performance:defaultPerformance(),optimisation:defaultOptimisation(),promptLibrary:defaultPromptLibrary(),plan90:defaultPlan90()};items.unshift({id:Date.now(),savedAt:new Date().toISOString(),brief:copyBrief,state:copyState});localStorage.setItem('aiAdsCampaigns',JSON.stringify(items.slice(0,50)));renderSaved();$('status').textContent='Campaign duplicated';}
function loadCampaign(id){
 const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');
 const item=items.find(x=>x.id===id);
 if(!item)return;
 fillBrief(item.brief);
 state=item.state||{brief:item.brief,strategy:null,copy:null,creative:null,reels:null,selectedCopy:null,aiMode:false,aiConfig:null,aiUsage:emptyAiUsage(),aiImages:null,audience:defaultAudience(),offer:defaultOffer(),campaign:defaultCampaignStructure(),creativeMatrix:[],imageFactory:defaultImageFactory(),reelFactory:defaultReelFactory(),landingPage:defaultLandingPage(),checklist:defaultChecklist(),performance:defaultPerformance(),optimisation:defaultOptimisation(),promptLibrary:defaultPromptLibrary(),plan90:defaultPlan90()};
 state.aiConfig=state.aiConfig||defaultAiConfig();
 state.aiUsage=state.aiUsage||emptyAiUsage();
 if(state.aiImages===undefined)state.aiImages=null;
 state.audience=Object.assign(defaultAudience(),state.audience||{});
 state.offer=Object.assign(defaultOffer(),state.offer||{});
 state.campaign=Object.assign(defaultCampaignStructure(),state.campaign||{});
 if(!Array.isArray(state.creativeMatrix))state.creativeMatrix=[];
 state.imageFactory=Object.assign(defaultImageFactory(),state.imageFactory||{});
 state.imageFactory.global=Object.assign(defaultImageFactory().global,state.imageFactory.global||{});
 if(!Array.isArray(state.imageFactory.selected))state.imageFactory.selected=[];
 if(!Array.isArray(state.imageFactory.prompts))state.imageFactory.prompts=[];
 state.reelFactory=Object.assign(defaultReelFactory(),state.reelFactory||{});
 if(!Array.isArray(state.reelFactory.selected))state.reelFactory.selected=[];
 if(!Array.isArray(state.reelFactory.shots))state.reelFactory.shots=[];
 state.landingPage=Object.assign(defaultLandingPage(),state.landingPage||{});
 state.checklist=normalizeChecklist(state.checklist);
 state.performance=Object.assign(defaultPerformance(),state.performance||{});
 if(!Array.isArray(state.performance.rows))state.performance.rows=[];
 state.optimisation=Object.assign(defaultOptimisation(),state.optimisation||{});
 if(!Array.isArray(state.optimisation.tests))state.optimisation.tests=[];
 state.promptLibrary=Object.assign(defaultPromptLibrary(),state.promptLibrary||{});
 if(!state.promptLibrary.overrides||typeof state.promptLibrary.overrides!=='object')state.promptLibrary.overrides={};
 if(!Array.isArray(state.promptLibrary.custom))state.promptLibrary.custom=[];
 state.plan90=normalizePlan90(state.plan90);
 applyAiConfigToUI();
 fillAudienceInputs(state.audience);
 renderAudiencePlan();
 renderAudienceMatrix();
 fillOfferInputs(state.offer);
 renderOfferAnalysis();
 $('campaignName').value=state.campaign.name||'';
 $('campaignObjective').value=(state.brief&&state.brief.objective)||item.brief.objective||'';
 $('campaignBudget').value=state.campaign.budget||'';
 $('campaignLocation').value=state.campaign.location||'';
 $('campaignDestination').value=state.campaign.destination||'';
 renderCampaignStructure();
 renderCreativeMatrix();
 fillImageFactoryGlobalInputs();
 renderImageConceptSelect();
 renderImagePrompts();
 renderReelSelect();
 renderReelShotList();
 fillLandingPageInputs();
 renderLandingPageAnalysis();
 renderChecklist();
 renderPerformance();
 renderOptimisationTab();
 renderPromptLibrary();
 renderPlan90();
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
