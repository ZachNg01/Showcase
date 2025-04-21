document.addEventListener('DOMContentLoaded', () => {
  const burger   = document.getElementById('burger'),
        navLinks = document.getElementById('nav-links');

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
});
