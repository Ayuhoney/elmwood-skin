/**
 * Portfolios, Process, Testimonials & Services Interactive Animations
 * Based on skin/assets/js/main.js with GSAP ScrollTrigger and Swiper
 */

(function () {
  "use strict";

  // Register GSAP plugins safely
  function getGsap() {
    if (typeof window.gsap !== "undefined") {
      if (typeof window.ScrollTrigger !== "undefined") {
        window.gsap.registerPlugin(window.ScrollTrigger);
      }
      return window.gsap;
    }
    return null;
  }

  // 1. Data Background Images
  function initBgImages() {
    try {
      var bgElements = document.querySelectorAll("[data-bg-image]");
      bgElements.forEach(function (el) {
        var bg = el.getAttribute("data-bg-image");
        if (bg) {
          el.style.backgroundImage = "url('" + bg + "')";
        }
      });
    } catch (e) {
      console.warn("initBgImages error:", e);
    }
  }

  // 2. Portfolios Works Pin & ScrollSlider (Matches skin initPortfoliosSlider)
  function initPortfoliosSlider() {
    try {
      const gsap = getGsap();
      if (!gsap || typeof window.ScrollTrigger === "undefined") {
        console.warn("GSAP / ScrollTrigger not loaded for initPortfoliosSlider");
        return;
      }

      const h1PortfoliosWrap = document.querySelector(".pxn-h1_portfolios_wrap");
      if (!h1PortfoliosWrap) return;

      const mediaMatch = gsap.matchMedia ? gsap.matchMedia() : null;

      const setupSlider = function () {
        const portfoliosTitle = gsap.utils.toArray(
          h1PortfoliosWrap.querySelectorAll(".subtitle_list > .subtitle")
        );
        const portfoliosItems = gsap.utils.toArray(
          h1PortfoliosWrap.querySelectorAll(".portfolios_card .pxn-h1_portfolio_item")
        );
        const portfolioCard = h1PortfoliosWrap.querySelector(".portfolios_card");
        const portfolioImage = h1PortfoliosWrap.querySelector(".portfolio_images_wrap > .portfolio_img");

        if (!portfoliosItems.length || !portfolioCard) return;

        let activeIndex = -1;

        const getItemImage = function (index) {
          const image = portfoliosItems[index] && portfoliosItems[index].querySelector(".portfolio_image img");
          return (image && (image.getAttribute("src") || image.currentSrc)) || "";
        };

        const setPortfolioBg = function (index) {
          if (!portfolioImage) return;
          const imageSrc = getItemImage(index);
          if (!imageSrc) return;
          portfolioImage.setAttribute("data-bg-image", imageSrc);
          portfolioImage.style.backgroundImage = 'url("' + imageSrc + '")';
        };

        const setActiveClass = function (index) {
          portfoliosTitle.forEach(function (subtitle, subtitleIndex) {
            if (subtitleIndex === index) {
              subtitle.classList.add("active");
            } else {
              subtitle.classList.remove("active");
            }
          });
        };

        const setActivePortfolio = function (index) {
          if (index === activeIndex) return;
          activeIndex = index;
          setActiveClass(activeIndex);

          portfoliosItems.forEach(function (item, itemIndex) {
            gsap.to(item, {
              autoAlpha: itemIndex === activeIndex ? 1 : 0,
              y: itemIndex === activeIndex ? 0 : 60,
              duration: 0.45,
              ease: "power2.out",
              overwrite: true,
            });
          });

          if (portfolioImage) {
            const imageSrc = getItemImage(activeIndex);
            if (imageSrc) {
              portfolioImage.setAttribute("data-bg-image", imageSrc);
              gsap.to(portfolioImage, {
                autoAlpha: 0.75,
                duration: 0.18,
                ease: "power1.out",
                overwrite: true,
                onComplete: function () {
                  portfolioImage.style.backgroundImage = 'url("' + imageSrc + '")';
                  gsap.to(portfolioImage, {
                    autoAlpha: 1,
                    duration: 0.3,
                    ease: "power1.out",
                    overwrite: true,
                  });
                },
              });
            }
          }
        };

        const setPortfolioCardHeight = function () {
          let maxItemHeight = 0;
          portfoliosItems.forEach(function (item) {
            if (item.offsetHeight > maxItemHeight) {
              maxItemHeight = item.offsetHeight;
            }
          });
          if (maxItemHeight > 0) {
            portfolioCard.style.minHeight = maxItemHeight + "px";
          }
        };

        portfolioCard.style.position = "relative";
        setPortfolioCardHeight();

        portfoliosItems.forEach(function (item, index) {
          gsap.set(item, {
            position: "absolute",
            width: "100%",
            left: 0,
            top: 0,
            y: index === 0 ? 0 : 60,
            autoAlpha: index === 0 ? 1 : 0,
          });
        });

        setActivePortfolio(0);

        const scrollSteps = Math.max(portfoliosItems.length - 1, 1);
        const portfoliosTrigger = window.ScrollTrigger.create({
          trigger: h1PortfoliosWrap,
          start: "top top",
          end: function () {
            return "+=" + (scrollSteps * window.innerHeight);
          },
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: portfoliosItems.length > 1 ? 1 / (portfoliosItems.length - 1) : 1,
            duration: { min: 0.15, max: 0.35 },
            ease: "power1.inOut",
          },
          onUpdate: function (self) {
            const nextIndex = Math.round(self.progress * (portfoliosItems.length - 1));
            setActivePortfolio(gsap.utils.clamp(0, portfoliosItems.length - 1, nextIndex));
          },
          onRefresh: setPortfolioCardHeight,
        });

        portfoliosTitle.forEach(function (subtitle, index) {
          subtitle.addEventListener("click", function () {
            if (portfoliosTrigger) {
              const targetProgress = index / (portfoliosItems.length - 1);
              const scrollPosition =
                portfoliosTrigger.start +
                targetProgress * (portfoliosTrigger.end - portfoliosTrigger.start);

              window.scrollTo({
                top: scrollPosition + 2,
                behavior: "smooth",
              });
            } else {
              setActivePortfolio(index);
            }
          });
        });

        return function () {
          portfoliosTrigger.kill();
          gsap.killTweensOf([portfolioImage].concat(portfoliosItems));
          portfolioCard.removeAttribute("style");
          portfoliosItems.forEach(function (item) { item.removeAttribute("style"); });
          activeIndex = -1;
          setActiveClass(0);
          setPortfolioBg(0);
        };
      };

      if (mediaMatch) {
        mediaMatch.add("(min-width: 768px)", function () {
          return setupSlider();
        });
      } else if (window.innerWidth >= 768) {
        setupSlider();
      }
    } catch (e) {
      console.warn("initPortfoliosSlider error:", e);
    }
  }

  // 3. Process Section (Patient Journey) Pin & Sequential Active on Scroll (Matches skin initH1ProcessActive)
  function initProcessSection() {
    try {
      const gsap = getGsap();
      const processWrapper = document.querySelector(".pxn-h1_process_wrapper");
      if (!processWrapper) return;

      const processItems = (gsap && gsap.utils)
        ? gsap.utils.toArray(processWrapper.querySelectorAll(".pxn_process_item"))
        : Array.from(processWrapper.querySelectorAll(".pxn_process_item"));

      if (!processItems.length) return;

      const setActiveThrough = function (activeIndex) {
        processItems.forEach(function (item, index) {
          if (index <= activeIndex) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      };

      setActiveThrough(0);

      // Hover interaction anytime
      processItems.forEach(function (item, idx) {
        item.addEventListener("mouseenter", function () {
          setActiveThrough(idx);
        });
      });

      // ScrollTrigger pinning on desktop
      if (gsap && typeof window.ScrollTrigger !== "undefined" && window.innerWidth >= 992) {
        const mediaMatch = gsap.matchMedia ? gsap.matchMedia() : null;

        const setupProcessScroll = function () {
          const processTrigger = window.ScrollTrigger.create({
            trigger: processWrapper,
            start: "top top+=70",
            end: function () {
              return "+=" + (Math.max(processItems.length - 1, 1) * window.innerHeight * 0.6);
            },
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: true,
            onUpdate: function (self) {
              const activeIndex = Math.round(self.progress * (processItems.length - 1));
              setActiveThrough(gsap.utils.clamp(0, processItems.length - 1, activeIndex));
            },
          });

          return function () {
            processTrigger.kill();
            setActiveThrough(0);
          };
        };

        if (mediaMatch) {
          mediaMatch.add("(min-width: 992px)", function () {
            return setupProcessScroll();
          });
        } else {
          setupProcessScroll();
        }
      }
    } catch (e) {
      console.warn("initProcessSection error:", e);
    }
  }

  // 4. Testimonials Carousel (Cards Effect Swiper) (Matches skin H2 Testimonial Carousel)
  function initTestimonialCarousel() {
    try {
      if (typeof window.Swiper === "undefined") {
        console.warn("Swiper not loaded for Testimonial Carousel");
        return;
      }
      const carouselEl = document.querySelector(".pxn-h2_testimonial_carousel");
      if (!carouselEl) return;

      // Click handler to jump to slides when numbers are clicked
      function makePaginationClickable(swiperInstance) {
        document.querySelectorAll(".pxn_slider-progress-pagination .page-item").forEach(function (button) {
          button.onclick = function () {
            const index = parseInt(this.getAttribute("data-index"), 10);
            if (!isNaN(index)) {
              swiperInstance.slideTo(index);
              if (swiperInstance.autoplay && swiperInstance.autoplay.start) {
                swiperInstance.autoplay.start();
              }
            }
          };
        });
      }

      function setAutoPlayDuration(swiperInstance) {
        const delay = (swiperInstance.params && swiperInstance.params.autoplay && swiperInstance.params.autoplay.delay) || 4000;
        document.documentElement.style.setProperty("--autoplay-delay", delay + "ms");
      }

      const swiper = new window.Swiper(".pxn-h2_testimonial_carousel", {
        effect: "cards",
        cardsEffect: {
          rotate: true,
          perSlideRotate: 4,
          slideShadows: false,
        },
        grabCursor: true,
        loop: false,
        speed: 550,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        breakpoints: {
          0: {
            cardsEffect: {
              perSlideRotate: 2,
            },
          },
          576: {
            cardsEffect: {
              perSlideRotate: 3,
            },
          },
          992: {
            cardsEffect: {
              perSlideRotate: 6,
            },
          },
          1200: {
            cardsEffect: {
              perSlideRotate: 10,
            },
          },
        },
        pagination: {
          el: ".pxn_slider-progress-pagination",
          type: "custom",
          renderCustom: function (swiperInstance, current, total) {
            let html = "";
            for (let i = 1; i <= total; i++) {
              let paddedNumber = i < 10 ? "0" + i : i;
              let activeClass = i === current ? "is-active" : "";

              html += '<div class="page-item ' + activeClass + '" data-index="' + (i - 1) + '">' +
                '<span class="page-num">' + paddedNumber + '</span>' +
                (i === current ? '<div class="custom-progress-bar"><div class="progress-fill"></div></div>' : "") +
                '</div>';
            }
            return html;
          },
        },
        on: {
          init: function () {
            makePaginationClickable(this);
            setAutoPlayDuration(this);
          },
          slideChange: function () {
            makePaginationClickable(this);
            setAutoPlayDuration(this);
          },
        },
      });

      window.pxnTestimonialSwiper = swiper;
    } catch (e) {
      console.warn("initTestimonialCarousel error:", e);
    }
  }

  // 5. Services Carousel (Creative 3D Rotation Swiper + GSAP Scroll Pinning) (Matches skin H3 Services)
  function initServicesCarousel() {
    try {
      if (typeof window.Swiper === "undefined") {
        console.warn("Swiper not loaded for Services Carousel");
        return;
      }
      const carouselEl = document.querySelector(".pxn-h3_services_carousel");
      if (!carouselEl) return;

      const isMobile = window.innerWidth < 768;

      const swiper = new window.Swiper(".pxn-h3_services_carousel", {
        effect: "creative",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 1,
        loop: false,
        speed: 600,
        autoplay: isMobile ? {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false,
        pagination: {
          el: ".pxn_slider-pagination",
          clickable: true,
        },
        creativeEffect: {
          prev: {
            shadow: false,
            rotate: [0, 0, -10],
            opacity: 0.35,
          },
          next: {
            shadow: false,
            rotate: [0, 0, 10],
            opacity: 0.35,
          },
        },
        breakpoints: {
          0: {
            creativeEffect: {
              prev: { rotate: [0, 0, -5] },
              next: { rotate: [0, 0, 5] },
            },
          },
          768: {
            creativeEffect: {
              prev: { rotate: [0, 0, -10] },
              next: { rotate: [0, 0, 10] },
            },
          },
        },
      });

      window.h3ServicesCarousel = swiper;

      // ScrollSlider on desktop
      const gsap = getGsap();
      if (gsap && typeof window.ScrollTrigger !== "undefined") {
        const servicesSection = document.querySelector(".pxn-h3-services-section");
        if (servicesSection) {
          const mediaMatch = gsap.matchMedia ? gsap.matchMedia() : null;

          const setupServicesScroll = function () {
            const slides = carouselEl.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)");
            const totalSlides = slides.length;
            if (totalSlides <= 1) return;

            const scrollSteps = totalSlides - 1;
            let activeSlide = 0;

            const servicesTrigger = window.ScrollTrigger.create({
              trigger: servicesSection,
              start: "top top",
              end: function () {
                return "+=" + (scrollSteps * (window.innerHeight * 0.75));
              },
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              snap: {
                snapTo: 1 / scrollSteps,
                duration: { min: 0.2, max: 0.4 },
                ease: "power1.inOut",
              },
              onUpdate: function (self) {
                const nextIndex = gsap.utils.clamp(
                  0,
                  totalSlides - 1,
                  Math.round(self.progress * scrollSteps)
                );
                if (nextIndex !== activeSlide) {
                  activeSlide = nextIndex;
                  if (window.h3ServicesCarousel) {
                    window.h3ServicesCarousel.slideTo(activeSlide, 600);
                  }
                }
              },
            });

            if (window.h3ServicesCarousel) {
              window.h3ServicesCarousel.on("slideChange", function () {
                activeSlide = window.h3ServicesCarousel.activeIndex;
              });
            }

            return function () {
              servicesTrigger.kill();
            };
          };

          if (mediaMatch) {
            mediaMatch.add("(min-width: 768px)", function () {
              return setupServicesScroll();
            });
          } else if (window.innerWidth >= 768) {
            setupServicesScroll();
          }
        }
      }
    } catch (e) {
      console.warn("initServicesCarousel error:", e);
    }
  }

  // 6. Background Parallax (Matches skin initPxnBgParallax)
  function initPxnBgParallax() {
    try {
      const gsap = getGsap();
      if (!gsap || typeof window.ScrollTrigger === "undefined") return;

      const items = gsap.utils.toArray(".pxn-img-parallax");
      if (!items.length) return;

      items.forEach(function (el) {
        const speed = parseFloat(el.dataset.speed) || 40;
        const zoom = parseFloat(el.dataset.zoom) || 1.15;

        gsap.set(el, {
          backgroundPosition: "50% 0%",
          scale: 1,
        });

        gsap.to(el, {
          backgroundPosition: "50% " + speed + "%",
          scale: zoom,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    } catch (e) {
      console.warn("initPxnBgParallax error:", e);
    }
  }

  // 7. Fade-in animations for .pxn-fade elements
  function initFadeAnimations() {
    try {
      const gsap = getGsap();
      if (!gsap || typeof window.ScrollTrigger === "undefined") return;

      const fadeItems = gsap.utils.toArray(".pxn-fade");
      fadeItems.forEach(function (item) {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 35 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    } catch (e) {
      console.warn("initFadeAnimations error:", e);
    }
  }

  function initAll() {
    initBgImages();
    initPxnBgParallax();
    initPortfoliosSlider();
    initProcessSection();
    initTestimonialCarousel();
    initServicesCarousel();
    initFadeAnimations();

    if (typeof window.ScrollTrigger !== "undefined") {
      setTimeout(function () {
        window.ScrollTrigger.refresh();
      }, 300);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.addEventListener("load", function () {
    if (typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.refresh();
    }
  });
})();
