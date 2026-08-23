/* ============================================
   华田中央大学 - 主脚本 Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initMobileMenu();
  initHeroCarousel();
  initScrollAnimations();
  initStatsCounter();
});

// 头部滚动效果
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// 移动端菜单
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  if (!menuBtn || !mainNav) return;

  menuBtn.addEventListener('click', function() {
    mainNav.classList.toggle('open');
  });

  // 处理移动端下拉菜单
  const navItems = document.querySelectorAll('.nav-item.has-dropdown');
  navItems.forEach(item => {
    const link = item.querySelector(':scope > a');
    if (link) {
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });

  // 点击外部关闭菜单
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 1024 &&
        !mainNav.contains(e.target) &&
        !menuBtn.contains(e.target)) {
      mainNav.classList.remove('open');
    }
  });
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

// 滚动动画
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.feature-card, .college-card, .news-card, .gallery-item, .stat-item');

  if (!('IntersectionObserver' in window)) {
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
