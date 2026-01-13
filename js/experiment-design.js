const API_BASE = "http://localhost:3001";

import { fetchModels, fetchInits, fillSelect } from "./experiment-data.js";
import { generateExperimentJson } from "./experiment-actions.js";

export function setupExperimentSidebar(graph) {
  // buttons
  const openBtn  = document.getElementById("previewDesignExperimentBtn");
  const closeBtn = document.getElementById("closeExperimentPanelBtn");

  const propsBtn = document.getElementById("tabPropertiesBtn");
  const expBtn   = document.getElementById("tabExperimentBtn");

  const genExpJsonBtn = document.getElementById("generateExperimentJsonBtn");
  const runExpBtn  = document.getElementById("runExperimentBtn");
  const out = document.getElementById("experimentOutput");

  // panes
  const propsTab = document.getElementById("propertiesTab");
  const expTab   = document.getElementById("experimentTab");

  // experiment controls
  const mutModelSelect = document.getElementById("mutModelSelect");
  const efModelSelect  = document.getElementById("efModelSelect");
  const mutInitSelect  = document.getElementById("mutInitSelect");
  const efInitSelect   = document.getElementById("efInitSelect");

  const expNameInput = document.getElementById("expName");
  const timeSpanInput = document.getElementById("timeSpanInput");

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

    async function refreshExperimentDropdowns() {
      try {
        const [allModels, inits] = await Promise.all([
          fetchModels(),
          fetchInits()
        ]);

        fillSelect(mutModelSelect, allModels, { placeholder: "Select MUT model..." });
        fillSelect(efModelSelect, allModels, { placeholder: "Select EF model..." });
        fillSelect(mutInitSelect, inits, { placeholder: "Select MUT init..." });
        fillSelect(efInitSelect, inits, { placeholder: "Select EF init..." });

      } catch (e) {
        console.error("Failed to load experiment dropdowns:", e);
        if (out) out.textContent = `Error loading experiment data:\n${String(e)}`;
      }
    }

    // when entering experiment tab, refresh dropdowns
    if (!isProps) {
      // entering Experiment tab -> clear current graph selection
      // so next click on a model triggers a CHANGE event.
      graph.clearSelection();
      fillSelect(mutModelSelect, [], { placeholder: "Loading MUT models..." });
      fillSelect(efModelSelect, [], { placeholder: "Loading EF models..." });
      fillSelect(mutInitSelect, [], { placeholder: "Loading init states..." });
      fillSelect(efInitSelect, [], { placeholder: "Loading init states..." });

      refreshExperimentDropdowns();
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

  if (genExpJsonBtn) {
    genExpJsonBtn.addEventListener("click", () => generateExperimentJson({
      expNameInput, 
      mutModelSelect, 
      efModelSelect, 
      mutInitSelect, 
      efInitSelect, 
      timeSpanInput, 
      out}));
  }

  if (runExpBtn) {
    runExpBtn.addEventListener("click", () => runExperiment());
  }

}