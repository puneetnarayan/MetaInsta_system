(function(root){
function shortText(value,max){const s=String(value).trim();return s.length>max?s.slice(0,max-1).trim()+'…':s;}

function buildCampaign(b){
 b=b||{};
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

 const strategy={
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

 const copy=[
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

 const creative=[
  {format:'Single Image Ad',concept:'Show the customer in the exact moment represented by the problem. Headline: “'+shortText(problem,62)+'” Supporting line: “Move toward '+shortText(outcome,58)+'.” Keep the visual simple, mobile-readable and focused on one idea.'},
  {format:'Carousel',concept:'Card 1: recognise the problem. Card 2: describe the real-life situation. Card 3: give one useful insight. Card 4: introduce '+product+'. Card 5: show '+(offer||'the offer')+' and a clear CTA.'},
  {format:'Instagram Story',concept:'Frame 1: a direct question about the problem. Frame 2: mirror the customer situation. Frame 3: give one practical insight. Frame 4: introduce '+product+'. Frame 5: show '+(offer||'the offer')+' and '+cta+'.'},
  {format:'Instagram Reel',concept:'20–30 seconds: open with the problem in the first 2 seconds; show a recognisable real-life moment; give one useful insight; introduce '+product+'; show the desired outcome; finish with '+cta+'.'}
 ];

 const reels=[
  {title:'Reel 1 · Problem to solution',hook:'Ever '+p.toLowerCase()+'?',angle:'Problem-led',duration:'30',scenes:[
   '0–3s — On-screen hook: “'+shortText(problem,70)+'”',
   '3–8s — Show a realistic situation where the customer experiences the problem.',
   '8–15s — Voiceover: explain why the situation feels difficult without blaming the customer.',
   '15–23s — Introduce '+product+' as a practical next step toward '+o+'.',
   '23–30s — Show '+(offer||'the offer')+' and CTA: '+cta+'.'
  ],voiceover:'Ever '+p.toLowerCase()+'? You are not alone — and it does not have to stay that way. '+product+' gives '+aud+' a practical next step toward '+o.toLowerCase()+'. '+(offer?offer+'. ':'')+cta+'.',onScreenText:shortText(problem,70),cameraDirection:'Static or handheld phone-style shot for the opening scene; cut to a simple product/offer end card for the CTA.',bRoll:'Real-life clips of the problem moment (e.g. hesitation, searching for words, a missed opportunity).',cta,caption:'Still '+p.toLowerCase()+' 👀 '+product+' — '+(offer||'')+' '+cta+'.'},
  {title:'Reel 2 · Outcome-led',hook:'Imagine being able to '+o.toLowerCase()+'.',angle:'Outcome-led',duration:'30',scenes:[
   '0–3s — Show the desired outcome immediately.',
   '3–8s — Contrast it with the current frustration: '+shortText(problem,80)+'.',
   '8–16s — Give one useful tip or insight relevant to '+aud+'.',
   '16–24s — Introduce '+product+' and explain its practical role.',
   '24–30s — Show '+(offer||'the offer')+' and CTA: '+cta+'.'
  ],voiceover:'Imagine being able to '+o.toLowerCase()+'. For '+aud+', the gap is usually not effort — it is a clear next step. '+product+' helps you work toward that outcome. '+(offer?offer+'. ':'')+cta+'.',onScreenText:shortText(outcome,70),cameraDirection:'Open on the outcome (confident, resolved moment), then cut back to the contrast/problem, then to a clean end card.',bRoll:'Before/after style clips contrasting the frustration with the desired outcome.',cta,caption:'Imagine '+o.toLowerCase()+' 🙌 '+product+' — '+(offer||'')+' '+cta+'.'},
  {title:'Reel 3 · Question format',hook:'Do you '+p.toLowerCase()+'?',angle:'Question',duration:'30',scenes:[
   '0–3s — Put the question on screen and pause for recognition.',
   '3–9s — Show a relatable example from the customer’s daily life.',
   '9–17s — Give one practical shift the viewer can try.',
   '17–25s — Present '+product+' as the next step for '+aud+'.',
   '25–30s — End with '+(offer||'the offer')+' and CTA: '+cta+'.'
  ],voiceover:'Quick question — do you '+p.toLowerCase()+'? If that sounds familiar, '+product+' was built for '+aud+'. It is a focused next step toward '+o.toLowerCase()+'. '+(offer?offer+'. ':'')+cta+'.',onScreenText:'Do you '+p.toLowerCase()+'?',cameraDirection:'Direct-to-camera delivery for the question, then a quick relatable cutaway scene, ending on a simple end card.',bRoll:'A short relatable daily-life clip that mirrors the audience’s situation.',cta,caption:'Quick question for '+aud+' 👇 '+product+' — '+(offer||'')+' '+cta+'.'}
 ];

 return {strategy,copy,creative,reels};
}

const CampaignGenerator={buildCampaign,shortText};
if(typeof module!=='undefined'&&module.exports){
 module.exports=CampaignGenerator;
}else{
 root.CampaignGenerator=CampaignGenerator;
}
})(typeof window!=='undefined'?window:globalThis);
