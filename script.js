const $ = (selector) => document.querySelector(selector);

const curtainHost = $("#curtains");
for (let i = 0; i < 6; i += 1) {
  const panel = document.createElement("div");
  panel.className = "curtain";
  panel.style.left = `${i * 16.66}%`;
  curtainHost.appendChild(panel);
}

const zipperLayout = [
  [48, 18, 17, 0.02, false], [55, 26, -41, 0.16, true],
  [25, 52, 67, 0.08, false], [54, 63, -12, 0.28, true],
  [72, 76, 38, 0.2, false], [78, 42, -69, 0.36, true],
  [36, 88, 5, 0.12, false]
];
const zipHost = $("#zipField");
zipperLayout.forEach(([x, y, rotation, delay, reverse]) => {
  const zip = document.createElement("div");
  zip.className = `zip${reverse ? " reverse" : ""}`;
  zip.style.cssText = `--x:${x}%;--y:${y}%;--r:${rotation}deg;--d:${delay}s`;
  const teeth = Array.from({ length: 140 }, () => '<i class="tooth"></i>').join("");
  zip.innerHTML = `<div class="teeth a">${teeth}</div><div class="teeth b">${teeth}</div><div class="slider"><span>CL</span><b></b></div>`;
  zipHost.appendChild(zip);
});
window.setTimeout(() => $("#loader").classList.add("done"), 3000);

const updateCountdown = () => {
  const target = new Date("2026-10-03T00:00:00+10:00").getTime();
  const left = Math.max(0, target - Date.now());
  const values = {
    days: Math.floor(left / 86400000),
    hours: Math.floor(left / 3600000) % 24,
    minutes: Math.floor(left / 60000) % 60,
    seconds: Math.floor(left / 1000) % 60
  };
  Object.entries(values).forEach(([id, value]) => {
    $(`#${id}`).textContent = String(value).padStart(2, "0");
  });
};
updateCountdown();
window.setInterval(updateCountdown, 1000);

const drawer = $("#drawer");
const shade = $("#shade");
const closeMenu = () => { drawer.classList.remove("open"); shade.classList.remove("on"); };
$("#menuOpen").addEventListener("click", () => { drawer.classList.add("open"); shade.classList.add("on"); });
$("#menuClose").addEventListener("click", closeMenu);
shade.addEventListener("click", closeMenu);
drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

$("#signup").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#formStatus").textContent = "SIGNAL RECEIVED / 登録完了";
  event.currentTarget.reset();
});
