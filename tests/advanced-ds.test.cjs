const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
new vm.Script(app);
const hub=fs.readFileSync('games/emulators/index.html','utf8');
const match=hub.match(/<script>([\s\S]+?)<\/script>/);
assert.ok(match, 'Expected emulator launcher code');
new vm.Script(match[1]);
for(const [name,game] of [['Kart Mania','kart'],['Spelunky DS','spelunky']]){
  const uri='games/emulators/index.html?system=nds&game='+game;
  assert.ok(app.includes(uri),'Missing library game card for '+name);
  assert.ok(fs.readFileSync('index.html','utf8').includes('game='+game),'Missing home link for '+name);
  assert.ok(hub.includes(game+':{name:'),'Missing game in emulator hub: '+name);
}
const installer=fs.readFileSync('.github/workflows/install-advanced-ds-games.yml','utf8');
assert.ok(installer.includes('docker run')&&installer.includes('devkitpro/devkitarm'));
assert.ok(installer.includes('SpelunkyDS-Full-License.txt'));
console.log('Advanced DS launcher references and source install pipeline check passed (gameplay not yet tested)');
