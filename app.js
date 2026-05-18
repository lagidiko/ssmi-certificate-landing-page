const MANIFEST_URL = new URL("./data/certificates.json", import.meta.url);
const CERTIFICATES_BASE = new URL("./certificates/", import.meta.url);

/** @type {{ entries: Array<{ firstName: string; lastName: string; file: string }> } | null} */
let cache = null;

function normalizePart(value) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

async function loadManifest() {
  if (cache) return cache;
  const res = await fetch(MANIFEST_URL.href);
  if (!res.ok) throw new Error("manifest");
  cache = await res.json();
  return cache;
}

function findEntry(entries, firstName, lastName) {
  const n1 = normalizePart(firstName);
  const n2 = normalizePart(lastName);
  return entries.find((e) => normalizePart(e.firstName) === n1 && normalizePart(e.lastName) === n2);
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector(".submit-label").hidden = loading;
  const spin = btn.querySelector(".submit-spinner");
  spin.hidden = !loading;
}

function setMessage(el, text, tone) {
  el.textContent = text;
  if (tone) el.dataset.tone = tone;
  else delete el.dataset.tone;
}

document.getElementById("download-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const form = ev.currentTarget;
  const btn = document.getElementById("submit-btn");
  const msg = document.getElementById("form-message");

  const fd = new FormData(form);
  const firstName = String(fd.get("firstName") ?? "");
  const lastName = String(fd.get("lastName") ?? "");

  if (!firstName.trim() || !lastName.trim()) {
    setMessage(msg, "Please enter both name and surname.", "error");
    return;
  }

  setMessage(msg, "");
  setLoading(btn, true);

  try {
    const data = await loadManifest();
    const entries = data.entries ?? [];
    const hit = findEntry(entries, firstName, lastName);

    if (!hit) {
      setMessage(msg, "No certificate found for these details. Check spelling or contact support.", "error");
      return;
    }

    const pdfUrl = new URL(hit.file, CERTIFICATES_BASE.href).href;
    setMessage(msg, "Opening your certificate…", "success");
    window.location.assign(pdfUrl);
  } catch {
    setMessage(msg, "Could not load certificates list. Please refresh the page.", "error");
  } finally {
    setLoading(btn, false);
  }
});
