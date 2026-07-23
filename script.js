
const ids=x=>document.getElementById(x);
const face=ids("face"),msg=ids("message"),dbv=ids("dbValue"),bar=ids("meterBar");
const sw=ids("settingWindow");
const defaults={good:55,warn:65,danger:75};
let cfg=JSON.parse(localStorage.getItem("noiseCfg")||"null")||defaults;
goodValue.value=cfg.good;warnValue.value=cfg.warn;dangerValue.value=cfg.danger;
saveButton.onclick=()=>{cfg={good:+goodValue.value,warn:+warnValue.value,danger:+dangerValue.value};localStorage.setItem("noiseCfg",JSON.stringify(cfg));sw.classList.add("hidden");};
settingButton.onclick=()=>sw.classList.remove("hidden");
closeButton.onclick=()=>sw.classList.add("hidden");
fullscreenButton.onclick=()=>document.documentElement.requestFullscreen?.();
let started=false;
startButton.onclick=async()=>{
 if(started)return;
 started=true;
 const stream=await navigator.mediaDevices.getUserMedia({audio:true});
 const ctx=new AudioContext();
 const src=ctx.createMediaStreamSource(stream);
 const analyser=ctx.createAnalyser();
 analyser.fftSize=2048;
 src.connect(analyser);
 const data=new Uint8Array(analyser.fftSize);
 const hist=[];
 function loop(){
   analyser.getByteTimeDomainData(data);
   let sum=0;
   for(let i=0;i<data.length;i++){let v=(data[i]-128)/128;sum+=v*v;}
   const rms=Math.sqrt(sum/data.length);
   let db=Math.max(0,Math.min(100,Math.round(20*Math.log10(rms+1e-4)+100)));
   hist.push(db); if(hist.length>30)hist.shift();
   const avg=hist.reduce((a,b)=>a+b,0)/hist.length;
   dbv.textContent=Math.round(avg);
   bar.style.width=Math.min(avg,100)+"%";
   let c="good",f="😊",m="とてもよいです！",col="#2ecc71";
   if(avg>cfg.danger){c="bad";f="😱";m="アウトー！！！！";col="#e74c3c";}
   else if(avg>cfg.warn){c="danger";f="😟";m="そろそろ注意！！";col="#f39c12";}
   else if(avg>cfg.good){c="warn";f="😐";m="ちょっと声が大きいかな？";col="#f1c40f";}
   document.body.className=c;
   face.textContent=f;msg.textContent=m;bar.style.background=col;
   requestAnimationFrame(loop);
 }
 loop();
};
