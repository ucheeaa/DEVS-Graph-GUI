// experiment-init-editor.js

function findUserObject(userObjects, predicate) {
  return userObjects.find(predicate);
}

function normalizeComponents(components) {
  if (Array.isArray(components)) return components;
  if (components && typeof components === "object") {
    return Object.entries(components).map(([model, id]) => ({ model, id }));
  }
  return [];
}

function validateByType(type, val) {
  const s = String(val ?? "").trim();

  if (type === "bool") return s === "true" || s === "false";
  if (type === "int") return /^-?\d+$/.test(s);
  if (type === "double") return s.toLowerCase() === "inf" || !Number.isNaN(Number(s));
  return true;
}

export function buildInitEditorForCoupled(conversionManager, coupledUid, containerEl) {
  const userObjects = conversionManager.getUserObjects();

  const coupled = findUserObject(
    userObjects,
    u => u.elementType === "coupledModel" && (u.unique_id?.toLowerCase() === coupledUid.toLowerCase())
  );
  if (!coupled) throw new Error(`Coupled model not found: ${coupledUid}`);

  const comps = normalizeComponents(coupled.json?.model?.components);
  containerEl.innerHTML = "";
  containerEl.classList.remove("hidden");

  const editors = [];

  for (const { model, component_id } of comps) {
    const atomic = findUserObject(
        userObjects,
        u => u.elementType === "atomicModel" &&
            (u.unique_id?.toLowerCase() === String(component_id).toLowerCase())
    );

    if (!atomic) {
      const warn = document.createElement("div");
      warn.textContent = `⚠ Missing atomic component for id: ${component_id}`;
      containerEl.appendChild(warn);
      continue;
    }

    const s = atomic.json?.model?.s ?? {}; // { varName: {data_type, init_state}, ... }

    const section = document.createElement("div");
    section.className = "init-section";

    const title = document.createElement("h4");
    title.textContent = `${component_id} : ${model}`;
    section.appendChild(title);

    for (const [varName, meta] of Object.entries(s)) {
      const type = meta?.data_type ?? "string";
      const initVal = meta?.init_state ?? "";

      const row = document.createElement("div");
      row.className = "init-row";

      const label = document.createElement("label");
      label.textContent = `${varName} (${type})`;
      row.appendChild(label);

      let input;
      if (type === "bool") {
        input = document.createElement("select");
        ["true", "false"].forEach(v => {
          const opt = document.createElement("option");
          opt.value = v;
          opt.textContent = v;
          input.appendChild(opt);
        });
        input.value = String(initVal).toLowerCase() === "true" ? "true" : "false";
      } else {
        input = document.createElement("input");
        input.type = "text";
        input.value = String(initVal);
      }

      const err = document.createElement("div");
      err.className = "init-err";

      const validate = () => {
        const ok = validateByType(type, input.value);
        err.textContent = ok ? "" : `Invalid ${type}`;
        row.classList.toggle("has-error", !ok);
      };
      input.addEventListener("input", validate);
      input.addEventListener("change", validate);
      validate();

      row.appendChild(input);
      row.appendChild(err);
      section.appendChild(row);

      editors.push({ componentId: String(component_id), varName, type, input });
    }

    containerEl.appendChild(section);
  }

  return function buildInitJsonFromEditor() {
    if (containerEl.querySelector(".has-error")) {
      throw new Error("Fix invalid init values before saving.");
    }

    const coupledKey = coupledUid.toLowerCase();
    const out = { init_states: { [coupledKey]: {} } };

    for (const e of editors) {
      const compKey = e.componentId.toLowerCase();
      out.init_states[coupledKey][compKey] ??= {};
      out.init_states[coupledKey][compKey][e.varName] = String(e.input.value).trim();
    }

    return out;
  };
}