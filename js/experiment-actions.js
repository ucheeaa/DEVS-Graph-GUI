const API_BASE = "http://localhost:3001";

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

        if (out) out.textContent = "Generating experiment.json...";

        const payload = { expName, mutModel, efModel, mutInit, efInit, timeSpan };

        const r = await fetch(`${API_BASE}/api/experiment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!r.ok) throw new Error(await r.text());

        const data = await r.json();
        const experiment = data.experiment ?? data;

        if (out) out.textContent = JSON.stringify(experiment, null, 2);
        downloadJson("experiment.json", experiment);

    }catch(e) {
        if (out) out.textContent = `Error:\n${String(e)}`;
        console.error(e);
    }
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