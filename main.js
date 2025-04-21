// Toggle mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav    = document.querySelector('.nav-links');
  burger.addEventListener('click', () => nav.classList.toggle('open'));
});

document.addEventListener('DOMContentLoaded', () => {
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
});
