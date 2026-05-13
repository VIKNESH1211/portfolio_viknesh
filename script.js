/* ═══════════════════════════════════════════════════
   VIKNESH S — Portfolio Scripts
   ═══════════════════════════════════════════════════ */

/* ─── SCROLL PROGRESS BAR ─── */
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ─── MOBILE HAMBURGER ─── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ─── ACTIVE NAV HIGHLIGHT ─── */
const sections = document.querySelectorAll('section[id], div[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObserver.observe(s));

/* ─── SCROLL REVEAL ─── */
const srObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      srObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.sr').forEach(el => srObserver.observe(el));

/* ─── TYPED ROLE ANIMATION ─── */
const roles = [
  'AI & ML Engineer',
  'Backend Systems Architect',
  'Applied Researcher',
  'Incoming MSc @ Trinity College Dublin',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-role');

function typeRole() {
  const current = roles[roleIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeRole, 2200);
      return;
    }
    setTimeout(typeRole, 70);
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(typeRole, 350);
      return;
    }
    setTimeout(typeRole, 38);
  }
}
setTimeout(typeRole, 800);

/* ─── STATS COUNTER ─── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });
const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) counterObserver.observe(statsStrip);

/* ─── SKILLS TABS ─── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    if (panel) {
      panel.classList.add('active');
      /* subtle entrance for pills */
      panel.querySelectorAll('.sp').forEach((sp, i) => {
        sp.style.opacity = '0';
        sp.style.transform = 'translateY(6px)';
        setTimeout(() => {
          sp.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          sp.style.opacity = '1';
          sp.style.transform = 'none';
        }, i * 18);
      });
    }
  });
});

/* ─── GENERIC CAROUSEL FACTORY ─── */
function buildCarousel({ trackId, prevId, nextId, dotsId, visibleCount, autoMs }) {
  const track  = document.getElementById(trackId);
  const prev   = document.getElementById(prevId);
  const next   = document.getElementById(nextId);
  const dotsEl = document.getElementById(dotsId);
  if (!track || !prev || !next) return;

  const cards  = Array.from(track.children);
  const total  = cards.length;
  let current  = 0;
  let timer    = null;

  /* Build dots */
  const numSlides = total - visibleCount + 1;
  for (let i = 0; i < numSlides; i++) {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  }

  function updateDots() {
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() {
    if (!cards[0]) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 20;
    return cards[0].offsetWidth + gap;
  }

  function goTo(idx) {
    const max = Math.max(0, total - visibleCount);
    current = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
    resetTimer();
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  function startTimer() {
    if (!autoMs) return;
    timer = setInterval(() => {
      const max = Math.max(0, total - visibleCount);
      goTo(current >= max ? 0 : current + 1);
    }, autoMs);
  }
  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  /* Pause on hover */
  track.closest('.proj-carousel, .testi-wrap')?.addEventListener('mouseenter', () => clearInterval(timer));
  track.closest('.proj-carousel, .testi-wrap')?.addEventListener('mouseleave', startTimer);

  /* Touch / swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  startTimer();
  window.addEventListener('resize', () => goTo(current));

  return { goTo };
}

/* visible cards depends on viewport */
function projVisible() {
  if (window.innerWidth <= 860) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

buildCarousel({ trackId: 'proj-track',  prevId: 'proj-prev',  nextId: 'proj-next',  dotsId: 'proj-dots',  visibleCount: projVisible(), autoMs: 5000 });
buildCarousel({ trackId: 'testi-track', prevId: 'testi-prev', nextId: 'testi-next', dotsId: 'testi-dots', visibleCount: 1,            autoMs: 6000 });

/* Rebuild on resize for proj carousel */
window.addEventListener('resize', () => {
  /* Dots already handled by goTo — just update visible count mentally.
     For full rebuild, reload is acceptable; here we just reflow. */
}, { passive: true });

/* ─── BACK TO TOP ─── */
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
