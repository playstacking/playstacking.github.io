const games=[
{title:"Hextris",category:"Arcade",description:"A lightning-fast hexagonal puzzle built for one-more-run energy.",url:"https://hextris.github.io/hextris/",icon:"⬢",color:"coral",tag:"Fan favorite"},
{title:"2048",category:"Puzzle",description:"Slide, combine, and chase the legendary 2048 tile.",url:"https://play2048.co/",icon:"20",color:"yellow",tag:"Classic"},
{title:"OpenFront",category:"Strategy",description:"Claim territory, forge alliances, and outsmart a live map of rivals.",url:"https://openfront.io/",icon:"◒",color:"blue",tag:"Multiplayer"},
{title:"WorldGuessr",category:"Chill",description:"Drop into a mystery location and use every clue to find where you are.",url:"https://worldguessr.com/",icon:"◎",color:"green",tag:"Explore"},
{title:"Sandspiel",category:"Chill",description:"Paint with sand, water, fire, plants, and delightfully chaotic physics.",url:"https://sandspiel.club/",icon:"≈",color:"pink",tag:"Creative"},
{title:"MK48",category:"Action",description:"Command a warship, collect upgrades, and rule the open sea.",url:"https://mk48.io/",icon:"↯",color:"navy",tag:"Multiplayer"},
{title:"A Dark Room",category:"Strategy",description:"A minimalist text adventure that grows into something much bigger.",url:"https://adarkroom.doublespeakgames.com/",icon:"✦",color:"purple",tag:"Story"},
{title:"Kiomet",category:"Strategy",description:"Capture towers and build a kingdom in a quick real-time strategy battle.",url:"https://kiomet.com/",icon:"♜",color:"coral",tag:"Tactical"},
{title:"TETR.IO",category:"Puzzle",description:"A slick, competitive evolution of the falling-block formula.",url:"https://tetr.io/",icon:"▦",color:"blue",tag:"Competitive"},
{title:"Slow Roads",category:"Chill",description:"An endless scenic drive with no finish line and no pressure.",url:"https://slowroads.io/",icon:"⌁",color:"green",tag:"Relax"},
{title:"Freeciv Web",category:"Strategy",description:"Build a civilization from a tiny settlement to a world power.",url:"https://www.freecivweb.org/",icon:"♟",color:"yellow",tag:"Deep strategy"},
{title:"Lichess",category:"Strategy",description:"Fast, fair, open-source chess against friends, bots, or the world.",url:"https://lichess.org/",icon:"♞",color:"pink",tag:"Open source"}
];
const categories=["All","Arcade","Puzzle","Strategy","Action","Chill"];
let category="All",query="",favorites=JSON.parse(localStorage.getItem("playstack-favorites")||"[]"),favoritesOnly=false;
const $=id=>document.getElementById(id),launch=url=>window.open(url,"_blank","noopener,noreferrer");
function renderFilters(){ $("filters").innerHTML=categories.map(c=>`<button class="${c===category?"active":""}" data-category="${c}">${c}</button>`).join(""); }
function render(){
 const list=games.filter(g=>(category==="All"||g.category===category)&&(`${g.title} ${g.category} ${g.description}`.toLowerCase().includes(query.toLowerCase()))&&(!favoritesOnly||favorites.includes(g.title)));
 $("games").innerHTML=list.map(g=>`<article class="game"><button class="heart ${favorites.includes(g.title)?"saved":""}" data-favorite="${g.title}" aria-label="Favorite ${g.title}">♥</button><button class="art ${g.color}" data-launch="${g.url}" aria-label="Play ${g.title}">${g.icon}</button><div class="details"><span class="meta">${g.category} · ${g.tag}</span><h3>${g.title}</h3><p>${g.description}</p><button class="launch" data-launch="${g.url}">Launch game <span>↗</span></button></div></article>`).join("");
 $("favorite-count").textContent=favorites.length;$("empty").hidden=list.length>0;$("favorites-button").style.textDecoration=favoritesOnly?"underline":"none";
}
document.addEventListener("click",e=>{const categoryButton=e.target.closest("[data-category]");if(categoryButton){category=categoryButton.dataset.category;renderFilters();render()}const favorite=e.target.closest("[data-favorite]");if(favorite){const title=favorite.dataset.favorite;favorites=favorites.includes(title)?favorites.filter(x=>x!==title):[...favorites,title];localStorage.setItem("playstack-favorites",JSON.stringify(favorites));render()}const play=e.target.closest("[data-launch]");if(play)launch(play.dataset.launch)});
$("search").addEventListener("input",e=>{query=e.target.value;render()});$("favorites-button").onclick=()=>{favoritesOnly=!favoritesOnly;render()};$("surprise").onclick=()=>launch(games[Math.floor(Math.random()*games.length)].url);$("reset").onclick=()=>{category="All";query="";favoritesOnly=false;$("search").value="";renderFilters();render()};renderFilters();render();
