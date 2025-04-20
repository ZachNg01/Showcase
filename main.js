// Toggle mobile nav
const burger = document.querySelector('.burger');
const nav     = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  nav.classList.toggle('open');
  burger.classList.toggle('toggle');
});

// Enable dropdown tap on mobile
document.querySelectorAll('.has-dropdown .drop-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.currentTarget.parentElement.classList.toggle('open');
  });
});
