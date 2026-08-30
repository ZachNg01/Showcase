const SHEET_CSV="https://docs.google.com/spreadsheets/d/1ydtjVh-7CiVkD9uhb2DTKh848-U9QkVXh_AcsqvW7DA/gviz/tq?tqx=out:csv&gid=0";
const COVER_BY_GOODREADS_ID={
  "223001257":"https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1735235942i/223001257.jpg",
  "199698485":"https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1717970538i/199698485.jpg",
  "1618":"https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1479863624i/1618.jpg",
  "45895362":"https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1566270729i/45895362.jpg"
};
const SHEET_SNAPSHOT=[
  {
    goodreadsUrl:"https://www.goodreads.com/en/book/show/223001257-the-correspondent",
    title:"The Correspondent",
    author:"Virginia Evans",
    synopsis:"Filled with knowledge that only comes from a life fully lived, The Correspondent is a novel about finding solace in literature and connection with people we might never meet. Sybil Van Antwerp has used letters throughout her life to make sense of the world and her place in it. When someone from her past forces her to examine one of the most painful periods of her life, she must find it in her heart to offer forgiveness.",
    cover:COVER_BY_GOODREADS_ID["223001257"]
  },
  {
    goodreadsUrl:"https://www.goodreads.com/book/show/199698485-the-god-of-the-woods?from_search=true&from_srp=true&qid=fj1WPdAlXr&rank=1",
    title:"The God of the Woods",
    author:"Liz Moore",
    synopsis:"When thirteen-year-old Barbara Van Laar vanishes from her Adirondack summer camp in August 1975, a panicked search begins. Barbara is the daughter of the family that owns the camp, and her older brother disappeared fourteen years earlier. The search uncovers the layered secrets of the Van Laar family and the blue-collar community living in its shadow.",
    cover:COVER_BY_GOODREADS_ID["199698485"]
  },
  {
    goodreadsUrl:"https://www.goodreads.com/book/show/1618.The_Curious_Incident_of_the_Dog_in_the_Night_Time?ref=nav_sb_ss_1_49",
    title:"The Curious Incident of the Dog in the Night-Time",
    author:"Mark Haddon",
    synopsis:"Christopher John Francis Boone knows every country and capital and every prime number up to 7,057. He relates well to animals but struggles to understand human emotions. His investigation into the suspicious death of a neighbourhood dog becomes an unusual and captivating journey.",
    cover:COVER_BY_GOODREADS_ID["1618"]
  },
  {
    goodreadsUrl:"https://www.goodreads.com/book/show/45895362-how-much-of-these-hills-is-gold",
    title:"How Much of These Hills Is Gold",
    author:"C Pam Zhang",
    synopsis:"Set against the twilight of the American gold rush, two newly orphaned children of immigrants flee their western mining town to bury their father. Their journey through an unforgiving landscape becomes a haunting story about family, memory, race, survival, and the yearning for a place to call home.",
    cover:COVER_BY_GOODREADS_ID["45895362"]
  }
];
const fallback=SHEET_SNAPSHOT[0];
let books=[...SHEET_SNAPSHOT],selected=0;
function parseCSV(text){const rows=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===","&&!quoted){row.push(cell);cell=""}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell);cell="";if(row.some(Boolean))rows.push(row);row=[]}else cell+=c}row.push(cell);if(row.some(Boolean))rows.push(row);return rows}
function coverURL(value=""){return value.match(/https:\/\/m\.media-amazon\.com\/[^"')\s<]+\.jpg/i)?.[0]||""}
function coverFromGoodreads(url=""){const id=url.match(/(?:show\/|show\/\d+\.|book\/show\/)(\d+)/i)?.[1]||url.match(/(\d{3,})/)?.[1];return COVER_BY_GOODREADS_ID[id]||""}
function drawBook(index){selected=index;const b=books[index];document.querySelector("#result-number").textContent=String(index+1).padStart(2,"0");document.querySelector("#result-title").textContent=b.title;document.querySelector("#result-author").textContent="by "+b.author;document.querySelector("#result-synopsis").textContent=b.synopsis;const img=document.querySelector("#result-image");img.src=b.cover||fallback.cover;img.alt=b.title+" by "+b.author;const link=document.querySelector("#goodreads-link");link.href=b.goodreadsUrl||"#";link.hidden=!b.goodreadsUrl}
function render(){const first=books[0];document.querySelector("#monthly-title").textContent=first.title;document.querySelector("#monthly-author").textContent=first.author;document.querySelector("#monthly-synopsis").textContent="“"+first.synopsis.slice(0,180)+(first.synopsis.length>180?"…":"")+"”";const cover=document.querySelector("#monthly-cover");cover.src=first.cover||fallback.cover;cover.alt=first.title+" by "+first.author;const list=document.querySelector("#book-list");list.innerHTML="";books.slice(0,5).forEach((b,i)=>{const button=document.createElement("button");button.innerHTML='<span>'+String(i+1).padStart(2,"0")+'</span><strong>'+b.title+'</strong><em>'+b.author+'</em><b>↗</b>';button.addEventListener("click",()=>{drawBook(i);document.querySelector("#selector").scrollIntoView({behavior:"smooth"})});list.appendChild(button)});drawBook(0)}
async function fetchBooks(){try{const response=await fetch(SHEET_CSV);if(!response.ok)throw Error();const rows=parseCSV(await response.text()),headers=rows.shift().map(v=>v.trim());const loaded=rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]||""]))).filter(r=>r.Title&&r.Author).map(r=>({goodreadsUrl:r["Goodreads URL"],title:r.Title,author:r.Author,synopsis:r.Synopsis.replace(/<br\s*\/?\s*>/gi,"\n").trim(),cover:coverURL(r.Cover)||coverFromGoodreads(r["Goodreads URL"])}));if(loaded.length)books=loaded;return true}catch{return false}}
function renderFullLibrary(){const list=document.querySelector("#full-book-list");list.innerHTML="";books.forEach((b,i)=>{const card=document.createElement("details");card.className="library-card";card.innerHTML='<summary><span>'+String(i+1).padStart(2,"0")+'</span><div><p>'+b.author+'</p><h2>'+b.title+'</h2></div><b>＋</b></summary><div class="library-card-body"><img src="'+(b.cover||fallback.cover)+'" alt="'+b.title+' book cover"><div><p class="synopsis">'+b.synopsis+'</p>'+(b.goodreadsUrl?'<a class="text-link" href="'+b.goodreadsUrl+'" target="_blank" rel="noreferrer">View on Goodreads ↗</a>':'')+'</div></div>';list.appendChild(card)});document.querySelector("#library-status").textContent=books.length+" title"+(books.length===1?"":"s")+" synced from Lauren’s shelf"}
function setupMenu(){const toggle=document.querySelector(".menu-toggle"),menu=document.querySelector(".navlinks");if(!toggle||!menu)return;toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));toggle.setAttribute("aria-label",open?"Open navigation":"Close navigation");menu.classList.toggle("is-open",!open);document.body.classList.toggle("menu-open",!open)});menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","Open navigation");menu.classList.remove("is-open");document.body.classList.remove("menu-open")}))}
async function start(){setupMenu();const hasBooks=document.querySelector("#full-book-list"),hasHome=document.querySelector("#random-button");if(!hasBooks&&!hasHome)return;const loaded=await fetchBooks();if(hasBooks){renderFullLibrary();if(!loaded)document.querySelector("#library-status").textContent="Showing the saved reading list";return}const status=document.querySelector("#sync-status");if(status)status.textContent=loaded?books.length+" book"+(books.length===1?"":"s")+" synced · Showing the latest five":"Showing the saved reading list";render();const random=document.querySelector("#random-button");if(random)random.addEventListener("click",function(){this.disabled=true;this.querySelector("span").textContent="Finding your next story…";let ticks=0,total=18+Math.floor(Math.random()*8),target=Math.floor(Math.random()*books.length);const timer=setInterval(()=>{drawBook((selected+1)%books.length);if(++ticks>=total){clearInterval(timer);drawBook(target);this.disabled=false;this.querySelector("span").textContent="Pick a random book"}},110)})}
start();
