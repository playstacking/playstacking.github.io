"use strict";
(function () {
  const button=document.querySelector("[data-game-entry]");
  const status=document.getElementById("status");
  if(!button||!status)return;
  const entry=button.getAttribute("data-game-entry");
  const required=(button.getAttribute("data-requires")||"").split(",").map(s=>s.trim()).filter(Boolean);
  const readyText=button.getAttribute("data-ready-text")||"Loading game in full browser page…";
  button.addEventListener("click",async()=>{
    button.disabled=true;
    status.textContent="Checking required game files…";
    try{
      for(const file of required){
        const asset=new URL(file,document.baseURI);
        const response=await fetch(asset.href,{method:"HEAD",cache:"no-store"});
        if(!response.ok)throw new Error(file+" (HTTP "+response.status+")");
      }
      status.textContent=readyText;
      // Full-page launch avoids losing keyboard/gamepad focus in a nested iframe
      // and gives high-memory WASM titles the largest available canvas.
      window.location.assign(new URL(entry,document.baseURI).href);
    }catch(error){
      status.textContent="Could not verify a required game file: "+error.message+". Try the direct build link below, or report this error.";
      button.disabled=false;
    }
  });
})();