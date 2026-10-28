const {chromium}=require('playwright');const fs=require('fs');(async()=>{const tl=JSON.parse(fs.readFileSync('tl.json'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file:///home/user/fitmate-marketing/canaux/social/meta-campagne/video/reel.html');await p.waitForTimeout(500);
await p.evaluate(tl=>{window.TL=tl},tl);fs.mkdirSync('fr',{recursive:true});
const n=Math.round(tl.fin*30);for(let i=0;i<n;i++){await p.evaluate(t=>render(t),i/30);await p.screenshot({path:`fr/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
await b.close()})();
