const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const read = p => fs.readFileSync(p,"utf8");
const exists = p => assert.ok(fs.statSync(p).size > 0, "Missing or empty: " + p);

const app=read("app.js");
new vm.Script(app,{filename:"app.js"});
const homepage=read("index.html");
for(const entry of ["shapez","openttd","supertuxkart","lazy-chess"]){
  assert.ok(homepage.includes('"games/'+entry+'/index.html"'), "Homepage should route games to full-page launchers: "+entry);
}
assert.ok(homepage.includes('games/emulators/index.html?system=nds'),"Emulators must remain linked on homepage");
for(const [entry,target] of [
  ["shapez","shapez-build"],
  ["openttd","openttd-build"],
  ["supertuxkart","supertuxkart-build"],
  ["lazy-chess","lazy-chess-build"]]){
  const page=read("games/"+entry+"/index.html");
  assert.ok(page.includes('href="../'+target+'/index.html"') || page.includes('data-game-entry="../'+target+'/index.html"'),"Missing playable link: "+entry);
  exists("games/"+target+"/index.html");
}
const chess=read("games/lazy-chess-build/index.html");
assert.ok(!chess.includes('<script src="cordova.js">'),"Unused Cordova asset should be removed");
for(const name of ["main.js","vendor.js","polyfills.js","main.css"]) exists("games/lazy-chess-build/build/"+name);
exists("games/lazy-chess-build/assets/stockfish.js");
for(const name of ["openttd.wasm","openttd.data","openttd.js"])exists("games/openttd-build/"+name);
for(const name of ["bundle.js","main.css","async-resources.css"])exists("games/shapez-build/"+name);
exists("games/shapez-build/res/fonts/GameFont.woff2");
for(const name of ["script.js","config.json","game/supertuxkart.js","game/supertuxkart.wasm"])exists("games/supertuxkart-build/"+name);
const script=read("games/supertuxkart-build/script.js");
assert.ok(script.includes("Incomplete asset download")&&script.includes("Game failed to load:"),"Missing SuperTuxKart error handling");
const manifest=read("games/supertuxkart-build/game/data_low.tar.gz.manifest").trim().split(/\r?\n/);
const expected=Number(manifest.shift());
let size=0;
for(const chunk of manifest){
  assert.match(chunk,/^data_low\.tar\.gz\.\d+$/);
  const path="games/supertuxkart-build/game/"+chunk;
  exists(path);
  size+=fs.statSync(path).size;
}
assert.equal(size,expected,"SuperTuxKart game asset manifest size mismatch");
console.log("Game build/launcher asset smoke checks passed. Browser gameplay still needs testing.");
