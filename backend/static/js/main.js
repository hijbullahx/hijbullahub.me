/**
 * HijbullahHub.me — Core JavaScript Engine
 * High-performance, zero heavy runtime, accessible, respects reduced motion.
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTyping();
  initModalsAndDrawers();
  initProjectFilters();
  initCopyToClipboard();
  initScrollToTop();
});

/* ── Theme Management ────────────────────────────────────────────────────── */
function initTheme() {
  const root = document.documentElement;
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("portfolio_theme") || "dark";
  } catch (e) {
    savedTheme = "dark";
  }
  applyTheme(savedTheme);

  const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.classList.contains("light") ? "light" : "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("portfolio_theme", next);
      } catch (e) {}
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

/* ── Typing Animation (Subtle & Resilient) ────────────────────────────────── */
function initTyping() {
  const el = document.getElementById("typing-text");
  if (!el) return;

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const text = el.getAttribute("data-text") || el.innerText;
    el.textContent = text;
    return;
  }

  const text = el.getAttribute("data-text") || el.innerText;
  el.innerText = "";
  let idx = 0;

  function typeNext() {
    if (idx < text.length) {
      el.textContent += text.charAt(idx);
      idx++;
      setTimeout(typeNext, 45);
    }
  }
  setTimeout(typeNext, 300);
}

/* ── Modals & Drawers Engine (100% Functionality Preserved) ───────────────── */
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

  // Backdrop click dismissal
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Escape key listener
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.open, .drawer.open").forEach(closeModal);
    }
  });

  // Mobile menu dropdown toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", !isExpanded);
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
  }, 220);
  document.body.style.overflow = "";
}

/* ── Project Page Live Search & Category Filter ──────────────────────────── */
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
        b.classList.remove("active", "bg-teal-500", "text-slate-950", "border-teal-500");
        b.classList.add("text-slate-400", "border-white/10");
      });
      btn.classList.add("active", "bg-teal-500", "text-slate-950", "border-teal-500");
      btn.classList.remove("text-slate-400", "border-white/10");

      currentCategory = btn.getAttribute("data-category") || "All";
      applyFilters();
    });
  });
}

/* ── Copy to Clipboard Helper ────────────────────────────────────────────── */
function initCopyToClipboard() {
  document.querySelectorAll("[data-copy-text]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy-text");
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = "✓ Copied";
        btn.classList.add("bg-teal-500", "text-slate-950");
        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove("bg-teal-500", "text-slate-950");
        }, 2000);
      });
    });
  });
}

// Global window helper for existing inline onclick handlers (e.g. in contact.html)
window.copyToClipboard = function(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const notifyEl = document.getElementById("primaryEmailText");
    if (notifyEl) {
      const original = notifyEl.innerText;
      notifyEl.innerText = "✓ Copied to clipboard!";
      setTimeout(() => {
        notifyEl.innerText = original;
      }, 2000);
    }
  });
};

/* ── Scroll to Top (Clean Floating Button) ───────────────────────────────── */
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
