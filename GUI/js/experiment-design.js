const API_BASE = "http://localhost:3001";

import { fetchModels, fetchInits, fillSelect } from "./experiment-data.js";
import { ConversionManager } from "./conversions.js";
import { generateExperimentJsonFromGraph, attachInitEditors, initCouplingButtons } from "./experiment-actions.js";
import { buildInitEditorForCoupled } from "./experiment-init-editor.js";

export function setupExperimentSidebar(graph) {
  const cm = new ConversionManager(graph);
  
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

  const toggleMutInitBtn = document.getElementById("toggleMutInitBtn");
  const toggleEfInitBtn  = document.getElementById("toggleEfInitBtn");

  const editors = attachInitEditors({ cm, mutModelSelect, efModelSelect });
  
  toggleMutInitBtn?.addEventListener("click", () => {
    mutInitEditorEl?.classList.toggle("hidden");
  });

  toggleEfInitBtn?.addEventListener("click", () => {
    efInitEditorEl?.classList.toggle("hidden");
  });
  // indicator should live ONLY in properties tab
  const selectIndicator = document.getElementById("selectACellIndicator");

  if (!propsTab || !expTab || !propsBtn || !expBtn) {
    console.warn("Tab elements missing (propertiesTab/experimentTab/tab buttons)");
    return;
  }

  function getAllVerticesRecursive(graph) {
    const model = graph.getModel();
    const root = graph.getDefaultParent();
    const out = [];

    const walk = (parent) => {
      const kids = model.getChildCells(parent, true, false) || []; // vertices only
      for (const c of kids) {
        out.push(c);
        walk(c); // recurse into groups
      }
    };

    walk(root);
    return out;
  }

  function getAllDevsModelsFromGraph(graph) {
    return getAllVerticesRecursive(graph)
      .filter(c => c?.isCoupledModel?.())
      .map(c => ({
        id: c.userObject?.unique_id ?? c.getId(),
        name: c.userObject?.model_name ?? String(c.value ?? c.getId())
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const refreshModelsOnly = () => {

    const mutPrev = mutModelSelect?.value || "";
    const efPrev  = efModelSelect?.value || "";

    const allModels = getAllDevsModelsFromGraph(graph);
    fillSelect(mutModelSelect, allModels, { placeholder: "Select MUT model..." });
    fillSelect(efModelSelect, allModels, { placeholder: "Select EF model..." });

     // restore selection if still present
    if ([...mutModelSelect.options].some(o => o.value === mutPrev)) {
      mutModelSelect.value = mutPrev;
    }
    if ([...efModelSelect.options].some(o => o.value === efPrev)) {
      efModelSelect.value = efPrev;
    }
      
    //renderMutInitEditor?.();
    //renderEfInitEditor?.();
    
  };

  // Refresh when graph model changes (add/remove/rename/etc.)
  graph.getModel().addListener(mxEvent.CHANGE, () => {
    if (document.getElementById("experimentTab")?.classList.contains("active")) {
      refreshModelsOnly();
    }
  });

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
      
        //const [inits] = await Promise.all([fetchInits()]);

        const mutPrev = mutModelSelect?.value || "";
        const efPrev  = efModelSelect?.value || "";

        const allModels = getAllDevsModelsFromGraph(graph);

        fillSelect(mutModelSelect, allModels, { placeholder: "Select MUT model..." });
        fillSelect(efModelSelect, allModels, { placeholder: "Select EF model..." });
        fillSelect(mutInitSelect, [], { placeholder: "Select MUT init..." });
        fillSelect(efInitSelect, [], { placeholder: "Select EF init..." });

        // restore selection if still present
        if ([...mutModelSelect.options].some(o => o.value === mutPrev)) {
        mutModelSelect.value = mutPrev;
        }
        if ([...efModelSelect.options].some(o => o.value === efPrev)) {
        efModelSelect.value = efPrev;
        }

        //renderMutInitEditor?.();
        //renderEfInitEditor?.();
 
      try {
      } catch (e) {
        console.error("Failed to load experiment dropdowns:", e);
        if (out) out.textContent = `Error loading experiment data:\n${String(e)}`;
      }
  }

    if (isProps) {
    window.populateRightPalette?.();
    }

    if (!isProps) {
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

  initCouplingButtons(cm);

  // default
  activateTab("properties");

  if (genExpJsonBtn) {
  genExpJsonBtn.addEventListener("click", () =>
    generateExperimentJsonFromGraph({
      cm,
      expNameInput,
      mutModelSelect,
      efModelSelect,
      timeSpanInput,
      out,
      getMutInitBuilder: editors.getMutInitBuilder,
      getEfInitBuilder: editors.getEfInitBuilder
    })
  );
}
  if (runExpBtn) {
    runExpBtn.addEventListener("click", () => runExperiment());
  }

 

  // init editor containers
  const mutInitEditorEl = document.getElementById("mutInitEditor");
  const efInitEditorEl  = document.getElementById("efInitEditor");

  // store “builder functions” so generateExperimentJson can call them
  let buildMutInitJson = null;
  let buildEfInitJson  = null;
  const initOverrides = new Map(); // uid -> init_json

  function renderMutInitEditor() {
    const uid = mutModelSelect?.value || "";
    if (!uid || !mutInitEditorEl) return;

    buildMutInitJson = buildInitEditorForCoupled(cm, uid, mutInitEditorEl);
    updateCouplingDropdownOptions();
  }

  function renderEfInitEditor() {
    const uid = efModelSelect?.value || "";
    if (!uid || !efInitEditorEl) return;

    buildEfInitJson = buildInitEditorForCoupled(cm, uid, efInitEditorEl);
    updateCouplingDropdownOptions();
  }

  // whenever model selection changes, rebuild editor
  mutModelSelect?.addEventListener("change", renderMutInitEditor);
  efModelSelect?.addEventListener("change", renderEfInitEditor);

  function getCoupledPortsByUid(uid) {
  const uos = cm.getUserObjects();
  const coupled = uos.find(u => u.elementType === "coupledModel" &&
    u.unique_id?.toLowerCase() === String(uid).toLowerCase()
  );
  if (!coupled) return { inputs: [], outputs: [] };

  const x = coupled.json?.model?.x || {};
  const y = coupled.json?.model?.y || {};
  return {
    inputs: Object.keys(x),
    outputs: Object.keys(y),
  };
}

function updateCouplingDropdownOptions() {
  const mutUid = mutModelSelect?.value || "";
  const efUid  = efModelSelect?.value || "";

  const mutPorts = mutUid ? getCoupledPortsByUid(mutUid) : {inputs:[], outputs:[]};
  const efPorts  = efUid  ? getCoupledPortsByUid(efUid)  : {inputs:[], outputs:[]};

  // CPIC: ef.outputs -> mut.inputs
  window.__CPIC_FROM_OPTIONS = efPorts.outputs;
  window.__CPIC_TO_OPTIONS   = mutPorts.inputs;

  // POCC: mut.outputs -> ef.inputs
  window.__POCC_FROM_OPTIONS = mutPorts.outputs;
  window.__POCC_TO_OPTIONS   = efPorts.inputs;

  // tell coupling UI to re-render options if you can
  window.refreshCouplingUI?.();
}

mutModelSelect?.addEventListener("change", updateCouplingDropdownOptions);
efModelSelect?.addEventListener("change", updateCouplingDropdownOptions);


}
