/**
 * Hijbullah Portfolio - Vanilla JS Engine
 * High performance, zero React dependency, low data consumption.
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCursor();
  initParticles();
  initTyping();
  initModalsAndDrawers();
  initProjectFilters();
  initCopyToClipboard();
  initScrollToTop();
});

/* ── Theme Management ────────────────────────────── */
function initTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("portfolio_theme") || "dark";
  applyTheme(savedTheme);

  const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.classList.contains("light") ? "light" : "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("portfolio_theme", next);
    });
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  const moonIcons = document.querySelectorAll(".theme-icon-moon");
  const sunIcons = document.querySelectorAll(".theme-icon-sun");

  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
    moonIcons.forEach((el) => el.classList.remove("hidden"));
    sunIcons.forEach((el) => el.classList.add("hidden"));
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
    moonIcons.forEach((el) => el.classList.add("hidden"));
    sunIcons.forEach((el) => el.classList.remove("hidden"));
  }
}

/* ── Precision Custom Cursor ────────────────────────────── */
function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  // Smooth lerp for outer ring
  function animateRing() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // Hover detection
  const interactiveSelector = "a, button, [role='button'], input, textarea, select, .cursor-pointer";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add("hovered-interactive");
    } else {
      document.body.classList.remove("hovered-interactive");
    }
  }, { passive: true });
}

/* ── Optimized Particle Background ────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animId = null;
  let inView = true;

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 16 : 32;

  function resize() {
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Pause when scrolled out of view to save battery & data
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView && !animId) render();
  }, { threshold: 0.05 });
  observer.observe(canvas);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.size = Math.random() * 1.5 + 1;
      this.opacity = Math.random() * 0.4 + 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function render() {
    if (!inView) {
      animId = null;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.12 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(render);
  }
  render();
}

/* ── Typing Animation ────────────────────────────── */
function initTyping() {
  const el = document.getElementById("typing-text");
  if (!el) return;

  const text = el.getAttribute("data-text") || el.innerText;
  el.innerText = "";
  let idx = 0;

  function typeNext() {
    if (idx < text.length) {
      el.textContent += text.charAt(idx);
      idx++;
      setTimeout(typeNext, 60);
    }
  }
  setTimeout(typeNext, 400);
}

/* ── Modals & Drawers ────────────────────────────── */
function initModalsAndDrawers() {
  // Generic modal openers
  document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.getAttribute("data-modal-target");
      openModal(targetId);
    });
  });

  // Generic modal closers
  document.querySelectorAll("[data-modal-close]").forEach((closer) => {
    closer.addEventListener("click", () => {
      const modal = closer.closest(".modal-backdrop") || closer.closest(".drawer");
      if (modal) closeModal(modal);
    });
  });

  // Backdrop click
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.open, .drawer.open").forEach(closeModal);
    }
  });

  // Mobile menu drawer
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("open");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(modalElement) {
  if (!modalElement) return;
  modalElement.classList.remove("open");
  if (modalElement.classList.contains("drawer")) {
    modalElement.classList.remove("open");
  }
  setTimeout(() => {
    if (!modalElement.classList.contains("open")) {
      modalElement.classList.add("hidden");
    }
  }, 250);
  document.body.style.overflow = "";
}

/* ── Project Page Live Search & Filter ────────────────────────────── */
function initProjectFilters() {
  const searchInput = document.getElementById("project-search");
  const filterBtns = document.querySelectorAll(".project-filter-btn");
  const projectCards = document.querySelectorAll(".project-item-card");
  const noProjectsMsg = document.getElementById("no-projects-message");

  if (!projectCards.length) return;

  let currentCategory = "All";
  let currentSearch = "";

  function applyFilters() {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const title = card.getAttribute("data-title")?.toLowerCase() || "";
      const desc = card.getAttribute("data-desc")?.toLowerCase() || "";
      const tags = card.getAttribute("data-tags")?.toLowerCase() || "";
      const isFeatured = card.getAttribute("data-featured") === "true";

      const matchesSearch = title.includes(currentSearch) || desc.includes(currentSearch) || tags.includes(currentSearch);

      let matchesCat = true;
      if (currentCategory === "Featured") {
        matchesCat = isFeatured;
      } else if (currentCategory !== "All") {
        matchesCat = tags.includes(currentCategory.toLowerCase());
      }

      if (matchesSearch && matchesCat) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (noProjectsMsg) {
      noProjectsMsg.classList.toggle("hidden", visibleCount > 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("active", "bg-gradient-to-r", "from-cyan-500", "to-emerald-500", "text-white");
        b.classList.add("bg-white/70", "dark:bg-white/5", "text-slate-600", "dark:text-slate-300");
      });
      btn.classList.add("active", "bg-gradient-to-r", "from-cyan-500", "to-emerald-500", "text-white");
      btn.classList.remove("bg-white/70", "dark:bg-white/5", "text-slate-600", "dark:text-slate-300");

      currentCategory = btn.getAttribute("data-category") || "All";
      applyFilters();
    });
  });
}

/* ── Copy to Clipboard ────────────────────────────── */
function initCopyToClipboard() {
  document.querySelectorAll("[data-copy-text]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy-text");
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = "✓ Copied!";
        btn.classList.add("bg-emerald-500", "text-white");
        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove("bg-emerald-500", "text-white");
        }, 2000);
      });
    });
  });
}

/* ── Scroll to Top ────────────────────────────── */
function initScrollToTop() {
  const scrollBtn = document.getElementById("scroll-top-btn");
  if (!scrollBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 350) {
      scrollBtn.classList.remove("opacity-0", "pointer-events-none", "translate-y-2");
      scrollBtn.classList.add("opacity-100", "translate-y-0");
    } else {
      scrollBtn.classList.add("opacity-0", "pointer-events-none", "translate-y-2");
      scrollBtn.classList.remove("opacity-100", "translate-y-0");
    }
  }, { passive: true });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
