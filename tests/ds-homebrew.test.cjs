const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const app=fs.readFileSync("app.js","utf8");
new vm.Script(app);
const hub=fs.readFileSync("games/emulators/index.html","utf8");
const scripts=hub.match(/<script>([\s\S]*?)<\/script>/g);
assert.ok(scripts&&scripts.length===1);
new vm.Script(scripts[0].replace(/^<script>|<\/script>$/g,""));
for(const [id,filename] of [["pong","pong-nds.nds"],["wordle","wordle-ds.nds"]]){
  assert.ok(hub.includes(id+':{name:'),"Hub lacks curated game: "+id);
  assert.ok(hub.includes(filename),"Hub lacks game path "+filename);
  assert.ok(app.includes("games/emulators/index.html?system=nds&game="+id),"Missing library card: "+id);
  assert.ok(fs.readFileSync("index.html","utf8").includes("game="+id),"Missing static homepage link");
}
const workflow=fs.readFileSync(".github/workflows/install-ds-homebrew.yml","utf8");
assert.ok(workflow.includes("WordleDS.nds"));
assert.ok(workflow.includes("Pong-NDS.nds"));
assert.ok(workflow.includes("cdbf18af105abfb00c699cff1b95de48d781468a3b52aeb3bb5a431e603b7075"));
console.log("Curated DS homebrew integration static checks passed. Gameplay not yet verified.");
