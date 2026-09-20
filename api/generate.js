export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const key=process.env.OPENAI_API_KEY;
    if(!key) return res.status(503).json({error:'OPENAI_API_KEY is not configured on Vercel.'});
    const brief=req.body||{};
    const prompt=`You are the AI engine for AI Ads Studio, a professional Facebook and Instagram campaign planning tool.

Create a practical, specific campaign from the user's brief. Do not invent testimonials, guarantees, statistics, certifications, outcomes, scarcity, or proof that the brief does not provide. Keep claims supportable. Produce materially different ad angles.

REFERENCE QUALITY:
- Understand the customer problem in the customer's own words.
- Strategy should connect audience -> problem -> desired outcome -> positioning -> message -> funnel -> testing.
- Ad copy should have distinct problem-led, outcome-led and conversational angles.
- Creative ideas should include format, visual direction, on-image text and CTA.
- Reel scripts should include hook, timed scenes, spoken/onscreen direction and CTA.
- Keep the selected tone and campaign objective.

USER BRIEF:
${JSON.stringify(brief,null,2)}

Return ONLY valid JSON matching the requested schema.`;

    const schema={
      type:'object',
      additionalProperties:false,
      properties:{
        strategy:{type:'object',additionalProperties:false,properties:{
          objective:{type:'string'},audience:{type:'string'},corePain:{type:'string'},desiredOutcome:{type:'string'},
          positioning:{type:'string'},keyMessage:{type:'string'},funnelAngle:{type:'string'},
          testing:{type:'array',items:{type:'string'}}
        },required:['objective','audience','corePain','desiredOutcome','positioning','keyMessage','funnelAngle','testing']},
        copy:{type:'array',items:{type:'object',additionalProperties:false,properties:{
          name:{type:'string'},hook:{type:'string'},primaryText:{type:'string'},headline:{type:'string'},description:{type:'string'},cta:{type:'string'}
        },required:['name','hook','primaryText','headline','description','cta']}},
        creative:{type:'array',items:{type:'object',additionalProperties:false,properties:{
          format:{type:'string'},concept:{type:'string'}
        },required:['format','concept']}},
        reels:{type:'array',items:{type:'object',additionalProperties:false,properties:{
          title:{type:'string'},hook:{type:'string'},scenes:{type:'array',items:{type:'string'}}
        },required:['title','hook','scenes']}}
      },
      required:['strategy','copy','creative','reels']
    };

    const response=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization:`Bearer ${key}`'},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||'gpt-5.6-luna',
        reasoning:{effort:'low'},
        instructions:'Return concise but useful marketing content. Never include markdown fences around JSON.',
        input:prompt,
        text:{format:{type:'json_schema',name:'ai_ads_campaign',strict:true,schema}}
      })
    });
    const data=await response.json();
    if(!response.ok) return res.status(response.status).json({error:data.error?.message||'OpenAI request failed.'});
    let text=data.output_text;
    if(!text && data.output) text=data.output.flatMap(x=>x.content||[]).map(x=>x.text||'').join('');
    const result=JSON.parse(text);
    return res.status(200).json(result);
  }catch(err){
    return res.status(500).json({error:err.message||'Generation failed.'});
  }
}