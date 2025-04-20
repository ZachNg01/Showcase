const burger   = document.querySelector('.burger');
const navMenu  = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
  navMenu.classList.toggle('nav-active');
  navLinks.forEach((link, i) => {
    if (link.style.animation) {
      link.style.animation = '';
    } else {
      link.style.animation = `fadeInUp 0.5s ease forwards ${i/7 + 0.3}s`;
    }
  });
  burger.classList.toggle('toggle');
});
