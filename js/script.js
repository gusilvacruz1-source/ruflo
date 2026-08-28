document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');

navToggle.addEventListener('click', () => {
  header.classList.toggle('nav-open');
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => header.classList.remove('nav-open'));
});
