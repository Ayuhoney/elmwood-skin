/**
 * Card Fan Carousel - GSAP Powered Interactive Fan Carousel
 * For Elmwood Skin Success Stories
 */
(function () {
  "use strict";

  function initCardFanCarousel() {
    const container = document.getElementById("fan-cards-stage");
    if (!container || !window.gsap) return;

    const cards = Array.from(container.querySelectorAll(".fan-card"));
    const totalCards = cards.length;
    if (totalCards === 0) return;

    const MAX_VISIBLE = 7;
    const HALF = 3;
    const needsPagination = totalCards > MAX_VISIBLE;

    const FAN_POSITIONS = [
      { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
      { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
      { rot: -7,  scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
      { rot: 0,   scale: 1.0,    x: 0,   y: 0.0, zIndex: 10 },
      { rot: 7,   scale: 0.9346, x: 11,  y: 1.3, zIndex: 3 },
      { rot: 14,  scale: 0.8498, x: 22,  y: 4.0, zIndex: 2 },
      { rot: 21,  scale: 0.7756, x: 30,  y: 7.3, zIndex: 1 },
    ];

    function getResponsiveMultiplier(width) {
      if (width < 480) return 0.28;
      if (width < 640) return 0.38;
      if (width < 768) return 0.5;
      if (width < 1024) return 0.75;
      return 1.0;
    }

    function getHeightMultiplier(width) {
      let idealPx;
      if (width < 480) idealPx = 22 * 16;
      else if (width < 640) idealPx = 26 * 16;
      else if (width < 768) idealPx = 28 * 16;
      else if (width < 1024) idealPx = 34 * 16;
      else idealPx = 38 * 16;

      const available = window.innerHeight * 0.7;
      if (available >= idealPx) return 1;
      return available / idealPx;
    }

    function getSlotConfig(slotCount, slot) {
      if (slotCount >= MAX_VISIBLE) return FAN_POSITIONS[slot];
      const center = slotCount >> 1;
      const distance = slotCount > 1 ? (slot - center) / center : 0;
      const absDistance = Math.abs(distance);
      return {
        rot: distance * 21,
        scale: 1.0 - 0.2244 * absDistance * absDistance,
        x: distance * 30,
        y: absDistance * absDistance * 7.3,
        zIndex: 10 - Math.abs(slot - center),
      };
    }

    let centerIndex = needsPagination ? HALF : totalCards >> 1;
    let isAnimating = false;
    let hasEntered = false;
    let direction = null;
    let prevVisible = new Set();
    let activeSlot = null;
    let leaveTimer = null;

    function getVisibleMap(center) {
      const map = new Map();
      if (!needsPagination) {
        cards.forEach((_, i) => map.set(i, i));
        return map;
      }
      for (let slot = 0; slot < MAX_VISIBLE; slot++) {
        map.set(((center + slot - HALF) % totalCards + totalCards) % totalCards, slot);
      }
      return map;
    }

    // Pagination elements
    const paginationContainer = document.getElementById("fan-pagination");
    const prevBtn = document.getElementById("fan-prev-btn");
    const nextBtn = document.getElementById("fan-next-btn");
    const dotsContainer = document.getElementById("fan-dots");

    function renderDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      cards.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "fan-dot" + (i === centerIndex ? " active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => {
          if (isAnimating || i === centerIndex) return;
          direction = i > centerIndex ? "right" : "left";
          centerIndex = i;
          renderLayout();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = Array.from(dotsContainer.querySelectorAll(".fan-dot"));
      dots.forEach((dot, idx) => {
        if (idx === centerIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    function cycle(dir) {
      if (isAnimating || !needsPagination) return;
      isAnimating = true;
      direction = dir;
      centerIndex = dir === "right"
        ? (centerIndex + 1) % totalCards
        : (centerIndex - 1 + totalCards) % totalCards;
      updateDots();
      renderLayout();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => cycle("left"));
    if (nextBtn) nextBtn.addEventListener("click", () => cycle("right"));

    function renderLayout() {
      const visibleMap = getVisibleMap(centerIndex);
      const previouslyVisible = prevVisible;
      const isFirstMount = !hasEntered;
      const multiplier = getResponsiveMultiplier(window.innerWidth);
      const hMult = getHeightMultiplier(window.innerWidth);
      const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
      const config = (s) => getSlotConfig(slotCount, s);

      if (isFirstMount) isAnimating = true;

      let completedCount = 0;
      const visibleCount = visibleMap.size;
      const onCardDone = () => {
        completedCount++;
        if (completedCount >= visibleCount) {
          isAnimating = false;
          if (isFirstMount) hasEntered = true;
        }
      };

      cards.forEach((card, cardIndex) => {
        const slot = visibleMap.get(cardIndex);
        const wasVisible = previouslyVisible.has(cardIndex);

        if (slot !== undefined) {
          const cfg = config(slot);
          const target = {
            x: cfg.x * multiplier * 16,
            y: cfg.y * hMult * 16,
            rotation: cfg.rot,
            scale: cfg.scale,
            opacity: 1,
            zIndex: cfg.zIndex,
          };

          if (isFirstMount) {
            window.gsap.set(card, {
              x: 0,
              y: 12 * hMult * 16,
              rotation: 0,
              scale: 0.5,
              opacity: 0,
            });
            window.gsap.to(card, {
              ...target,
              duration: 1.2,
              ease: "elastic.out(1.05,.78)",
              delay: 0.2 + slot * 0.06,
              onComplete: onCardDone,
            });
          } else if (!wasVisible) {
            const enterX = direction === "right" ? 40 * 16 : -40 * 16;
            window.gsap.set(card, {
              x: enterX,
              y: cfg.y * hMult * 16,
              rotation: direction === "right" ? 30 : -30,
              scale: 0.5,
              opacity: 0,
            });
            window.gsap.to(card, {
              ...target,
              duration: 0.6,
              ease: "power2.out",
              onComplete: onCardDone,
            });
          } else {
            window.gsap.to(card, {
              ...target,
              duration: 0.5,
              ease: "power2.out",
              onComplete: onCardDone,
            });
          }
        } else if (wasVisible) {
          const exitX = direction === "right" ? -40 * 16 : 40 * 16;
          window.gsap.to(card, {
            x: exitX,
            opacity: 0,
            scale: 0.5,
            rotation: direction === "right" ? -30 : 30,
            duration: 0.4,
            ease: "power2.in",
            zIndex: 0,
          });
        } else if (isFirstMount) {
          window.gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
        }
      });

      prevVisible = new Set(visibleMap.keys());
      setupHoverHandlers(visibleMap, config);
    }

    function setupHoverHandlers(visibleMap, config) {
      const visibleEntries = [];
      cards.forEach((el, i) => {
        const slot = visibleMap.get(i);
        if (slot !== undefined) visibleEntries.push({ el, slot });
      });
      visibleEntries.sort((a, b) => a.slot - b.slot);

      const centerSlot = visibleEntries.length >> 1;

      function updateHoverLayout(hoveredSlot) {
        const mult = getResponsiveMultiplier(window.innerWidth);
        const hM = getHeightMultiplier(window.innerWidth);

        visibleEntries.forEach(({ el, slot }) => {
          const base = config(slot);
          let targetX = base.x * mult * 16;
          let targetY = base.y * hM * 16;
          let targetRot = base.rot;
          let targetScale = base.scale;
          let delay = 0;

          if (hoveredSlot !== null) {
            const distance = Math.abs(slot - hoveredSlot);
            delay = distance * 0.02;

            if (slot === hoveredSlot) {
              targetY -= 2.5 * hM * 16;
              targetScale *= 1.08;
            } else {
              const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
              const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

              if (slot < hoveredSlot) {
                targetX -= pushStrength * mult * 16;
                targetRot -= 3 / (distance + 1);
              } else {
                targetX += pushStrength * mult * 16;
                targetRot += 3 / (distance + 1);
              }

              if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) {
                targetY -= 1 * hM * 16;
              }
              if (slot === 0 && hoveredSlot > centerSlot) {
                targetY -= 1 * hM * 16;
              }
            }
          } else {
            delay = Math.abs(slot - centerSlot) * 0.02;
          }

          window.gsap.to(el, {
            x: targetX,
            y: targetY,
            rotation: targetRot,
            scale: targetScale,
            duration: 0.5,
            delay: delay,
            ease: "elastic.out(1,.75)",
            overwrite: "auto",
          });
          window.gsap.set(el, { zIndex: base.zIndex });
        });
      }

      visibleEntries.forEach(({ el, slot }) => {
        el.onmouseenter = () => {
          if (isAnimating) return;
          if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
          if (activeSlot !== slot) {
            activeSlot = slot;
            updateHoverLayout(slot);
          }
        };
      });

      container.onmouseleave = () => {
        if (isAnimating) return;
        if (leaveTimer) clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => {
          activeSlot = null;
          updateHoverLayout(null);
        }, 50);
      };
    }

    renderDots();
    renderLayout();

    window.addEventListener("resize", () => {
      if (!isAnimating) renderLayout();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCardFanCarousel);
  } else {
    initCardFanCarousel();
  }
})();
