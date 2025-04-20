// main.js

document.addEventListener('DOMContentLoaded', () => {
  initBurgerToggle();
  initDropdowns();
  closeNavOnLinkClick();
});

function initBurgerToggle() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      burger.classList.toggle('toggle');
    });
  }
}

function initDropdowns() {
  document.querySelectorAll('.has-dropdown .drop-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', e => {
      const parent = e.currentTarget.parentElement;
      const expanded = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', expanded);
    });
  });
}

function closeNavOnLinkClick() {
  const navLinks = document.querySelector('.nav-links');
  const burger = document.querySelector('.burger');
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger?.classList.remove('toggle');
    });
  });
}
