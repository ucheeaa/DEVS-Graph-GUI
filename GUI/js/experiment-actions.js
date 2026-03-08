
import { buildInitEditorForCoupled } from "./experiment-init-editor.js"; 
// OR paste that whole init-editor code directly into this file.

function getUserObjectByUid(cm, elementType, uid) {
  const uos = cm.getUserObjects();
  return uos.find(
    u =>
      u.elementType === elementType &&
      u.unique_id?.toLowerCase() === String(uid).toLowerCase()
  );
}

function normalizeComponents(components) {
  if (Array.isArray(components)) return components;
  if (components && typeof components === "object") {
    return Object.entries(components).map(([model, id]) => ({ model, id }));
  }
  return [];
}

function buildAtomicJsonFromUserObject(atomic) {
  const modelName = atomic.model_name.toLowerCase();

  const atomicJson = {
    [modelName]: { ...atomic.json.model },
    include_sets: atomic.json.include_sets,
    parameters: atomic.json.parameters
  };

  // convert s: { var: {data_type, init_state} } -> { var: "type" }
  const s = atomicJson[modelName].s || {};
  for (const [k, v] of Object.entries(s)) {
    s[k] = v.data_type;
  }

  return {
    filename: `${atomic.unique_id.toLowerCase()}_atomic.json`,
    json: atomicJson
  };
}

function buildCoupledJsonFromUserObject(coupled) {
  const modelName = coupled.model_name.toLowerCase();
  const uid = coupled.unique_id.toLowerCase();

  const modelCopy = JSON.parse(JSON.stringify(coupled.json.model));

  // convert internal component_id -> exported id
  if (Array.isArray(modelCopy.components)) {
    modelCopy.components = modelCopy.components.map(c => ({
      model: c.model,
      id: c.component_id
    }));
  }

  return {
    filename: `${uid}_coupled.json`,
    json: {
      [modelName]: modelCopy,
      include_sets: coupled.json.include_sets
    }
  };
}

function addCoupledAndItsAtomicsToBundle(bundle, cm, coupledUid) {
  const coupled = getUserObjectByUid(cm, "coupledModel", coupledUid);
  if (!coupled) {
    throw new Error(`Coupled model not found: ${coupledUid}`);
  }

  // add coupled json
  const coupledFile = buildCoupledJsonFromUserObject(coupled);
  bundle[coupledFile.filename] = coupledFile.json;

  // add all atomic component jsons used by this coupled
  const comps = normalizeComponents(coupled.json?.model?.components);
  for (const comp of comps) {
    const atomic = getUserObjectByUid(cm, "atomicModel", comp.component_id);
    if (!atomic) {
      throw new Error(`Atomic component not found for id: ${comp.component_id}`);
    }

    const atomicFile = buildAtomicJsonFromUserObject(atomic);
    bundle[atomicFile.filename] = atomicFile.json;
  }
}

