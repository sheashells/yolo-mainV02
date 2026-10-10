(function initLandingPage() {
  'use strict';

  // 1. Intersection Observer for lightweight, performant scroll animations
  const setupScrollReveals = () => {
    // Respect user preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('.lp-reveal');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Disconnect observer after animation to save performance
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  };

  // 2. Sticky Navigation Logic
  const setupStickyNav = () => {
    const header = document.getElementById('lp-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('lp-scrolled');
      } else {
        header.classList.remove('lp-scrolled');
      }
    };

    // Passive event listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger on load
  };

  // 3. Mobile Navigation Toggle
  const setupMobileNav = () => {
    const toggleBtn = document.getElementById('lp-mobile-toggle');
    const navMenu = document.getElementById('lp-nav-menu');
    
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open');
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      }
    });
  };

  const setupLandingViews = () => {
    const wrapper = document.querySelector('.lp-wrapper');
    if (!wrapper) return;

    const views = {
      home: { title: 'SIERRA HAVEN | Property & Lease Portal', nav: '#home' },
      properties: { title: 'Properties | SIERRA HAVEN', nav: '#properties' },
      about: { title: 'About SIERRA HAVEN', nav: '#about' },
      'how-it-works': { title: 'How It Works | SIERRA HAVEN', nav: '#how-it-works' }
    };
    const viewForHash = (hash) => {
      const requestedView = hash.slice(1);
      if (requestedView === 'faq') return 'how-it-works';
      return Object.prototype.hasOwnProperty.call(views, requestedView) ? requestedView : 'home';
    };

    const renderView = () => {
      const view = viewForHash(window.location.hash);
      wrapper.dataset.activeView = view;
      document.title = views[view].title;
      document.querySelectorAll('.lp-nav-link[href^="#"]').forEach((link) => {
        if (link.getAttribute('href') === views[view].nav) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || !views[viewForHash(hash)]) return;
      event.preventDefault();
      if (window.location.hash === hash) renderView();
      else window.location.hash = hash;
    });
    window.addEventListener('hashchange', renderView);
    renderView();
  };

  // Filter the demo listing so search remains useful without a listings backend.
  const setupSearchForm = () => {
    const form = document.getElementById('lp-search-form');
    const status = document.getElementById('lp-search-status');
    const propertyCards = document.querySelectorAll('.lp-property-card');
    if (!form || !status || propertyCards.length === 0) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('lp-location').value.trim().toLowerCase();
      const type = document.getElementById('lp-type').value;
      let matches = 0;

      propertyCards.forEach((card) => {
        const matchesLocation = !location || card.dataset.location.includes(location);
        const matchesType = type === 'all' || card.dataset.type === type;
        const isMatch = matchesLocation && matchesType;
        card.hidden = !isMatch;
        if (isMatch) matches += 1;
      });

      status.hidden = false;
      status.textContent = matches
        ? `${matches} sample ${matches === 1 ? 'listing matches' : 'listings match'} your search.`
        : 'No sample listings match those filters. Try another location or property type.';
      if (window.location.hash === '#properties') {
        document.querySelector('.lp-wrapper').dataset.activeView = 'properties';
      } else {
        window.location.hash = 'properties';
      }
    });
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveals();
    setupStickyNav();
    setupMobileNav();
    setupLandingViews();
    setupSearchForm();
  });

})();