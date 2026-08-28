document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');

navToggle.addEventListener('click', () => {
  header.classList.toggle('nav-open');
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => header.classList.remove('nav-open'));
});

// Efeito 3D nos cards de produtos/serviços (apenas em dispositivos com mouse)
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (supportsHover && !reduceMotion) {
  const maxTilt = 10;

  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateX = (py - 0.5) * -maxTilt;
      const rotateY = (px - 0.5) * maxTilt;

      card.style.transition = 'transform 60ms linear';
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 500ms cubic-bezier(.22,1,.36,1)';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });
}
