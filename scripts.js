document.addEventListener("DOMContentLoaded", () => {
  // Par64 Tungsten Light Simulator & Stateful Interactions
  const canvas = document.createElement("canvas");
  canvas.id = "interactive-canvas";
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      document
        .querySelectorAll(".page-transition-clone")
        .forEach((el) => el.remove());
      // Re-trigger the page fade in and background CSS animations if desired,
      // or just remove the clones, so the page is visible and active again.
    }
  });

  let mouse = { x: width / 2, y: height / 2 };
  let isDown = false;
  let isHoveringBlock = false;
  let releaseTime = 0;
  let mouseOnPage = true;
  let glowHeat = 0.45;

  // State persistence across pages
  let hasInteracted = sessionStorage.getItem("analogInteracted") === "true";
  let heat = 0; // Represents the tungsten glow (0.0 to 1.0)

  let savedHeat = parseFloat(sessionStorage.getItem("analogHeat"));
  let savedTime = parseInt(sessionStorage.getItem("analogTime"));
  if (!isNaN(savedHeat) && !isNaN(savedTime) && savedHeat > 0) {
    let elapsedMs = Date.now() - savedTime;
    let heatLoss = (elapsedMs / 16) * 0.0035; // simulate frame drop decay
    heat = Math.max(0, savedHeat - heatLoss);

    let savedX = parseFloat(sessionStorage.getItem("analogX"));
    let savedY = parseFloat(sessionStorage.getItem("analogY"));
    if (!isNaN(savedX) && !isNaN(savedY)) {
      mouse.x = savedX;
      mouse.y = savedY;
    }
  }

  // Restore selector state if present
  const fixtureSelector = document.getElementById("fixture-selector");
  if (fixtureSelector) {
    const savedFixture = sessionStorage.getItem("analogFixture");
    if (savedFixture) {
      fixtureSelector.value = savedFixture;
    }
    fixtureSelector.addEventListener("mousedown", (e) => e.stopPropagation());
    fixtureSelector.addEventListener("change", () => {
      sessionStorage.setItem("analogFixture", fixtureSelector.value);
      ctx.clearRect(0, 0, width, height);
      idleFrames = 0;
      heat = Math.max(heat, cursorBaseline);
      glowHeat = cursorBaseline;
    });
  }

  // Save state on navigation
  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("analogInteracted", hasInteracted.toString());
    sessionStorage.setItem("analogHeat", heat.toString());
    sessionStorage.setItem("analogX", mouse.x.toString());
    sessionStorage.setItem("analogY", mouse.y.toString());
    sessionStorage.setItem("analogTime", Date.now().toString());
    if (fixtureSelector) {
      sessionStorage.setItem("analogFixture", fixtureSelector.value);
    }
  });

  // Track interactions
  const markInteraction = () => {
    hasInteracted = true;
  };

  window.addEventListener("mousedown", (e) => {
    isDown = true;
    markInteraction();
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    glowHeat = Math.max(glowHeat, cursorBaseline);
  });
  window.addEventListener("mouseup", () => {
    isDown = false;
    releaseTime = Date.now();
  });
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseOnPage = true;
    glowHeat = Math.max(glowHeat, cursorBaseline);
    markInteraction();
  });
  document.addEventListener("mouseleave", () => {
    mouseOnPage = false;
  });
  document.addEventListener("mouseenter", () => {
    mouseOnPage = true;
    glowHeat = Math.max(glowHeat, cursorBaseline);
  });

  // Touch support
  window.addEventListener(
    "touchstart",
    (e) => {
      isDown = true;
      markInteraction();
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      glowHeat = Math.max(glowHeat, cursorBaseline);
    },
    { passive: true },
  );
  window.addEventListener("touchend", () => {
    isDown = false;
    releaseTime = Date.now();
  });
  window.addEventListener(
    "touchmove",
    (e) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      glowHeat = Math.max(glowHeat, cursorBaseline);
    },
    { passive: true },
  );

  // Block Hover bindings
  document.querySelectorAll("a, button, .manga-tile").forEach((el) => {
    el.addEventListener("click", (e) => {
      heat = 1.0;
      markInteraction();

      const href = el.getAttribute("href");
      // Apply the expanding transition if it's a manga-tile navigating to a new page
      if (el.classList.contains("manga-tile") && href && href !== "#") {
        e.preventDefault();

        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true);
        clone.classList.add("page-transition-clone");
        document.body.appendChild(clone);

        clone.style.pointerEvents = "none";
        clone.style.position = "fixed";
        clone.style.top = rect.top + "px";
        clone.style.left = rect.left + "px";
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        clone.style.zIndex = "999999";
        clone.style.margin = "0";
        clone.style.transition = "all 0.5s cubic-bezier(0.8, 0, 0.2, 1)";

        const img = clone.querySelector(".placeholder-img");
        if (img) {
          img.style.transition = "opacity 0.5s ease";
        }

        // Force reflow
        clone.getBoundingClientRect();

        // Expand to fill the screen while dimming to black
        clone.style.top = "0px";
        clone.style.left = "0px";
        clone.style.width = "100vw";
        clone.style.height = "100vh";
        clone.style.backgroundColor = "black";
        clone.style.borderColor = "black";

        if (img) {
          img.style.opacity = "0";
        }

        setTimeout(() => {
          window.location.href = href;
        }, 500);
      } else if (
        (el.classList.contains("back") || el.classList.contains("nav-logo")) &&
        href &&
        href !== "#"
      ) {
        e.preventDefault();

        const overlay = document.createElement("div");
        overlay.classList.add("page-transition-clone");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "black";
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.4s ease";
        overlay.style.zIndex = "999999";
        overlay.style.pointerEvents = "none";
        document.body.appendChild(overlay);

        // Force reflow
        overlay.getBoundingClientRect();
        overlay.style.opacity = "1";

        setTimeout(() => {
          window.location.href = href;
        }, 400);
      }
    });
    el.addEventListener("mouseenter", () => {
      isHoveringBlock = true;
      markInteraction();
    });
    el.addEventListener("mouseleave", () => {
      isHoveringBlock = false;
    });
  });

  // Tungsten color decay profile
  function mixColor(c1, c2, t) {
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t),
      a: c1.a + (c2.a - c1.a) * t,
    };
  }

  const colors = [
    { r: 0, g: 0, b: 0, a: 0 }, // 0: Off / Darkness
    { r: 40, g: 5, b: 0, a: 0.1 }, // 1: Very dim red residual glow (slightly darker)
    { r: 200, g: 50, b: 5, a: 0.4 }, // 2: Deep analog orange (slightly darker)
    { r: 255, g: 160, b: 40, a: 0.8 }, // 3: Warm yellow-orange wash
    { r: 255, g: 190, b: 100, a: 1.0 }, // 4: Blinding hot, slightly warmer in color
  ];

  function getColor(h) {
    if (h <= 0) return colors[0];
    if (h >= 1) return colors[4];
    let scaled = h * (colors.length - 1);
    let index = Math.min(Math.floor(scaled), colors.length - 2);
    let t = scaled - index;
    return mixColor(colors[index], colors[index + 1], t);
  }

  let currentRadiusMultiplier = 0.2;
  let targetRadius = 0.2;
  let idleFrames = 0;
  const cursorBaseline = 0.45;
  const afterglowHoldMs = 1800;

  function drawGlow(intensity, radiusMultiplier) {
    if (intensity <= 0) return;

    const core = getColor(intensity);
    const activeFixture = sessionStorage.getItem("analogFixture") || "par64";
    let bulbs = [];
    let baseR = Math.max(width, height) * radiusMultiplier;

    if (activeFixture === "2-cell") {
      let r = baseR * 0.45;
      bulbs.push({ dx: -r, dy: 0, r: r });
      bulbs.push({ dx: r, dy: 0, r: r });
    } else if (activeFixture === "4-cell") {
      let r = baseR * 0.4;
      let s = r * 1.1;
      bulbs.push({ dx: -s, dy: -s, r: r });
      bulbs.push({ dx: s, dy: -s, r: r });
      bulbs.push({ dx: -s, dy: s, r: r });
      bulbs.push({ dx: s, dy: s, r: r });
    } else if (activeFixture === "fourbar") {
      let r = baseR * 0.5;
      let s = r * 1.2;
      bulbs.push({ dx: -s * 1.5, dy: 0, r: r });
      bulbs.push({ dx: -s * 0.5, dy: 0, r: r });
      bulbs.push({ dx: s * 0.5, dy: 0, r: r });
      bulbs.push({ dx: s * 1.5, dy: 0, r: r });
    } else if (activeFixture === "svoboda") {
      let r = baseR * 0.18;
      let colSpacing = r * 2.1;
      let rowSpacing = r * 1.8;
      [-2, -1, 0, 1, 2].forEach((col) => {
        bulbs.push({ dx: col * colSpacing, dy: -rowSpacing / 2, r: r, isSvoboda: true });
      });
      [-1.5, -0.5, 0.5, 1.5].forEach((col) => {
        bulbs.push({ dx: col * colSpacing, dy: rowSpacing / 2, r: r, isSvoboda: true });
      });
    } else {
      bulbs.push({ dx: 0, dy: 0, r: baseR });
    }

    ctx.globalCompositeOperation = "screen";

    bulbs.forEach((b) => {
      const innerRadius = b.r * 0.05;
      const grad = ctx.createRadialGradient(
        mouse.x + b.dx,
        mouse.y + b.dy,
        innerRadius,
        mouse.x + b.dx,
        mouse.y + b.dy,
        b.r,
      );

      const cr = Math.floor(core.r);
      const cg = Math.floor(core.g);
      const cb = Math.floor(core.b);

      if (b.isSvoboda) {
        grad.addColorStop(0, `rgba(0, 0, 0, ${core.a})`);
        grad.addColorStop(0.15, `rgba(${cr}, ${cg}, ${cb}, ${core.a})`);
        grad.addColorStop(0.3, `rgba(${cr}, ${cg}, ${cb}, ${core.a * 0.6})`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      } else {
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${core.a})`);
        grad.addColorStop(0.3, `rgba(${cr}, ${cg}, ${cb}, ${core.a * 0.6})`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });
  }

  // Main render loop
  function render() {
    // 1. CLEARING LOGIC
    // Use destination-out to create trails.
    // We only hard clear (clearRect) after the light has been off for a moment
    // to ensure all trails have faded naturally without snapping.
    if (mouseOnPage) {
      glowHeat = Math.max(glowHeat, cursorBaseline);
    }

    const visibleHeat = Math.max(heat, glowHeat);

    if (visibleHeat <= 0.001 && idleFrames > 5) {
      ctx.clearRect(0, 0, width, height);
    } else {
      ctx.globalCompositeOperation = "destination-out";
      const fadeSpeed = heat <= 0.01 ? 0.13 : 0.045;
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeSpeed})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (visibleHeat <= 0.001) {
      idleFrames++;
    } else {
      idleFrames = 0;
    }

    let currentTargetRadiusMultiplier = targetRadius;

    // Heat and Radius Physics
    if (!hasInteracted) {
      let time = Date.now() * 0.002;
      mouse.x = width / 2 + Math.sin(time * 0.7) * (width * 0.15);
      mouse.y = height / 2 + Math.cos(time * 0.5) * (height * 0.15);
      heat = 0.25 + Math.sin(time * 1.5) * 0.1;
      currentTargetRadiusMultiplier = 0.1;
    } else {
      if (isDown) {
        heat += 0.04;
        if (heat > 1) heat = 1;
        // smaller in size when clicking
        targetRadius = 0.08 + heat * 0.1;
        currentTargetRadiusMultiplier = targetRadius;
      } else if (isHoveringBlock) {
        if (heat > 0.4) heat = Math.max(0.4, heat - 0.008);
        else if (heat < 0.4) heat = Math.min(0.4, heat + 0.008);
        targetRadius = 0.11;
        currentTargetRadiusMultiplier = targetRadius;
      } else {
        const timeSinceRelease = Date.now() - releaseTime;
        if (mouseOnPage) {
          if (timeSinceRelease < afterglowHoldMs) {
            heat = Math.max(0, heat - 0.002);
          } else {
            heat = Math.max(0, heat - 0.01);
          }
          glowHeat = cursorBaseline;
        } else {
          glowHeat = Math.max(0, glowHeat - 0.02);
          heat = Math.max(0, heat - 0.015);
        }
        targetRadius = 0.1;
        currentTargetRadiusMultiplier = targetRadius;
      }
    }

    currentRadiusMultiplier +=
      (currentTargetRadiusMultiplier - currentRadiusMultiplier) * 0.03;

    drawGlow(Math.max(heat, glowHeat), currentRadiusMultiplier);

    requestAnimationFrame(render);
  }

  render();
});

// -------------
// Project Image Lightbox Carousel
const lightboxOverlay = document.createElement("div");
lightboxOverlay.id = "lightbox-overlay";
lightboxOverlay.innerHTML = `
  <div class="lightbox-close">✕</div>
  <div class="lightbox-prev">←</div>
  <img src="" class="lightbox-img" />
  <div class="lightbox-next">→</div>
`;
document.body.appendChild(lightboxOverlay);

let carouselImages = [];
let carouselIndex = 0;

function showCarouselImage(index) {
  carouselIndex = (index + carouselImages.length) % carouselImages.length;
  lightboxOverlay.querySelector("img").src = carouselImages[carouselIndex];
}

document.addEventListener("click", (e) => {
  let imgBox = e.target.closest(".interlock-item");
  if (imgBox) {
    let img = imgBox.querySelector("img");
    if (img) {
      const grid = imgBox.closest(".interlock-grid");
      if (grid) {
        carouselImages = Array.from(grid.querySelectorAll("img")).map(
          (i) => i.src,
        );
        carouselIndex = carouselImages.indexOf(img.src);

        lightboxOverlay.querySelector("img").src =
          carouselImages[carouselIndex];
        lightboxOverlay.style.display = "flex";
        lightboxOverlay.getBoundingClientRect(); // reflow
        lightboxOverlay.style.opacity = "1";
      }
    }
  }
});

lightboxOverlay.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("lightbox-close") ||
    e.target === lightboxOverlay
  ) {
    lightboxOverlay.style.opacity = "0";
    setTimeout(() => {
      lightboxOverlay.style.display = "none";
    }, 300);
  } else if (e.target.classList.contains("lightbox-prev")) {
    showCarouselImage(carouselIndex - 1);
  } else if (e.target.classList.contains("lightbox-next")) {
    showCarouselImage(carouselIndex + 1);
  }
});

document.addEventListener("keydown", (e) => {
  if (lightboxOverlay.style.display === "flex") {
    if (e.key === "ArrowLeft") {
      showCarouselImage(carouselIndex - 1);
    } else if (e.key === "ArrowRight") {
      showCarouselImage(carouselIndex + 1);
    } else if (e.key === "Escape") {
      lightboxOverlay.style.opacity = "0";
      setTimeout(() => {
        lightboxOverlay.style.display = "none";
      }, 300);
    }
  }
});

// Swipe Support
let touchStartX = 0;
let touchEndX = 0;

lightboxOverlay.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].screenX;
  },
  { passive: true },
);

lightboxOverlay.addEventListener(
  "touchend",
  (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) showCarouselImage(carouselIndex + 1);
    if (touchEndX > touchStartX + 50) showCarouselImage(carouselIndex - 1);
  },
  { passive: true },
);