export async function generateExperimentJsonFromGraph({
  cm,
  expNameInput,
  mutModelSelect,
  efModelSelect,
  timeSpanInput,
  out,
  getMutInitBuilder,
  getEfInitBuilder
}) {
  const expName = (expNameInput?.value || "").trim();
  const mutUid = mutModelSelect?.value || "";
  const efUid = efModelSelect?.value || "";
  const timeSpanRaw = (timeSpanInput?.value || "").trim();

  const missing = [];
  if (!expName) missing.push("Experiment Name");
  if (!mutUid) missing.push("MUT Model");
  if (!efUid) missing.push("EF Model");
  if (!timeSpanRaw) missing.push("Time Span");

  if (missing.length) {
    const msg = `Please fill: ${missing.join(", ")}`;
    if (out) out.textContent = msg;
    return null;
  }

  const timeSpan = Number(timeSpanRaw);
  if (!Number.isFinite(timeSpan) || timeSpan <= 0) {
    if (out) out.textContent = "Time Span must be a positive number.";
    return null;
  }

  const cpic = readCouplingRows("cpicList"); // EF output -> MUT input
  const pocc = readCouplingRows("poccList"); // MUT output -> EF input

  if (cpic.length === 0 && pocc.length === 0) {
    if (out) {
      out.textContent =
        "Add at least one coupling (CPIC or POCC) to connect the EF and MUT.";
    }
    return null;
  }

  const buildMutInitJson = getMutInitBuilder?.();
  const buildEfInitJson = getEfInitBuilder?.();

  const mutInitObj = buildMutInitJson ? buildMutInitJson() : null;
  const efInitObj = buildEfInitJson ? buildEfInitJson() : null;

  if (!mutInitObj) {
    if (out) out.textContent = "Select a MUT model and ensure its init fields are valid.";
    return null;
  }

  if (!efInitObj) {
    if (out) out.textContent = "Select an EF model and ensure its init fields are valid.";
    return null;
  }

  const safeName = safeFilename(expName);

  const expFilename = `${safeName}_experiment.json`;
  const mutInitFilename = `${safeName}_mut_init_state.json`;
  const efInitFilename = `${safeName}_ef_init_state.json`;

  const experiment = {
    model_under_test: {
      model: `${mutUid.toLowerCase()}_coupled.json`,
      initial_state: mutInitFilename,
      parameters: ""
    },
    experimental_frame: {
      model: `${efUid.toLowerCase()}_coupled.json`,
      initial_state: efInitFilename,
      parameters: ""
    },
    cpic,
    pocc,
    time_span: String(timeSpan)
  };

  // ✅ build one portable experiment bundle
  const bundle = {};

  // add selected coupled models + their atomic components
  addCoupledAndItsAtomicsToBundle(bundle, cm, mutUid);
  addCoupledAndItsAtomicsToBundle(bundle, cm, efUid);

  // add init files
  bundle[mutInitFilename] = mutInitObj;
  bundle[efInitFilename] = efInitObj;

  // add experiment file
  bundle[expFilename] = experiment;

  // preview just experiment.json
  if (out) out.textContent = JSON.stringify(experiment, null, 2);

  // download the full bundle as ONE json
  const bundleFilename = `${safeName}_experiment_bundle.json`;
  downloadJson(bundleFilename, bundle);
  try {
    if (out) out.textContent += "\n\nSending bundle to parser...";

    const parseRes = await fetch("http://localhost:8000/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bundle)
    });

    if (!parseRes.ok) {
      throw new Error(`Parser request failed: ${await parseRes.text()}`);
    }

    const generatedCode = await parseRes.json();

    if (out) out.textContent += "\nParser finished. Running simulation...";

    const buildRes = await fetch("http://localhost:8001/simulation-output", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(generatedCode)
    });

    if (!buildRes.ok) {
      throw new Error(`Simulation build failed: ${await buildRes.text()}`);
    }

    const simulationOutput = await buildRes.text();

    if (out) {
      out.textContent += "\n\n===== Simulation Output =====\n";
      out.textContent += simulationOutput;
    }

  } catch (err) {
    console.error(err);
    if (out) out.textContent += `\n\nError: ${err.message}`;
  }

  return { experiment, bundle };
}

function safeFilename(name) {
  if (!name) return "experiment";

  return name
    .trim()
    .replace(/\s+/g, "_")        // spaces → _
    .replace(/[^a-zA-Z0-9_.-]/g, "") // remove weird chars
    || "experiment";
}


//Download JSON file
  export function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
    const blobURL = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(blobURL);
}

export function attachInitEditors({ cm, mutModelSelect, efModelSelect }) {
  const mutInitEditorEl = document.getElementById("mutInitEditor");
  const efInitEditorEl  = document.getElementById("efInitEditor");

  let buildMutInitJson = null;
  let buildEfInitJson  = null;

  function renderMut() {
    if (!mutInitEditorEl) return;

    const uid = mutModelSelect?.value || "";
    mutInitEditorEl.innerHTML = "";

    if (!uid) {
      mutInitEditorEl.classList.add("hidden");
      buildMutInitJson = null;
      return;
    }

    mutInitEditorEl.classList.remove("hidden");
    buildMutInitJson = buildInitEditorForCoupled(cm, uid, mutInitEditorEl);
  }

  function renderEf() {
    if (!efInitEditorEl) return;

    const uid = efModelSelect?.value || "";
    efInitEditorEl.innerHTML = "";

    if (!uid) {
      efInitEditorEl.classList.add("hidden");
      buildEfInitJson = null;
      return;
    }

    efInitEditorEl.classList.remove("hidden");
    buildEfInitJson = buildInitEditorForCoupled(cm, uid, efInitEditorEl);
  }

  mutModelSelect?.addEventListener("change", renderMut);
  efModelSelect?.addEventListener("change", renderEf);

  return {
    getMutInitBuilder: () => buildMutInitJson,
    getEfInitBuilder: () => buildEfInitJson,
    rerenderAll: () => {
      renderMut();
      renderEf();
    }
  };
}

export function insertCouplingRow(listId, emptyId, fromPorts, toPorts) {
  const list = document.getElementById(listId);
  const empty = document.getElementById(emptyId);
  if (empty) empty.style.display = "none";

  const row = document.createElement("div");
  row.className = "coupling-row";

  const fromSel = document.createElement("select");
  fromPorts.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    fromSel.appendChild(opt);
  });

  const arrow = document.createElement("div");
  arrow.className = "arrow";
  arrow.textContent = "→";

  const toSel = document.createElement("select");
  toPorts.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    toSel.appendChild(opt);
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-row";
  removeBtn.textContent = "×";
  removeBtn.addEventListener("click", () => {
    row.remove();
    if (list.querySelectorAll(".coupling-row").length === 0 && empty) {
      empty.style.display = "block";
    }
  });

  row.appendChild(fromSel);
  row.appendChild(arrow);
  row.appendChild(toSel);
  row.appendChild(removeBtn);

  list.appendChild(row);

  // return the selects if you want to read values later
  return { fromSel, toSel };
}

