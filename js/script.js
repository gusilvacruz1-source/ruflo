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

// Logo da hero: inclina seguindo o mouse do visitante e gira ao clicar
const heroSection = document.querySelector('.hero');
const heroLogo = document.querySelector('.hero__logo-3d');
const heroLogoSpin = document.querySelector('.hero__logo-spin');

if (heroSection && heroLogo && heroLogoSpin && supportsHover && !reduceMotion) {
  const maxLogoTilt = 26;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * maxLogoTilt * 2;
    const rotateX = (0.5 - py) * maxLogoTilt;

    heroLogoSpin.classList.add('is-tracking');
    heroLogoSpin.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    heroLogoSpin.classList.remove('is-tracking');
    heroLogoSpin.style.transform = '';
  });

  heroLogo.addEventListener('click', () => {
    heroLogoSpin.classList.remove('is-tracking');
    heroLogoSpin.style.transform = '';
    heroLogoSpin.classList.add('is-clicked');
  });

  heroLogoSpin.addEventListener('animationend', (e) => {
    if (e.animationName === 'heroLogoClickSpin') {
      heroLogoSpin.classList.remove('is-clicked');
    }
  });
}
