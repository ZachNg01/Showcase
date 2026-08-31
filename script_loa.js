const SHEET_ID = "1ydtjVh-7CiVkD9uhb2DTKh848-U9QkVXh_AcsqvW7DA";
const SHEET_GID = "0";
const SHEET_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
const SHEET_XLSX = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx&gid=${SHEET_GID}`;

let books = [];
let selected = 0;

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function coverURL(value = "") {
  const direct = value.match(/https:\/\/m\.media-amazon\.com\/[^"'\)\s<>]+\.jpg/i)?.[0];
  return direct || "";
}

function goodreadsId(value = "") {
  return value.match(/(?:book\/show\/|\/show\/)(\d+)/i)?.[1] ||
    value.match(/i\/(\d+)\.jpg/i)?.[1] || "";
}

async function fetchCoverFormulas() {
  const response = await fetch(SHEET_XLSX, { cache: "no-store" });
  if (!response.ok) throw new Error("Spreadsheet download failed");
  const files = fflate.unzipSync(new Uint8Array(await response.arrayBuffer()));
  const sheetFile = files["xl/worksheets/sheet1.xml"];
  if (!sheetFile) return new Map();

  const coversByBookId = new Map();
  const sheetXml = fflate.strFromU8(sheetFile);
  sheetXml.match(/https:\/\/m\.media-amazon\.com\/[^&"'\)\s<>]+\.jpg/gi)?.forEach(url => {
    const bookId = goodreadsId(url);
    if (url && bookId) coversByBookId.set(bookId, url);
  });
  return coversByBookId;
}

function genresFor(book) {
  return [...new Set((book.genre || "").split(",").map(item => item.trim()).filter(Boolean))];
}

async function fetchBooks() {
  try {
    const [response, coversByBookId] = await Promise.all([
      fetch(SHEET_CSV, { cache: "no-store" }),
      fetchCoverFormulas()
    ]);
    if (!response.ok) throw new Error("Sheet request failed");
    const rows = parseCSV(await response.text());
    const headers = rows.shift().map(value => value.trim());
    const seenBooks = new Set();
    const loaded = rows
      .map(values => ({ values: Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])) }))
      .filter(row => row.values.Title && row.values.Author)
      .filter(({ values: row }) => {
        const key = goodreadsId(row["Goodreads URL"]) || `${row.Title}|${row.Author}`.toLocaleLowerCase();
        if (seenBooks.has(key)) return false;
        seenBooks.add(key);
        return true;
      })
      .map(({ values: row }) => ({
        goodreadsUrl: row["Goodreads URL"],
        title: row.Title.trim(),
        author: row.Author.trim(),
        synopsis: (row.Synopsis || "").replace(/<br\s*\/?\s*>/gi, "\n").trim(),
        genre: (row.Genre || "").trim(),
        cover: coverURL(row.Cover) || coversByBookId.get(goodreadsId(row["Goodreads URL"])) || ""
      }));
    if (!loaded.length) throw new Error("No book rows found");
    books = loaded;
    return true;
  } catch (error) {
    console.error("Could not load the Google Sheet:", error);
    books = [];
    return false;
  }
}

function setImage(image, book) {
  image.src = book.cover;
  image.alt = book.title + " by " + book.author + " book cover";
  image.hidden = !book.cover;
}

function drawBook(index) {
  selected = index;
  const book = books[index];
  document.querySelector("#result-number").textContent = String(index + 1).padStart(2, "0");
  document.querySelector("#result-title").textContent = book.title;
  document.querySelector("#result-author").textContent = "by " + book.author;
  document.querySelector("#result-genre").textContent = genresFor(book).join(" · ");
  document.querySelector("#result-synopsis").textContent = book.synopsis;
  setImage(document.querySelector("#result-image"), book);
  const details = document.querySelector(".synopsis-toggle");
  if (details) details.open = false;
  const link = document.querySelector("#goodreads-link");
  link.href = book.goodreadsUrl || "#";
  link.hidden = !book.goodreadsUrl;
}

function renderHome() {
  const first = books[0];
  document.querySelector("#monthly-title").textContent = first.title;
  document.querySelector("#monthly-author").textContent = first.author;
  document.querySelector("#monthly-synopsis").textContent = "“" + first.synopsis.slice(0, 180) + (first.synopsis.length > 180 ? "…" : "") + "”";
  setImage(document.querySelector("#monthly-cover"), first);
  const list = document.querySelector("#book-list");
  list.innerHTML = "";
  books.slice(0, 5).forEach((book, index) => {
    const button = document.createElement("button");
    button.innerHTML = "<span>" + String(index + 1).padStart(2, "0") + "</span><strong>" + book.title + "</strong><em>" + book.author + "</em><b>↗</b>";
    button.addEventListener("click", () => {
      drawBook(index);
      document.querySelector("#selector").scrollIntoView({ behavior: "smooth" });
    });
    list.appendChild(button);
  });
  drawBook(0);
}

function createBookCard(book, index) {
  const card = document.createElement("details");
  card.className = "library-card";
  const chips = genresFor(book).map(genre => "<span>" + genre + "</span>").join("");
  card.innerHTML =
    "<summary><span>" + String(index + 1).padStart(2, "0") + "</span><div><p>" + book.author + "</p><h2>" + book.title + "</h2></div><b>＋</b></summary>" +
    "<div class=\"library-card-body\">" +
      (book.cover ? "<img src=\"" + book.cover + "\" alt=\"" + book.title + " book cover\">" : "<div class=\"missing-cover\">Cover unavailable</div>") +
      "<div><div class=\"genre-chips\">" + chips + "</div><p class=\"synopsis\">" + book.synopsis + "</p>" +
      (book.goodreadsUrl ? "<a class=\"text-link\" href=\"" + book.goodreadsUrl + "\" target=\"_blank\" rel=\"noreferrer\">View on Goodreads ↗</a>" : "") +
      "</div></div>";
  return card;
}

function renderFullLibrary(filteredBooks = books) {
  const list = document.querySelector("#full-book-list");
  list.innerHTML = "";
  filteredBooks.forEach(book => list.appendChild(createBookCard(book, books.indexOf(book))));
  if (!filteredBooks.length) {
    list.innerHTML = "<div class=\"library-empty\"><h2>No books found</h2><p>Try another title or genre.</p></div>";
  }
  document.querySelector("#library-status").textContent =
    "Showing " + filteredBooks.length + " of " + books.length + " title" + (books.length === 1 ? "" : "s");
}

function setupLibraryFilters() {
  const search = document.querySelector("#title-search");
  const genreSelect = document.querySelector("#genre-filter");
  const clear = document.querySelector("#clear-filters");
  const genreMap = new Map();
  books.flatMap(genresFor).forEach(genre => {
    const key = genre.toLocaleLowerCase();
    if (!genreMap.has(key)) genreMap.set(key, genre);
  });
  [...genreMap.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([key, label]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = label;
      genreSelect.appendChild(option);
    });

  const applyFilters = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const genre = genreSelect.value;
    const filtered = books.filter(book => {
      const titleMatches = !query || book.title.toLocaleLowerCase().includes(query);
      const genreMatches = !genre || genresFor(book).some(item => item.toLocaleLowerCase() === genre);
      return titleMatches && genreMatches;
    });
    renderFullLibrary(filtered);
  };
  search.addEventListener("input", applyFilters);
  genreSelect.addEventListener("change", applyFilters);
  clear.addEventListener("click", () => {
    search.value = "";
    genreSelect.value = "";
    renderFullLibrary();
    search.focus();
  });
}

function setupMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".navlinks");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    menu.classList.toggle("is-open", !open);
    document.body.classList.toggle("menu-open", !open);
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }));
}

function setupRandomiser() {
  const button = document.querySelector("#random-button");
  button.addEventListener("click", function () {
    this.disabled = true;
    this.querySelector("span").textContent = "Finding your next story…";
    let target = Math.floor(Math.random() * books.length);
    if (books.length > 1) while (target === selected) target = Math.floor(Math.random() * books.length);
    let ticks = 0;
    const total = 14 + Math.floor(Math.random() * 6);
    const timer = setInterval(() => {
      drawBook((selected + 1) % books.length);
      if (++ticks >= total) {
        clearInterval(timer);
        drawBook(target);
        this.disabled = false;
        this.querySelector("span").textContent = "Pick a random book";
      }
    }, 100);
  });
}

async function start() {
  setupMenu();
  const libraryPage = document.querySelector("#full-book-list");
  const homePage = document.querySelector("#random-button");
  if (!libraryPage && !homePage) return;
  const synced = await fetchBooks();
  if (!synced) {
    if (libraryPage) {
      libraryPage.innerHTML = "<div class=\"library-empty\"><h2>The shelf could not be loaded</h2><p>Check that the Google Sheet is shared publicly, then refresh this page.</p></div>";
      document.querySelector("#library-status").textContent = "Google Sheet unavailable";
    } else {
      document.querySelector("#sync-status").textContent = "Google Sheet unavailable · Try refreshing";
      document.querySelector("#monthly-title").textContent = "The shelf could not be loaded";
      document.querySelector("#monthly-author").textContent = "Please refresh in a moment";
      document.querySelector("#monthly-synopsis").textContent = "Lauren’s list is always read live from Google Sheets.";
      homePage.disabled = true;
    }
    return;
  }
  if (libraryPage) {
    renderFullLibrary();
    setupLibraryFilters();
    return;
  }
  renderHome();
  setupRandomiser();
  document.querySelector("#sync-status").textContent = books.length + " books synced · Showing the latest five";
}

start();