export function ensureModelsSelectedForCoupling() {
  const mut = getVal("mutModelSelect");
  const ef = getVal("efModelSelect");

  if (!mut || mut === "Select MUT model..." || mut === "none") {
    showExperimentMessage("Please select a MUT Model before adding couplings.");
    return false;
  }
  if (!ef || ef === "Select EF model..." || ef === "none") {
    showExperimentMessage("Please select an EF Model before adding couplings.");
    return false;
  }
  return true;
}



// -----------------------------
// Helpers: DOM + small utilities
// -----------------------------
export function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function getCoupledPortsByUid(cm, uid) {
  const uos = cm.getUserObjects();
  const coupled = uos.find(u =>
    u.elementType === "coupledModel" &&
    u.unique_id?.toLowerCase() === String(uid).toLowerCase()
  );
  if (!coupled) return { inputs: [], outputs: [] };

  const x = coupled.json?.model?.x || {};
  const y = coupled.json?.model?.y || {};

  return { inputs: Object.keys(x), outputs: Object.keys(y) };
}

// -----------------------------
// Main: wire up +Add buttons
// CPIC: EF output -> MUT input
// POCC: MUT output -> EF input
// -----------------------------
export function handleAddCpic(cm) {
  if (!ensureModelsSelectedForCoupling()) return;

  const mutUid = getVal("mutModelSelect");
  const efUid  = getVal("efModelSelect");

  const mutPorts = getCoupledPortsByUid(cm, mutUid);
  const efPorts  = getCoupledPortsByUid(cm, efUid);

  // CPIC = EF outputs -> MUT inputs
  const efOutputs = efPorts.outputs || [];
  const mutInputs = mutPorts.inputs || [];

  if (!efOutputs.length) return showExperimentMessage("EF has no output ports (y).");
  if (!mutInputs.length) return showExperimentMessage("MUT has no input ports (x).");

  insertCouplingRow("cpicList", "cpicEmpty", efOutputs, mutInputs);
}

export function handleAddPocc(cm) {
  if (!ensureModelsSelectedForCoupling()) return;

  const mutUid = getVal("mutModelSelect");
  const efUid  = getVal("efModelSelect");

  const mutPorts = getCoupledPortsByUid(cm, mutUid);
  const efPorts  = getCoupledPortsByUid(cm, efUid);

  // POCC = MUT outputs -> EF inputs
  const mutOutputs = mutPorts.outputs || [];
  const efInputs   = efPorts.inputs || [];

  if (!mutOutputs.length) return showExperimentMessage("MUT has no output ports (y).");
  if (!efInputs.length)   return showExperimentMessage("EF has no input ports (x).");

  insertCouplingRow("poccList", "poccEmpty", mutOutputs, efInputs);
}
// Call this once after DOM is ready / tab is initialized
export function initCouplingButtons(cm) {
  const addCpicBtn = document.getElementById("addCpicBtn");
  const addPoccBtn = document.getElementById("addPoccBtn");

  if (addCpicBtn && !addCpicBtn.dataset.bound) {
    addCpicBtn.addEventListener("click", () => handleAddCpic(cm));
    addCpicBtn.dataset.bound = "1";
  }

  if (addPoccBtn && !addPoccBtn.dataset.bound) {
    addPoccBtn.addEventListener("click", () => handleAddPocc(cm));
    addPoccBtn.dataset.bound = "1";
  }
}

function showExperimentMessage(msg) {
  const out = document.getElementById("experimentOutput");
  if (out) out.textContent = msg;
}

export function readCouplingRows(listId) {
  const list = document.getElementById(listId);
  if (!list) return [];

  const rows = list.querySelectorAll(".coupling-row");
  const couplings = [];

  rows.forEach(row => {
    const selects = row.querySelectorAll("select");
    if (selects.length < 2) return;

    const from = selects[0].value; // from port
    const to   = selects[1].value; // to port

    if (from && to) {
      couplings.push({ port_from: from, port_to: to });
    }
  });

  return couplings;
}


  // return a "save" function that produces the init JSON
  export function buildInitJsonFromEditor() {
    // block save if any invalid
    if (containerEl.querySelector(".has-error")) {
      throw new Error("Fix invalid init values before saving.");
    }

    const coupledKey = coupledUid.toLowerCase();
    const out = { init_states: { [coupledKey]: {} } };

    for (const e of editors) {
      const compKey = e.componentId.toLowerCase();
      out.init_states[coupledKey][compKey] ??= {};
      // keep values as strings (matches your current init file style)
      out.init_states[coupledKey][compKey][e.varName] = String(e.input.value).trim();
    }

    return out;
  };



