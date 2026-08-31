const SHEET_CSV = "https://docs.google.com/spreadsheets/d/1ydtjVh-7CiVkD9uhb2DTKh848-U9QkVXh_AcsqvW7DA/gviz/tq?tqx=out:csv&gid=0";

const COVER_BY_GOODREADS_ID = {
  "58613224": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1627042661i/58613224.jpg",
  "169354": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1403025725i/169354.jpg"
};

// Used when the Google Sheet cannot be reached, such as when opening the HTML directly.
const SHEET_SNAPSHOT = [
  {
    goodreadsUrl: "https://www.goodreads.com/book/show/58613224-harry-potter-and-the-deathly-hallows",
    title: "Harry Potter and the Deathly Hallows (Harry Potter, #7)",
    author: "J.K. Rowling",
    synopsis: "It is no longer safe for Harry at Hogwarts, so he and his best friends, Ron and Hermione, are on the run. Dumbledore has left them clues about what they must do to defeat Lord Voldemort, but they must decipher those clues while evading capture. Their friendship, courage, and sense of right and wrong are tested as the final battle between good and evil returns them to Hogwarts.",
    genre: "Fantasy, Fiction, Young Adult, Harry Potter, Magic, Audiobook, Childrens, Adventure, Middle Grade, Classics",
    cover: COVER_BY_GOODREADS_ID["58613224"]
  },
  {
    goodreadsUrl: "https://www.goodreads.com/book/show/169354.The_Prize",
    title: "The Prize: The Epic Quest for Oil, Money, and Power",
    author: "Daniel Yergin",
    synopsis: "The Prize recounts the panoramic history of oil and the struggle for wealth and power that has always surrounded it. From the first well in Pennsylvania through two world wars, the Iraqi invasion of Kuwait, and Operation Desert Storm, it is as much a history of the twentieth century as it is a history of the oil industry.",
    genre: "History, Nonfiction, Economics, Business, Politics, Middle East, Science, World History, Finance, Environment",
    cover: COVER_BY_GOODREADS_ID["169354"]
  }
];

let books = [...SHEET_SNAPSHOT];
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

function goodreadsId(url = "") {
  return url.match(/(?:book\/show\/|\/show\/)(\d+)/i)?.[1] || "";
}

function coverURL(value = "", goodreadsUrl = "") {
  const direct = value.match(/https:\/\/m\.media-amazon\.com\/[^"'\)\s<>]+\.jpg/i)?.[0];
  return direct || COVER_BY_GOODREADS_ID[goodreadsId(goodreadsUrl)] || "";
}

function genresFor(book) {
  return [...new Set((book.genre || "").split(",").map(item => item.trim()).filter(Boolean))];
}

async function fetchBooks() {
  try {
    const response = await fetch(SHEET_CSV, { cache: "no-store" });
    if (!response.ok) throw new Error("Sheet request failed");
    const rows = parseCSV(await response.text());
    const headers = rows.shift().map(value => value.trim());
    const loaded = rows
      .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])))
      .filter(row => row.Title && row.Author)
      .map(row => ({
        goodreadsUrl: row["Goodreads URL"],
        title: row.Title.trim(),
        author: row.Author.trim(),
        synopsis: (row.Synopsis || "").replace(/<br\s*\/?\s*>/gi, "\n").trim(),
        genre: (row.Genre || "").trim(),
        cover: coverURL(row.Cover, row["Goodreads URL"])
      }));
    if (loaded.length) books = loaded;
    return true;
  } catch {
    books = [...SHEET_SNAPSHOT];
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
  if (libraryPage) {
    renderFullLibrary();
    setupLibraryFilters();
    if (!synced) document.querySelector("#library-status").textContent += " · Offline snapshot";
    return;
  }
  renderHome();
  setupRandomiser();
  document.querySelector("#sync-status").textContent =
    (synced ? books.length + " books synced" : "Offline snapshot") + " · Showing the latest five";
}

start();
