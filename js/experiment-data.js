const API_BASE = "http://localhost:3001";

export async function fetchModels() {
  const r = await fetch(`${API_BASE}/api/models`);
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.items ?? [];   
}

export async function fetchInits() {
  const r = await fetch(`${API_BASE}/api/inits`);
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.items ?? [];  
}

export function fillSelect(select, items, { placeholder } = {}) {
  if (!select) return;

  if (!Array.isArray(items)) {
    console.error("fillSelect expected array, got:", items);
    items = [];
  }

  select.innerHTML = "";

  if (placeholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    select.appendChild(opt);
  }

  items.forEach(it => {
    const opt = document.createElement("option");

    // if you return {id,name} objects from python:
    opt.value = it.id;
    opt.textContent = it.name;

    select.appendChild(opt);
  });
}