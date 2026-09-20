const ids=['brandName','productName','productDescription','objective','location','targetCustomer','ageRange','offer','budget','problem','outcome','tone','landingPage'];const $=id=>document.getElementById(id);
let state={brief:{},strategy:null,copy:null,creative:null,reels:null};

function brief(){return Object.fromEntries(ids.map(id=>[id,$(id).value.trim()]));}
function showTab(name){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===name));if(name==='saved')renderSaved();if(name==='export')renderPreview();}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

function generateDemo(){
 const b=state.brief;
 state.strategy={objective:b.objective,audience:b.targetCustomer,positioning:b.productName+' helps '+b.targetCustomer+' move from '+(b.problem||'a current challenge')+' to '+(b.outcome||'a clear desired result'),message:'Lead with the customer problem, show the transformation, then present the offer and a simple CTA.',testing:['Problem-led message','Outcome-led message','Question-led hook']};
 state.copy=[1,2,3].map((n)=>({name:'Ad '+n,hook:n===1?'Still struggling with '+(b.problem||'this problem')+'?':n===2?'Imagine achieving '+(b.outcome||'your desired result')+'.': 'What would change if you could solve this today?',primaryText:'If you are a '+(b.targetCustomer||'customer')+', '+(b.productName||'this solution')+' is designed to help you '+(b.outcome||'reach your goal')+'. '+(b.offer||'Learn more today')+'.',headline:b.productName||'Discover the difference',description:b.offer||'Learn more',cta:'Learn More'}));
 state.creative=[['Image Ad','Clean single-image concept focused on the core customer problem and transformation.'],['Carousel','Card 1 problem → Card 2 insight → Card 3 solution → Card 4 offer → Card 5 CTA.'],['Instagram Story','9:16 sequence with a strong first-frame hook, short proof point and CTA.'],['Instagram Reel','15–30 second vertical video showing problem → turning point → solution → CTA.']].map(x=>({format:x[0],concept:x[1]}));
 state.reels=[1,2,3].map(n=>({title:'Reel '+n,hook:n===1?'Stop translating in your head before you speak.':n===2?'One small change can make your message clearer.':'What if your next meeting felt easier?',scenes:['Hook in first 2 seconds','Show the customer problem','Introduce '+b.productName,'Show desired outcome','CTA: Learn More']}));
 renderResults();
}
function renderResults(){
 $('strategyResult').innerHTML='<h3>Demo strategy generated</h3><div class="result-grid">'+Object.entries(state.strategy).map(([k,v])=>'<div class="result-card"><strong>'+esc(k)+'</strong><p>'+esc(Array.isArray(v)?v.join(' • '):v)+'</p></div>').join('')+'</div><small class="demo-badge">DEMO MODE — Claude API not connected</small>';
 document.getElementById('copy').innerHTML='<h2>Ad Copy</h2><div class="ad-list">'+state.copy.map(a=>'<article class="ad-card"><h3>'+esc(a.name)+'</h3><p><b>Hook:</b> '+esc(a.hook)+'</p><p><b>Primary Text:</b> '+esc(a.primaryText)+'</p><p><b>Headline:</b> '+esc(a.headline)+'</p><p><b>CTA:</b> '+esc(a.cta)+'</p><button class="secondary copyBtn">Copy Ad</button></article>').join('')+'</div><small class="demo-badge">DEMO MODE — sample output</small>';
 document.querySelectorAll('.copyBtn').forEach((btn,i)=>btn.onclick=()=>navigator.clipboard.writeText(Object.entries(state.copy[i]).map(([k,v])=>k+': '+v).join('\n')));
 document.getElementById('creative').innerHTML='<h2>Creative Ideas</h2><div class="cards">'+state.creative.map(x=>'<article><h3>'+esc(x.format)+'</h3><p>'+esc(x.concept)+'</p></article>').join('')+'</div><small class="demo-badge">DEMO MODE — sample concepts</small>';
 document.getElementById('reels').innerHTML='<h2>Reel Scripts</h2><div class="ad-list">'+state.reels.map(r=>'<article class="ad-card"><h3>'+esc(r.title)+'</h3><p><b>Hook:</b> '+esc(r.hook)+'</p><p><b>Scenes:</b> '+esc(r.scenes.join(' → '))+'</p></article>').join('')+'</div><small class="demo-badge">DEMO MODE — sample scripts</small>';
}
$('generate').onclick=()=>{state.brief=brief();if(!state.brief.brandName||!state.brief.productName||!state.brief.targetCustomer){$('status').textContent='Enter brand, product/service and target customer.';return;}generateDemo();$('status').textContent='Demo campaign generated';showTab('strategy');};
$('save').onclick=()=>{const b=brief();if(!b.productName){$('status').textContent='Enter a product/service first.';return;}const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');items.unshift({id:Date.now(),savedAt:new Date().toISOString(),brief:b});localStorage.setItem('aiAdsCampaigns',JSON.stringify(items.slice(0,50)));$('status').textContent='Campaign saved';};
$('exportJson').onclick=()=>download('ai-ads-campaign.json',JSON.stringify(state,null,2),'application/json');
$('exportText').onclick=()=>download('ai-ads-campaign.txt',Object.entries(brief()).map(([k,v])=>k+': '+v).join('\n'),'text/plain');
function renderSaved(){const items=JSON.parse(localStorage.getItem('aiAdsCampaigns')||'[]');$('savedList').innerHTML=items.length?items.map(x=>'<div class="placeholder" style="margin:8px 0"><strong>'+esc(x.brief.productName)+'</strong><br><small>'+new Date(x.savedAt).toLocaleString()+'</small></div>').join(''):'<div class="placeholder">No saved campaigns yet.</div>';}
function renderPreview(){$('preview').textContent=JSON.stringify(state,null,2);}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}