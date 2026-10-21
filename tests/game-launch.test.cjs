const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const launcher=fs.readFileSync(path.join(root,"games/launch-check.js"),"utf8");
new vm.Script(launcher,{filename:"games/launch-check.js"});
const main=fs.readFileSync(path.join(root,"index.html"),"utf8");
for(const name of ["shapez","openttd","supertuxkart","lazy-chess"]){
  const entry="games/"+name+"/index.html";
  const document=fs.readFileSync(path.join(root,entry),"utf8");
  assert.ok(main.includes(entry),"Home page must launch "+name+" in full-page mode");
  assert.match(document,/launch-check\.js\?v=2/);
  const match=document.match(/data-requires="([^"]+)"/);
  assert.ok(match,"Game must declare its required assets: "+name);
  const assets=match[1].split(",");
  assert.ok(assets.length>=3,"Check key build assets: "+name);
  for(const asset of assets){
    const absolute=path.resolve(root,"games",name,asset);
    assert.ok(absolute.startsWith(root+path.sep),"Game asset escaped repository");
    assert.ok(fs.existsSync(absolute),"Missing "+name+" asset: "+asset);
    assert.ok(fs.statSync(absolute).size>0,"Empty "+name+" asset: "+asset);
  }
}
console.log("All four browser game wrappers pass static file and syntax checks.");
