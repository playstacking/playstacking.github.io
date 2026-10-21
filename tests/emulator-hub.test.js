const fs = require("node:fs");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const app = fs.readFileSync("app.js", "utf8");
new vm.Script(app, { filename:"app.js" });
const index = fs.readFileSync("index.html", "utf8");
assert.match(index, /id="game-count"/);
const hub = fs.readFileSync("games/emulators/index.html", "utf8");
const inline = hub.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(inline, "Hub needs launcher script");
new vm.Script(inline[1], { filename:"games/emulators/index.html" });
for (const platform of ["n64","nds","gba","psx","psp","snes","nes"]) {
  assert.ok(app.includes("games/emulators/index.html?system="+platform), "Missing game card: "+platform);
  assert.ok(hub.includes(platform+":{"), "Missing emulator config: "+platform);
}
assert.match(hub, /cdn\.emulatorjs\.org\/stable\/data\//);
for (const path of ["games/shapez-build/index.html","games/openttd-build/openttd.wasm","games/supertuxkart-build/game/supertuxkart.wasm","games/n64-loader/index.html"]) {
  assert.ok(fs.statSync(path).size > 0, "Missing build asset: "+path);
}
console.log("Emulator hub smoke checks passed. These do not verify gameplay.");
