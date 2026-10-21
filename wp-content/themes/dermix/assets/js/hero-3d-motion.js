/**
 * Dermix — High-Performance 60fps 3D Scroll-Scrubbed Engine
 * Pre-extracted 90 WebP frames + On-Demand rAF + Zero Main-Thread Decode Lag
 */
(function () {
  const TOTAL_FRAMES = 90;
  const isSubdir = window.location.pathname.includes('/home-version-2/');
  const base = isSubdir ? '../' : '';
  const FRAME_PATH = base + 'assets/videos/frames/frame_';

  const init = () => {
    const stage = document.getElementById('nova-scroll-stage') || document.querySelector('.hero-royal') || document.querySelector('.nova-hero2-bg-wrapper');
    const posterEl = document.getElementById('nova-poster');
    const canvasEl = document.getElementById('nova-canvas');

    if (!stage || !canvasEl) return;

    const ctx = canvasEl.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const frames = new Array(TOTAL_FRAMES).fill(null);
    let loadedCount = 0;
    let lastDrawnIndex = -1;

    // Cached layout metrics (never call getBoundingClientRect in rAF!)
    let stageTop = 0;
    let maxScroll = 1;
    let cw = 0;
    let ch = 0;

    let targetProgress = 0;
    let smoothedProgress = 0;
    let rafId = null;

    const drawFrame = (img) => {
      if (!img || !cw || !ch) return;
      const sw = img.naturalWidth || img.width || 1920;
      const sh = img.naturalHeight || img.height || 1080;

      const scale = Math.max(cw / sw, ch / sh);
      const rw = sw * scale;
      const rh = sh * scale;
      const cx = (cw - rw) * 0.5;
      const cy = (ch - rh) * 0.5;

      ctx.drawImage(img, 0, 0, sw, sh, cx, cy, rw, rh);
    };

    const updateMetrics = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const hostEl = stage || canvasEl.parentElement || window;
      const width = hostEl.clientWidth || window.innerWidth;
      const height = hostEl.clientHeight || window.innerHeight;
      const targetW = Math.floor(width * dpr);
      const targetH = Math.floor(height * dpr);

      if (cw !== targetW || ch !== targetH) {
        cw = canvasEl.width = targetW;
        ch = canvasEl.height = targetH;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        lastDrawnIndex = -1; // Force redraw on resize
      }

      const trackEl = document.querySelector('.nova-hero2-track') || stage.closest('.nova-hero2-track') || stage;
      const rect = trackEl.getBoundingClientRect();
      stageTop = rect.top + (window.scrollY || window.pageYOffset || 0);
      maxScroll = Math.max(1, trackEl.offsetHeight - window.innerHeight);
      updateScrollTarget();
      scheduleRender();
    };

    const updateScrollTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const scrolled = scrollY - stageTop;
      targetProgress = Math.min(1, Math.max(0, scrolled / maxScroll));
    };

    const tick = () => {
      rafId = null;
      const diff = targetProgress - smoothedProgress;
      if (Math.abs(diff) > 0.0005) {
        smoothedProgress += diff * 0.14;
      } else {
        smoothedProgress = targetProgress;
      }

      const desiredIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(smoothedProgress * (TOTAL_FRAMES - 1)))
      );

      // Find closest loaded frame if exact frame isn't decoded yet
      let frameToDraw = frames[desiredIndex];
      let drawIndex = desiredIndex;
      if (!frameToDraw) {
        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
          if (desiredIndex - offset >= 0 && frames[desiredIndex - offset]) {
            frameToDraw = frames[desiredIndex - offset];
            drawIndex = desiredIndex - offset;
            break;
          }
          if (desiredIndex + offset < TOTAL_FRAMES && frames[desiredIndex + offset]) {
            frameToDraw = frames[desiredIndex + offset];
            drawIndex = desiredIndex + offset;
            break;
          }
        }
      }

      if (frameToDraw && drawIndex !== lastDrawnIndex) {
        drawFrame(frameToDraw);
        lastDrawnIndex = drawIndex;
      }

      // Smooth subtle text fade while scrubbing so full 3D visual is showcased
      const contentInnerEl = stage.querySelector('.e-con-inner');
      if (contentInnerEl) {
        let op = 1;
        let ty = 0;
        if (smoothedProgress > 0.45) {
          const ratio = Math.min(1, (smoothedProgress - 0.45) / 0.40);
          op = 1 - ratio * 0.85; // gently dims down to 0.15 instead of disappearing abruptly
          ty = -20 * ratio;
        }
        contentInnerEl.style.opacity = op.toFixed(3);
        contentInnerEl.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
      }

      if (Math.abs(targetProgress - smoothedProgress) > 0.0005) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const scheduleRender = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const checkHeaderSticky = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY > 30) {
        document.body.classList.add('header-scrolled');
      } else {
        document.body.classList.remove('header-scrolled');
      }
    };

    window.addEventListener(
      'scroll',
      () => {
        updateScrollTarget();
        scheduleRender();
        checkHeaderSticky();
      },
      { passive: true }
    );

    window.addEventListener('resize', () => {
      updateMetrics();
      checkHeaderSticky();
    }, { passive: true });
    updateMetrics();
    checkHeaderSticky();

    // Load a single frame image and decode off main thread
    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const padded = String(index + 1).padStart(3, '0');
        const img = new Image();
        img.decoding = 'async';
        img.src = `${FRAME_PATH}${padded}.webp`;
        img.onload = () => {
          frames[index] = img;
          loadedCount++;
          if (loadedCount === 1) {
            canvasEl.style.opacity = '1';
            if (posterEl) posterEl.style.opacity = '0';
          }
          if (
            index ===
            Math.round(smoothedProgress * (TOTAL_FRAMES - 1))
          ) {
            lastDrawnIndex = -1;
            scheduleRender();
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Priority loading: load keyframe stride first (every 6th frame) so full scroll works in <80ms, then fill in remaining frames
    const loadAllFrames = async () => {
      const order = [];
      const visited = new Set();

      for (const stride of [6, 3, 1]) {
        for (let i = 0; i < TOTAL_FRAMES; i += stride) {
          if (!visited.has(i)) {
            visited.add(i);
            order.push(i);
          }
        }
      }

      const CONCURRENCY = 6;
      let cursor = 0;
      const worker = async () => {
        while (cursor < order.length) {
          const idx = order[cursor++];
          await loadFrame(idx);
        }
      };

      const workers = [];
      for (let w = 0; w < CONCURRENCY; w++) {
        workers.push(worker());
      }
      await Promise.all(workers);
      lastDrawnIndex = -1;
      scheduleRender();
    };

    loadAllFrames();

    // Staggered Reveal Animations
    const revealElements = document.querySelectorAll('.nova-reveal');
    revealElements.forEach((el) => {
      const delay = el.getAttribute('data-delay') || '0';
      el.style.transitionDelay = `${delay}ms`;
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('is-visible'));
    }

    // Force Home 2 heading & content visibility immediately
    const forceHeroRoyalVisible = () => {
      document.querySelectorAll('.hero-royal .elementor-invisible').forEach((el) => {
        el.classList.remove('elementor-invisible');
        el.classList.add('animated', 'fadeInUp');
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
      document.querySelectorAll('.hero-royal .at-animation-heading-style-3 .elementor-heading-title *').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    };
    forceHeroRoyalVisible();
    setTimeout(forceHeroRoyalVisible, 250);
    setTimeout(forceHeroRoyalVisible, 800);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
