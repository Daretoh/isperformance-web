// ========================================
// IS GROUP - Landing Page
// ========================================

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (location.hash) {
  history.replaceState(null, '', location.pathname + location.search);
}

document.addEventListener('DOMContentLoaded', () => {

  // ---- Hero parallax scroll ----
  const heroSection = document.querySelector('.page-hero');
  if (heroSection) {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const shift = -(scrollY * 0.35).toFixed(1);
      heroSection.style.setProperty('--hero-scroll', shift + 'px');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Lupa → volver al hero ----
  const toHeroBtn = document.getElementById('nav-to-hero');
  if (toHeroBtn) {
    toHeroBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const input = document.getElementById('producto-buscar-texto');
      if (input) {
        setTimeout(() => {
          const heroFiltro = document.getElementById('hero-marca');
          if (heroFiltro) heroFiltro.focus();
        }, 600);
      }
    });
  }

  // ---- Nav dropdown: categorías (scroll a carrusel) ----
  document.querySelectorAll('[data-scroll-cat]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const cat = link.dataset.scrollCat;
      const target = document.getElementById('cat-' + cat);
      const equipos = document.getElementById('equipos');
      if (equipos) equipos.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
      }
      // Cerrar dropdown móvil
      link.closest('.nav-has-dropdown')?.classList.remove('open');
      document.getElementById('navLinks')?.classList.remove('open');
      document.getElementById('menuToggle')?.classList.remove('active');
    });
  });

  // ---- Dropdown móvil: toggle al tocar el link principal ----
  document.querySelectorAll('.nav-has-dropdown > a').forEach(link => {
    link.addEventListener('click', e => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) return;
      e.preventDefault();
      link.closest('.nav-has-dropdown').classList.toggle('open');
    });
  });

  // ---- Mobile Menu ----
  const toggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(section => observer.observe(section));

  // ---- Carousel auto-slide ----
  document.querySelectorAll('.cat-gallery').forEach(gallery => {
    const track = gallery.querySelector('.carousel-track');
    const prev = gallery.querySelector('.carousel-prev');
    const next = gallery.querySelector('.carousel-next');
    if (!track) return;

    const stepW = () => {
      const img = track.querySelector('img');
      return img ? img.clientWidth : 320;
    };

    const step = () => {
      const w = stepW();
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: w, behavior: 'smooth' });
      }
    };

    let timer = setInterval(step, 3500);

    gallery.addEventListener('mouseenter', () => clearInterval(timer));
    gallery.addEventListener('mouseleave', () => { timer = setInterval(step, 3500); });

    if (prev) prev.addEventListener('click', () => {
      track.scrollBy({ left: -stepW(), behavior: 'smooth' });
    });

    if (next) next.addEventListener('click', () => {
      track.scrollBy({ left: stepW(), behavior: 'smooth' });
    });
  });

  // ---- Scroll Reveal ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0 });

  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      revealObserver.observe(el);
    }
  });

  // ---- Contact form (placeholder) ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Mensaje enviado';
      btn.style.background = '#22c55e';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

});
