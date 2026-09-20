const test=require('node:test');
const assert=require('node:assert/strict');
const {buildCampaign,shortText}=require('../js/campaign-generator.js');

const sampleBrief={
 brandName:'Coach Sapna Narayan',
 productName:'Speak in Meetings Workshop',
 objective:'Lead Generation',
 location:'India',
 targetCustomer:'Working professionals who hesitate to speak in English at work',
 ageRange:'25–45',
 offer:'₹997',
 problem:'I know what I want to say, but I hesitate.',
 outcome:'Speak naturally and confidently in meetings.',
 tone:'Professional + Friendly'
};

test('buildCampaign returns the full expected shape',()=>{
 const result=buildCampaign(sampleBrief);
 assert.ok(result.strategy);
 assert.equal(result.copy.length,3);
 assert.equal(result.creative.length,4);
 assert.equal(result.reels.length,3);
 for(const ad of result.copy){
  for(const key of ['name','hook','primaryText','headline','description','cta']) assert.ok(key in ad,`copy is missing ${key}`);
 }
 for(const reel of result.reels){
  assert.ok(Array.isArray(reel.scenes)&&reel.scenes.length>0);
 }
});

test('buildCampaign incorporates brief fields into the output',()=>{
 const result=buildCampaign(sampleBrief);
 assert.ok(result.strategy.audience.includes('Working professionals who hesitate to speak in English at work'));
 assert.ok(result.strategy.audience.includes('25–45'));
 assert.ok(result.strategy.audience.includes('India'));
 assert.equal(result.strategy.tone,'Professional + Friendly');
 assert.ok(result.copy.some(ad=>ad.primaryText.includes('₹997')));
});

test('objective controls the CTA used across the campaign',()=>{
 const sales=buildCampaign({...sampleBrief,objective:'Sales'});
 assert.ok(sales.copy.every(ad=>ad.cta==='Shop Now'));
 const whatsapp=buildCampaign({...sampleBrief,objective:'WhatsApp Leads'});
 assert.ok(whatsapp.copy.every(ad=>ad.cta==='Send Message'));
 const leadGen=buildCampaign({...sampleBrief,objective:'Lead Generation'});
 assert.ok(leadGen.copy.every(ad=>ad.cta==='Learn More'));
});

test('buildCampaign falls back to generic placeholders when the brief is empty',()=>{
 const result=buildCampaign({});
 assert.ok(result.strategy.audience.includes('your ideal customer'));
 assert.ok(result.copy[0].primaryText.includes('a frustrating problem'));
 assert.ok(result.copy.every(ad=>ad.cta==='Learn More'));
});

test('shortText leaves short strings untouched',()=>{
 assert.equal(shortText('hello',20),'hello');
});

test('shortText truncates long strings with an ellipsis and respects max length',()=>{
 const long='a'.repeat(200);
 const out=shortText(long,50);
 assert.ok(out.length<=50);
 assert.ok(out.endsWith('…'));
});
