const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const siteNav = document.querySelector('.site-nav');
const submenuToggles = document.querySelectorAll('.submenu-toggle');
const eventCarousel = document.querySelector('[data-event-carousel]');

const closeMobileMenu = () => {
  document.body.classList.remove('nav-open');
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
  }
};

const closeSubmenus = (except) => {
  document.querySelectorAll('.nav-item.submenu-open').forEach((item) => {
    if (item !== except) {
      item.classList.remove('submenu-open');
      const toggle = item.querySelector('.submenu-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
};

if (header) {
  const topThreshold = 24;
  let previousScrollY = window.scrollY;

  const updateHeaderState = () => {
    const scrollY = Math.max(0, window.scrollY);
    const isNearTop = scrollY <= topThreshold;
    const scrollDelta = scrollY - previousScrollY;

    header.classList.toggle('scrolled', !isNearTop);

    if (isNearTop || document.body.classList.contains('nav-open')) {
      header.classList.remove('header-hidden');
    } else if (scrollDelta > 2) {
      header.classList.add('header-hidden');
    } else if (scrollDelta < -2) {
      header.classList.remove('header-hidden');
    }

    header.inert = header.classList.contains('header-hidden')
      && !header.contains(document.activeElement);
    previousScrollY = scrollY;
  };

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeaderState();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateHeaderState();
}

if (header) {
  header.addEventListener('focusin', () => {
    header.classList.remove('header-hidden');
    header.inert = false;
  });
}

if (siteNav) {
  const currentPage = document.body.dataset.page;
  const currentSection = document.body.dataset.section;

  siteNav.querySelectorAll('[data-page]').forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  siteNav.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    if (link.dataset.section === currentSection) {
      link.classList.add('active');
    }
  });

}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    document.body.classList.toggle('nav-open', !expanded);
  });
}

submenuToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const item = toggle.closest('.nav-item');
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    closeSubmenus(item);
    item.classList.toggle('submenu-open', !expanded);
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
});

if (siteNav) {
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeSubmenus(null);
      closeMobileMenu();
    }
  });
}

if (mobileMenuOverlay) {
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 1020) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSubmenus(null);
    closeMobileMenu();
  }
});

if (eventCarousel) {
  const viewport = eventCarousel.querySelector('.upcoming-carousel-viewport');
  const track = eventCarousel.querySelector('.upcoming-carousel-track');
  const slides = Array.from(track.querySelectorAll('.upcoming-event-card'));
  const previousButton = eventCarousel.querySelector('[data-event-previous]');
  const nextButton = eventCarousel.querySelector('[data-event-next]');
  const status = eventCarousel.querySelector('[data-event-status]');
  let activeIndex = 0;
  let touchStart = null;

  const showEvent = (nextIndex) => {
    const focusedSlide = slides.find((slide) => slide.contains(document.activeElement));
    activeIndex = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    status.textContent = `Event ${activeIndex + 1} of ${slides.length}`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.inert = !isActive;
      slide.setAttribute('aria-label', `Event ${index + 1} of ${slides.length}`);
    });

    if (focusedSlide && focusedSlide !== slides[activeIndex]) {
      viewport.focus({ preventScroll: true });
    }
  };

  showEvent(0);

  previousButton.addEventListener('click', () => showEvent(activeIndex - 1));
  nextButton.addEventListener('click', () => showEvent(activeIndex + 1));

  viewport.addEventListener('keydown', (event) => {
    if (event.target !== viewport) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showEvent(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showEvent(activeIndex + 1);
    }
  });

  viewport.addEventListener('touchstart', (event) => {
    touchStart = event.changedTouches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', (event) => {
    if (touchStart === null) {
      return;
    }

    const swipeDistance = event.changedTouches[0].clientX - touchStart;
    touchStart = null;

    if (Math.abs(swipeDistance) >= 50) {
      showEvent(activeIndex + (swipeDistance < 0 ? 1 : -1));
    }
  }, { passive: true });
}
