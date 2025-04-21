// Toggle mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav    = document.querySelector('.nav-links');
  burger.addEventListener('click', () => nav.classList.toggle('open'));
});
