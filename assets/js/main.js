/* ============================================
   华田中央大学 - 主脚本 Main JS
   ============================================ */

// 移动端断点（与 CSS 媒体查询保持一致）
var MOBILE_BREAKPOINT = window.matchMedia('(max-width: 1024px)');

document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initMobileMenu();
  initHeroCarousel();
  initScrollAnimations();
  initStatsCounter();
});

// 头部滚动效果（passive 提升滚动性能）
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 移动端菜单（抽屉式：遮罩 + 滚动锁定 + 可访问性）
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  if (!menuBtn || !mainNav) return;

  // 动态创建遮罩（避免修改所有页面结构）
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  function isMobile() {
    return MOBILE_BREAKPOINT.matches;
  }

  function openMenu() {
    mainNav.classList.add('open');
    menuBtn.classList.add('active');
    overlay.classList.add('show');
    document.body.classList.add('nav-open');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mainNav.classList.remove('open');
    menuBtn.classList.remove('active');
    overlay.classList.remove('show');
    document.body.classList.remove('nav-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (mainNav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  // 点击遮罩关闭
  overlay.addEventListener('click', closeMenu);

  // ESC 键关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      closeMenu();
      menuBtn.focus();
    }
  });

  // 处理移动端下拉菜单（点击父级展开/收起）
  const navItems = document.querySelectorAll('.nav-item.has-dropdown');
  navItems.forEach(item => {
    const link = item.querySelector(':scope > a');
    if (link) {
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');

      link.addEventListener('click', function(e) {
        if (isMobile()) {
          e.preventDefault();
          const expanded = item.classList.toggle('open');
          link.setAttribute('aria-expanded', String(expanded));
        }
      });
    }
  });

  // 点击普通导航链接后关闭菜单
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      if (isMobile() && !link.closest('.has-dropdown')) {
        closeMenu();
      }
    });
  });

  // 点击菜单外部关闭（兜底，遮罩已覆盖大部分场景）
  document.addEventListener('click', function(e) {
    if (isMobile() &&
        mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        !menuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // 跨断点切换：从移动端调整到桌面端时重置菜单状态
  function handleBreakpointChange(e) {
    if (!e.matches) {
      closeMenu();
      navItems.forEach(item => {
        item.classList.remove('open');
        const link = item.querySelector(':scope > a');
        if (link) link.setAttribute('aria-expanded', 'false');
      });
    }
  }

  if (typeof MOBILE_BREAKPOINT.addEventListener === 'function') {
    MOBILE_BREAKPOINT.addEventListener('change', handleBreakpointChange);
  } else if (typeof MOBILE_BREAKPOINT.addListener === 'function') {
    // 旧版 Safari 兼容
    MOBILE_BREAKPOINT.addListener(handleBreakpointChange);
  }
}

// Hero 轮播
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');

  if (!slides.length) return;

  let currentSlide = 0;
  let autoplayInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // 指示器点击
  dots.forEach((dot, i) => {
    dot.addEventListener('click', function() {
      showSlide(i);
      stopAutoplay();
      startAutoplay();
    });
  });

  // 前后按钮
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  // 自动播放
  startAutoplay();

  // 鼠标悬停暂停
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
  }
}

// 滚动动画（尊重系统"减少动效"偏好）
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.feature-card, .college-card, .news-card, .gallery-item, .stat-item');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    animateElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
    observer.observe(el);
  });
}

// 数字计数器动画
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  if (!('IntersectionObserver' in window)) {
    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target) || 0;
      el.textContent = target.toLocaleString();
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));

  function animateCounter(element) {
    const target = parseInt(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);

      element.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }
}
