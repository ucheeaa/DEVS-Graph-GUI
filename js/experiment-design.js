export function setupExperimentModal() {
    
  const openBtn = document.getElementById("previewDesignExperimentBtn");
  const modal = document.getElementById("experimentModal");
  const closeBtn = document.getElementById("closeExperimentModalBtn");

  if (!openBtn || !modal || !closeBtn) {
    console.warn("Experiment modal elements missing");
    return;
  }

  const open = () => modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  // Close when clicking the dark backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  // Close with ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) close();
  });

  // Prevent mxGraph zoom while scrolling inside modal
  modal.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    { passive: false }
  );
}