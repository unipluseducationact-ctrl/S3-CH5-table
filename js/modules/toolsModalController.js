// =============================================================================
// Tools Modal Controller - Feature modal and chemistry tool card wiring
// =============================================================================

export function createToolsModalController(options = {}) {
  const { getToolContent, attachToolEventListeners } = options;

  let modalHandlersInitialized = false;
  let chemToolCardsInitialized = false;

  function closeToolModal() {
    const featureModal = document.getElementById("feature-modal");
    if (!featureModal) return;
    featureModal.classList.remove("active");
    document.body.classList.remove("hide-nav");
  }

  function initFeatureModalHandlers() {
    if (modalHandlersInitialized) return;

    const featureModal = document.getElementById("feature-modal");
    const featureModalClose = document.getElementById("feature-modal-close");

    if (featureModalClose) {
      featureModalClose.addEventListener("click", closeToolModal);
    }

    if (featureModal) {
      featureModal.addEventListener("click", (e) => {
        if (window._zperiodIsDragging) return;
        if (e.target === featureModal) closeToolModal();
      });
    }

    modalHandlersInitialized = true;
  }

  function openToolModal(toolType) {
    const featureModal = document.getElementById("feature-modal");
    const featureModalBody = document.getElementById("feature-modal-body");
    if (!featureModal || !featureModalBody || typeof getToolContent !== "function") {
      return;
    }

    const content = getToolContent(toolType) || "";
    if (!content) return;

    featureModalBody.innerHTML = content;
    featureModal.classList.add("active");
    document.body.classList.add("hide-nav");

    if (typeof attachToolEventListeners === "function") {
      requestAnimationFrame(() => {
        attachToolEventListeners(toolType);
      });
    }
  }

  function initChemToolCards() {
    if (chemToolCardsInitialized) return;

    const toolCards = document.querySelectorAll(".chem-tool-card");
    if (toolCards.length === 0) return;

    toolCards.forEach((card) => {
      card.addEventListener("click", () => {
        const toolType = card.getAttribute("data-tool");
        openToolModal(toolType);
      });
    });

    chemToolCardsInitialized = true;
  }

  function init() {
    initFeatureModalHandlers();
    initChemToolCards();
  }

  return {
    init,
    initChemToolCards,
    openToolModal,
    closeToolModal,
  };
}
