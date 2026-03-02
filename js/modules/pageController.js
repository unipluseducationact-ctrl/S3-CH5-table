// =============================================================================
// Page Controller - Main page switching and global nav state
// =============================================================================

export function initPageController(options = {}) {
  const { onTablePageShown, onToolsPageShown } = options;

  const mainContainer = document.getElementById("main-container");
  const blankPage1 = document.getElementById("blank-page-1");
  const blankPage2 = document.getElementById("blank-page-2");
  const ionsPage = document.getElementById("ions-page");
  const settingsPage = document.getElementById("settings-page");

  let currentPage = "table";

  const pages = {
    table: () => {
      if (mainContainer) mainContainer.style.display = "";
    },
    ions: () => {
      if (ionsPage) ionsPage.style.display = "flex";
    },
    blank1: () => {
      if (blankPage1) blankPage1.classList.add("active");
    },
    blank2: () => {
      if (blankPage2) blankPage2.classList.add("active");
    },
    settings: () => {
      if (settingsPage) settingsPage.classList.add("active");
    },
  };

  function hideAllPages() {
    if (mainContainer) mainContainer.style.display = "none";
    if (blankPage1) blankPage1.classList.remove("active");
    if (blankPage2) blankPage2.classList.remove("active");
    if (ionsPage) ionsPage.style.display = "none";
    if (settingsPage) settingsPage.classList.remove("active");
  }

  function showPage(page) {
    if (!pages[page] || currentPage === page) return;

    hideAllPages();
    pages[page]();
    currentPage = page;

    if (page === "table" && typeof onTablePageShown === "function") {
      requestAnimationFrame(onTablePageShown);
    }

    if (page === "blank1" && typeof onToolsPageShown === "function") {
      onToolsPageShown();
    }
  }

  const globalNavBtns = document.querySelectorAll(".nav-pill-btn, .nav-logo-link, .nav-brand");
  const navPageMap = {
    table: "table",
    ions: "ions",
    tools: "blank1",
    worksheet: "blank2",
    settings: "settings",
  };

  function updateGlobalNavActive(activePage) {
    globalNavBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === activePage);
    });
    moveSliderTo(activePage);
  }

  // ── Sliding pill indicator ──
  const pillContainer = document.querySelector(".global-nav-pill");
  const pillBtns = pillContainer ? pillContainer.querySelectorAll(".nav-pill-btn") : [];
  let slider = null;

  function createSlider() {
    if (!pillContainer || pillBtns.length === 0) return;
    slider = document.createElement("div");
    slider.className = "nav-pill-slider";
    pillContainer.appendChild(slider);
    // Position on initial active button without animation
    const activeBtn = pillContainer.querySelector(".nav-pill-btn.active");
    if (activeBtn) {
      const containerRect = pillContainer.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      slider.style.transition = "none";
      slider.style.width = btnRect.width + "px";
      slider.style.transform = `translateX(${btnRect.left - containerRect.left}px)`;
      // Re-enable transition after paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slider.style.transition = "";
        });
      });
    }
  }

  function moveSliderTo(page) {
    if (!slider || !pillContainer) return;
    const targetBtn = pillContainer.querySelector(`.nav-pill-btn[data-page="${page}"]`);
    if (!targetBtn) return;
    const containerRect = pillContainer.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();
    slider.style.width = btnRect.width + "px";
    slider.style.transform = `translateX(${btnRect.left - containerRect.left}px)`;
  }

  createSlider();

  // Recalculate slider position on resize
  window.addEventListener("resize", () => {
    if (!slider) return;
    const activeBtn = pillContainer.querySelector(".nav-pill-btn.active");
    if (activeBtn) {
      const containerRect = pillContainer.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      slider.style.transition = "none";
      slider.style.width = btnRect.width + "px";
      slider.style.transform = `translateX(${btnRect.left - containerRect.left}px)`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slider.style.transition = "";
        });
      });
    }
  });

  globalNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      const target = navPageMap[page];
      if (!target) return;
      showPage(target);
      updateGlobalNavActive(page);
    });
  });

  updateGlobalNavActive("table");

  return {
    showPage,
    updateGlobalNavActive,
    getCurrentPage: () => currentPage,
  };
}
