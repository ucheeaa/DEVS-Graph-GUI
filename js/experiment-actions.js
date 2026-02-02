const API_BASE = "http://localhost:3001";
// const out = document.getElementById("experimentOutput");

export async function generateExperimentJson({ expNameInput, mutModelSelect, efModelSelect, mutInitSelect, efInitSelect, timeSpanInput, out}) {
    try{
        const expName = (expNameInput?.value || "").trim();
        const mutModel = mutModelSelect?.value || "";
        const efModel  = efModelSelect?.value || "";
        const mutInit  = mutInitSelect?.value || "";
        const efInit   = efInitSelect?.value || "";
        const timeSpanRaw = (timeSpanInput?.value || "").trim();

        const missing = [];
        if (!expName) missing.push("Experiment Name");
        if (!mutModel) missing.push("MUT Model");
        if (!mutInit) missing.push("MUT Initial State");
        if (!efModel) missing.push("EF Model");
        if (!efInit) missing.push("EF Initial State");
        if (!timeSpanRaw) missing.push("Time Span");

        if (missing.length) {
        const msg = `Please fill: ${missing.join(", ")}`;
        if (out) out.textContent = msg;
        return;
        }

        const timeSpan = Number(timeSpanRaw);
        if (!Number.isFinite(timeSpan) || timeSpan <= 0) {
        if (out) out.textContent = "Time Span must be a positive number.";
        return;
        }

        if (out) out.textContent = "Running experiment setup ...";

        const cpic = readCouplingRows("cpicList"); // EF output -> MUT input
        const pocc = readCouplingRows("poccList"); // MUT output -> EF input

        if (cpic.length === 0 && pocc.length === 0) {
            if (out) out.textContent =
                "Add at least one coupling (CPIC or POCC) to connect the EF and MUT.";
            return;
        }

        const payload = { expName, mutModel, efModel, mutInit, efInit, timeSpan, cpic, pocc };

        const r = await fetch(`${API_BASE}/api/experiment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!r.ok) throw new Error(await r.text());

        const data = await r.json();
        const experiment = data.experiment ?? data;

        const safeName = safeFilename(expName);
        const filename = `${safeName}_experiment.json`;

        if (out) out.textContent = JSON.stringify(experiment, null, 2);
        downloadJson(filename, experiment);

    }catch(e) {
        if (out) out.textContent = `Error:\n${String(e)}`;
        console.error(e);
    }
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
// Backend call: fetch ports
// Your backend returns: { inputs: [...], outputs: [...] }
// -----------------------------
export async function fetchPortsForModel(modelFileName) {
  const url = `${API_BASE}/api/ports?model=${encodeURIComponent(modelFileName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    let text = "";
    try { text = await res.text(); } catch {}
    throw new Error(`Failed to fetch ports (${res.status}). ${text}`);
  }
  return res.json();
}

// -----------------------------
// Helpers: DOM + small utilities
// -----------------------------
export function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

// -----------------------------
// Main: wire up +Add buttons
// CPIC: EF output -> MUT input
// POCC: MUT output -> EF input
// -----------------------------
export async function handleAddCpic() {
  if (!ensureModelsSelectedForCoupling()) return;

  const mutModel = getVal("mutModelSelect");
  const efModel  = getVal("efModelSelect");

  try {
    const [mutPorts, efPorts] = await Promise.all([
      fetchPortsForModel(mutModel),
      fetchPortsForModel(efModel)
    ]);

    // CPIC = EF output -> MUT input
    const efOutputs  = Array.isArray(efPorts.outputs) ? efPorts.outputs : [];
    const mutInputs  = Array.isArray(mutPorts.inputs) ? mutPorts.inputs : [];

    if (efOutputs.length === 0) {
      showExperimentMessage("EF model has no output ports (y). Cannot create CPIC coupling.");
      return;
    }
    if (mutInputs.length === 0) {
      showExperimentMessage("MUT model has no input ports (x). Cannot create CPIC coupling.");
      return;
    }

    insertCouplingRow("cpicList", "cpicEmpty", efOutputs, mutInputs);
  } catch (e) {
    showExperimentMessage(`Error adding CPIC: ${e.message}`);
  }
}

export async function handleAddPocc() {
  if (!ensureModelsSelectedForCoupling()) return;

  const mutModel = getVal("mutModelSelect");
  const efModel  = getVal("efModelSelect");

  try {
    const [mutPorts, efPorts] = await Promise.all([
      fetchPortsForModel(mutModel),
      fetchPortsForModel(efModel)
    ]);

    // POCC = MUT output -> EF input
    const mutOutputs = Array.isArray(mutPorts.outputs) ? mutPorts.outputs : [];
    const efInputs   = Array.isArray(efPorts.inputs) ? efPorts.inputs : [];

    if (mutOutputs.length === 0) {
      showExperimentMessage("MUT model has no output ports (y). Cannot create POCC coupling.");
      return;
    }
    if (efInputs.length === 0) {
      showExperimentMessage("EF model has no input ports (x). Cannot create POCC coupling.");
      return;
    }

    insertCouplingRow("poccList", "poccEmpty", mutOutputs, efInputs);
  } catch (e) {
    showExperimentMessage(`Error adding POCC: ${e.message}`);
  }
}

// Call this once after DOM is ready / tab is initialized
export function initCouplingButtons() {
  const addCpicBtn = document.getElementById("addCpicBtn");
  const addPoccBtn = document.getElementById("addPoccBtn");

  if (addCpicBtn && !addCpicBtn.dataset.bound) {
    addCpicBtn.addEventListener("click", handleAddCpic);
    addCpicBtn.dataset.bound = "1";
  }

  if (addPoccBtn && !addPoccBtn.dataset.bound) {
    addPoccBtn.addEventListener("click", handleAddPocc);
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







