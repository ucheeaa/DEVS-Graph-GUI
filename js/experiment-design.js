export function setupExperimentSidebar(graph) {
  // buttons
  const openBtn  = document.getElementById("previewDesignExperimentBtn");
  const closeBtn = document.getElementById("closeExperimentPanelBtn");

  const propsBtn = document.getElementById("tabPropertiesBtn");
  const expBtn   = document.getElementById("tabExperimentBtn");

  // panes
  const propsTab = document.getElementById("propertiesTab");
  const expTab   = document.getElementById("experimentTab");

  // experiment controls
  const mutModelSelect = document.getElementById("mutModelSelect");
  const efModelSelect  = document.getElementById("efModelSelect");
  const mutInitSelect  = document.getElementById("mutInitSelect");
  const efInitSelect   = document.getElementById("efInitSelect");

  // indicator should live ONLY in properties tab
  const selectIndicator = document.getElementById("selectACellIndicator");

  if (!propsTab || !expTab || !propsBtn || !expBtn) {
    console.warn("Tab elements missing (propertiesTab/experimentTab/tab buttons)");
    return;
  }

  function activateTab(which) {
    const isProps = which === "properties";

    // toggle button state
    propsBtn.classList.toggle("active", isProps);
    expBtn.classList.toggle("active", !isProps);

    // toggle panes
    propsTab.classList.toggle("active", isProps);
    expTab.classList.toggle("active", !isProps);

    // only show indicator in properties tab
    if (selectIndicator) {
      if (isProps) {
        selectIndicator.classList.remove("hidden");
        if (!selectIndicator.innerHTML.trim()) {
          selectIndicator.innerHTML = "<em>Select a single cell to edit properties</em>";
        }
      } else {
        selectIndicator.classList.add("hidden");
      }
    }

    // when entering experiment tab, refresh dropdowns
    if (!isProps) {
      // entering Experiment tab -> clear current graph selection
      // so next click on a model triggers a CHANGE event.
      graph.clearSelection();

      populateModelDropdowns(graph, mutModelSelect, efModelSelect);
      populateInitDropdowns(mutInitSelect, efInitSelect);
    }
  }

  window.setRightTab = activateTab;

  // tab clicks
  propsBtn.addEventListener("click", () => activateTab("properties"));
  expBtn.addEventListener("click", () => activateTab("experiment"));

  // open button takes you to experiment tab
  if (openBtn) openBtn.addEventListener("click", () => activateTab("experiment"));

  // close returns you to properties tab
  if (closeBtn) closeBtn.addEventListener("click", () => activateTab("properties"));

  // default
  activateTab("properties");
}