/**
 * WorksWheel - 3D Drum & Ring Portfolio / Treatment Showcase
 * Pure vanilla JavaScript implementation with requestAnimationFrame DOM rendering.
 */
(function () {
  "use strict";

  function initWorksWheel() {
    const stageEl = document.getElementById("works-wheel-stage");
    const drumEl = document.getElementById("works-wheel-drum");
    const labelEl = document.getElementById("works-wheel-label");
    const titleEl = document.getElementById("works-wheel-title");
    const indexEl = document.getElementById("works-wheel-index");

    if (!stageEl || !drumEl) return;

    const cards = Array.from(drumEl.querySelectorAll(".works-wheel-card"));
    const count = cards.length;
    if (count === 0) return;
    const last = Math.max(count - 1, 0);

    // Geometry constants - increased card size and stage dimensions
    const CARD_H = 0.46; // front card height, ratio of stage height (increased from 0.38)
    const CARD_MAX_W = 0.38; // max card width ratio of stage width (increased from 0.34)
    const CARD_RATIO = 1.45; // card width / height
    const STEP = 40; // degrees between cards on the drum
    const DRUM = 2.18; // drum radius in card heights
    const LENS = 2.7; // perspective distance
    const RING_R = 0.84; // ring radius (tuned to maximize card size without clipping in 800px stage)
    const BOW = 1.82; // arc radius pushing neighbours to the left
    const TITLE = 0.124; // title font size ratio of card height
    const INDEX = 0.042; // index font size ratio of card height
    const CULL = 1.6; // distance threshold past which cards are culled

    const WHEEL_UNITS = 900;
    const DRAG_UNITS = 420;
    const SETTLE = 140;
    const EASE = 0.12;

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const rad = (deg) => (deg * Math.PI) / 180;
    const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

    function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
      return (
        "translateX(" + (m * bowAt(drumDeg, bow)).toFixed(2) + "px) " +
        "rotateZ(" + ((1 - m) * ringDeg).toFixed(2) + "deg) " +
        "translateY(" + (-(1 - m) * ringR).toFixed(2) + "px) " +
        "rotateX(" + (m * drumDeg).toFixed(2) + "deg) " +
        "translateZ(" + (m * drumR).toFixed(2) + "px)"
      );
    }

    let turn = 0;
    let target = 0;
    let active = 0;
    let settlingTimer = 0;
    let reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Get item data
    const items = cards.map((c) => ({
      title: c.getAttribute("data-title") || c.querySelector("img")?.alt || "Treatment",
      href: c.getAttribute("href") || "#"
    }));

    let stageW = stageEl.clientWidth || 1000;
    let stageH = stageEl.clientHeight || 650;

    function getMetrics() {
      const cardW = Math.min(stageH * CARD_H * CARD_RATIO, stageW * CARD_MAX_W);
      const cardH = cardW / CARD_RATIO;
      const drumR = cardH * DRUM;
      const ringR = cardH * RING_R;
      const ringScale = count
        ? clamp((((2 * Math.PI * ringR) / count) * 0.98) / (cardW || 1), 0.22, 1)
        : 1;

      return {
        cardW,
        cardH,
        ringR,
        ringScale,
        drumR,
        bow: cardH * BOW,
        depth: cardH * LENS,
        title: cardH * TITLE,
        index: cardH * INDEX
      };
    }

    let metrics = getMetrics();

    function updateMetrics() {
      stageW = stageEl.clientWidth || 1000;
      stageH = stageEl.clientHeight || 650;
      if (!stageH) return;
      metrics = getMetrics();

      stageEl.style.perspective = metrics.depth.toFixed(1) + "px";

      cards.forEach((card) => {
        card.style.width = metrics.cardW.toFixed(1) + "px";
        card.style.height = metrics.cardH.toFixed(1) + "px";
        card.style.marginLeft = (-metrics.cardW / 2).toFixed(1) + "px";
        card.style.marginTop = (-metrics.cardH / 2).toFixed(1) + "px";
      });

      if (labelEl) {
        labelEl.style.fontSize = Math.max(22, metrics.title).toFixed(1) + "px";
      }
      if (titleEl) {
        titleEl.style.fontSize = Math.max(24, metrics.title).toFixed(1) + "px";
      }
      if (indexEl) {
        indexEl.style.fontSize = Math.max(13, metrics.index).toFixed(1) + "px";
      }
    }

    // Resize observer
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(updateMetrics);
      ro.observe(stageEl);
    } else {
      window.addEventListener("resize", updateMetrics);
    }
    updateMetrics();

    function to(next) {
      target = clamp(next, 0, last + 1);
    }

    // Build right index buttons
    if (indexEl) {
      indexEl.innerHTML = "";
      items.forEach((item, i) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = item.title;
        btn.setAttribute("data-index", i);
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          to(i + 1);
        });
        li.appendChild(btn);
        indexEl.appendChild(li);
      });
    }

    const indexBtns = indexEl ? Array.from(indexEl.querySelectorAll("button")) : [];

    function setActiveState(near) {
      if (active === near) return;
      active = near;
      if (titleEl && items[active]) {
        titleEl.textContent = items[active].title;
      }
      indexBtns.forEach((btn, idx) => {
        if (idx === active) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    if (titleEl && items[0]) titleEl.textContent = items[0].title;
    if (indexBtns[0]) indexBtns[0].classList.add("active");

    // Animation Loop
    function frame() {
      requestAnimationFrame(frame);
      const gap = target - turn;
      if (Math.abs(gap) < 0.0005) {
        turn = target;
      } else {
        turn += gap * (reduced ? 1 : EASE);
      }

      const t = turn;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);
      const { ringR, ringScale, drumR, bow } = metrics;

      drumEl.style.transform = "translateZ(" + (-m * drumR).toFixed(2) + "px)";

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cards[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m
          );
          // Smooth opacity falloff: active front card is 100% visible,
          // while neighbors fade smoothly into the background before reaching the edge
          let cardOpacity = 1;
          if (m > 0.05) {
            const dist = Math.abs(d);
            if (dist <= 0.35) {
              cardOpacity = 1;
            } else if (dist >= 1.25) {
              cardOpacity = 0;
            } else {
              cardOpacity = 0.5 * (1 + Math.cos(Math.PI * ((dist - 0.35) / 0.9)));
            }
          }
          card.style.opacity = cardOpacity.toFixed(3);
          card.style.pointerEvents = cardOpacity > 0.4 ? "auto" : "none";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
          const face = card.firstElementChild;
          if (face) {
            face.style.transform = "scale(" + lerp(ringScale, 1, m).toFixed(4) + ")";
          }
        }
      }

      if (labelEl) labelEl.style.opacity = (1 - m).toFixed(3);
      if (titleEl) titleEl.style.opacity = m.toFixed(3);

      const near = clamp(Math.round(pos), 0, last);
      setActiveState(near);
    }

    requestAnimationFrame(frame);

    // Wheel listener (passive: false to prevent body scroll only while wheel is active)
    stageEl.addEventListener(
      "wheel",
      function (e) {
        const next = target + e.deltaY / WHEEL_UNITS;
        if (next > 0 && next < last + 1) {
          e.preventDefault();
        }
        to(next);
        window.clearTimeout(settlingTimer);
        settlingTimer = window.setTimeout(function () {
          to(Math.round(target));
        }, SETTLE);
      },
      { passive: false }
    );

    // Pointer drag
    let dragY = null;
    stageEl.addEventListener("pointerdown", function (e) {
      dragY = e.clientY;
      try {
        stageEl.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    stageEl.addEventListener("pointermove", function (e) {
      if (dragY === null) return;
      to(target + (dragY - e.clientY) / DRAG_UNITS);
      dragY = e.clientY;
    });

    function onPointerEnd() {
      dragY = null;
      if (target > 1) to(Math.round(target));
    }
    stageEl.addEventListener("pointerup", onPointerEnd);
    stageEl.addEventListener("pointercancel", onPointerEnd);

    // Keyboard support
    stageEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        to(Math.round(target) + 1);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        to(Math.round(target) - 1);
        e.preventDefault();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorksWheel);
  } else {
    initWorksWheel();
  }
})();
