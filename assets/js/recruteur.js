const API_URL = "http://localhost:5181/api";
let savedSet = new Set();
let currentSort = { field: "recent", dir: 1 };

// ── Init ──
window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(sessionStorage.getItem("pj_user") || "null");
  if (!user || user.role !== "recruteur") {
    window.location.href = "index.html";
    return;
  }

  seedIfEmpty();

  const init = ((user.prenom || "D")[0] + (user.nom || "R")[0]).toUpperCase();
  document.getElementById("topbar-ava").textContent = init;
  document.getElementById("topbar-name").textContent =
    (user.prenom || "DRH") + " " + (user.nom || "");

  await getCandidats();

  renderTable();
  updateStats();
});

function xpLabel(xp) {
  return xp <= 1
    ? "Débutant"
    : xp <= 3
      ? "Junior"
      : xp <= 6
        ? "Confirmé"
        : xp <= 10
          ? "Senior"
          : "Expert";
}
function initials(p, n) {
  return ((p || "?")[0] + (n || "?")[0]).toUpperCase();
}
function avatarStyle(secteur) {
  const map = {
    Tech: "background:rgba(200,154,42,0.12);color:var(--amber)",
    Finance: "background:rgba(15,158,114,0.12);color:var(--jade)",
    Marketing: "background:rgba(200,100,42,0.12);color:#c0641a",
    Design: "background:rgba(120,80,200,0.12);color:#7850c8",
    Réseau: "background:rgba(60,120,200,0.12);color:#3c78c8",
  };
  return map[secteur] || "background:var(--bg3);color:var(--text2)";
}

function seedIfEmpty() {
  // Base 100% vide — aucun compte pré-enregistré
}

let candidats = [];

async function getCandidats() {
  try {
    const response = await fetch(`${API_URL}/Candidat`);

    if (!response.ok) {
      throw new Error("Erreur chargement candidats");
    }

    candidats = await response.json();

    return candidats;
  } catch (error) {
    console.error(error);
    return [];
  }
}
function updateStats() {
  const all = candidats;
  document.getElementById("st-total").textContent = all.length;

  document.getElementById("st-dispo").textContent = all.filter(
    (c) => c.disponibilite === "Immédiate",
  ).length;

  document.getElementById("sidebar-count").textContent = all.length;
}

function updateFavCount() {
  document.getElementById("st-fav").textContent = savedSet.size;
  document.getElementById("fav-count").textContent = savedSet.size;
}

function renderTable() {
  const search = (
    document.getElementById("f-search").value || ""
  ).toLowerCase();
  const secteur = document.getElementById("f-secteur").value;
  const dispo = document.getElementById("f-dispo").value;
  const xpMin = parseInt(document.getElementById("f-xp").value || "0");
  const ville = document.getElementById("f-ville").value;
  const sort = document.getElementById("f-sort").value;

  let list = [...candidats];

  if (search) {
    list = list.filter((c) => {
      const hay = [
        c.prenom,
        c.nom,
        c.poste,
        c.secteur,
        c.ville,
        ...(c.skills || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });
  }
  if (secteur) list = list.filter((c) => c.secteur === secteur);
  if (dispo) list = list.filter((c) => c.disponibilite === dispo);
  if (xpMin) list = list.filter((c) => (c.experience || 0) >= xpMin);
  if (ville) list = list.filter((c) => (c.ville || "") === ville);

  // Tri
  const sorts = {
    recent: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    "xp-desc": (a, b) => (b.experience || 0) - (a.experience || 0),
    "xp-asc": (a, b) => (a.experience || 0) - (b.experience || 0),
    az: (a, b) => (a.nom || "").localeCompare(b.nom || ""),
    za: (a, b) => (b.nom || "").localeCompare(a.nom || ""),
    "salaire-asc": (a, b) =>
      parseNum(a.pretentionSalariale) - parseNum(b.pretentionSalariale),

    "salaire-desc": (a, b) =>
      parseNum(b.pretentionSalariale) - parseNum(a.pretentionSalariale),
  };
  list.sort(sorts[sort] || sorts["recent"]);

  const count = document.getElementById("result-count");
  count.textContent = `${list.length} candidat${list.length !== 1 ? "s" : ""} trouvé${list.length !== 1 ? "s" : ""}`;

  const container = document.getElementById("candidates-list");
  const noResult = document.getElementById("no-result");

  if (list.length === 0) {
    container.innerHTML = "";
    noResult.style.display = "block";
    return;
  }
  noResult.style.display = "none";

  container.innerHTML = list
    .map((c) => {
      const lvl = xpLabel(c.experience || 0);
      const dot =
        c.disponibilite === "Immédiate"
          ? "dot-green"
          : c.disponibilite === "Sous 1 mois"
            ? "dot-amber"
            : "dot-grey";
      const init = initials(c.prenom || "?", c.nom || "?");
      const avSt = avatarStyle(c.secteur);
      const chips = (c.skills || "")
        .split(",")
        .slice(0, 3)
        .map((s) => `<span class="cand-chip">${s.trim()}</span>`)
        .join("");
      const saved = savedSet.has(c.email);

      const dispoCls =
        c.disponibilite === "Immédiate"
          ? "pbadge-jade"
          : c.disponibilite === "Sous 1 mois"
            ? "pbadge-amber"
            : "pbadge-grey";
      const dispoTxt =
        c.disponibilite === "Immédiate"
          ? "✓ Immédiate"
          : c.disponibilite === "Sous 1 mois"
            ? "⏱ 1 mois"
            : "🕐 3 mois+";

      return `<div class="cand-row" onclick="openPanel('${c.email}')">
        <span class="status-dot ${dot}"></span>
        <div class="cand-main">
          <div class="cand-ava" style="${avSt}">${init}</div>
          <div>
            <div class="cand-nm">${c.prenom} ${c.nom}</div>
            <div class="cand-role">${c.poste || "—"}</div>
          </div>
        </div>
        <div class="cand-xp-cell col-xp">
          ${c.experience || 0} ans
          <span>${lvl}</span>
        </div>
        <div class="cand-chips">${chips}</div>
        <div class="dispo-badge ${dispoCls} col-dispo">${dispoTxt}</div>
        <div class="cand-actions" onclick="event.stopPropagation()">
          <button class="btn-save ${saved ? "saved" : ""}" id="save-${c.email.replace(/[^a-z0-9]/gi, "_")}"
            onclick="toggleSave('${c.email}',this)" title="${saved ? "Retirer des favoris" : "Sauvegarder"}">${saved ? "♥" : "♡"}</button>
          <button class="btn-voir" onclick="openPanel('${c.email}')">Voir →</button>
        </div>
      </div>`;
    })
    .join("");
}

function parseNum(s) {
  return parseInt((s || "0").replace(/\s/g, "")) || 0;
}

function toggleSave(email, btn) {
  if (savedSet.has(email)) {
    savedSet.delete(email);
    btn.textContent = "♡";
    btn.classList.remove("saved");
    showToast("Retiré des favoris");
  } else {
    savedSet.add(email);
    btn.textContent = "♥";
    btn.classList.add("saved");
    showToast("✅ Candidat sauvegardé !");
  }
  updateFavCount();
}

function cycleSort(field) {
  const el = document.getElementById("f-sort");
  if (el.value === field + "-desc") el.value = field + "-asc";
  else el.value = field + "-desc";
  renderTable();
}

function resetFilters() {
  document.getElementById("f-search").value = "";
  document.getElementById("f-secteur").value = "";
  document.getElementById("f-dispo").value = "";
  document.getElementById("f-xp").value = "0";
  document.getElementById("f-ville").value = "";
  document.getElementById("f-sort").value = "recent";
  renderTable();
}

// ── Panel fiche candidat ──
function openPanel(email) {
  const c = candidats.find((a) => a.email === email);
  if (!c) return;

  const lvl = xpLabel(c.experience || 0);
  const pct = Math.round(((c.experience || 0) / 20) * 100);
  const init = initials(c.prenom || "?", c.nom || "?");
  const avSt = avatarStyle(c.secteur);
  const saved = savedSet.has(c.email);
  const dispoCls =
    c.disponibilite === "Immédiate"
      ? "pbadge-jade"
      : c.disponibilite === "Sous 1 mois"
        ? "pbadge-amber"
        : "pbadge-grey";
  const dispoTxt =
    c.disponibilite === "Immédiate" ? "✅ Disponible" : c.disponibilite || "—";
  const chips = (c.skills || "")
    .split(",")
    .map((s) => `<span class="chip-ro">${s}</span>`)
    .join("");

  document.getElementById("panel-body").innerHTML = `
      <div class="panel-hero">
        <div class="panel-ava" style="${avSt}">${init}</div>
        <div>
          <div class="panel-nm">${c.prenom} ${c.nom}</div>
          <div class="panel-role">${c.poste || "—"}</div>
          <div class="panel-badges">
            <span class="pbadge pbadge-amber">⭐ ${lvl} · ${c.experience || 0}  ans</span>
            <span class="pbadge pbadge-grey">📍 ${c.ville || "—"}</span>
            <span class="pbadge ${dispoCls}">${dispoTxt}</span>
          </div>
        </div>
      </div>

      <div class="panel-sec">Coordonnées</div>
      <div class="info-row"><span class="info-lbl">E-mail</span><span class="info-val">${c.email}</span></div>
      <div class="info-row"><span class="info-lbl">Téléphone</span><span class="info-val">${c.telephone || "—"}</span></div>
      <div class="info-row"><span class="info-lbl">Ville</span><span class="info-val">${c.ville || "—"}, ${c.pays || "CI"}</span></div>

      <div class="panel-sec">Profil professionnel</div>
      <div class="info-row"><span class="info-lbl">Secteur</span><span class="info-val">${c.secteur || "—"}</span></div>
      <div class="info-row"><span class="info-lbl">Niveau d'études</span><span class="info-val">${c.etude || "—"}</span></div>
      <div class="info-row">
  <span class="info-lbl">Prétention salariale</span>
  <span class="info-val">${c.pretentionSalariale ? c.pretentionSalariale + " FCFA/mois" : "—"}</span>
</div>
      <div class="info-row"><span class="info-lbl">Disponibilité</span><span class="info-val">${c.dispo || "—"}</span></div>

      <div class="panel-sec">Expérience</div>
      <div class="xp-bar-wrap">
        <div class="xp-bar-top">
          <div class="xp-big">${c.experience || 0} ans</div>
          <div class="xp-lvl">ans · niveau ${lvl}</div>
        </div>
        <div class="xp-track"><div class="xp-fill" style="width:${pct}%"></div></div>
      </div>

      <div class="panel-sec">Présentation</div>
      <p class="panel-bio">${c.bio || "Aucune présentation renseignée."}</p>

      <div class="panel-sec">Compétences</div>
      <div class="chips-ro">${chips || '<span style="color:var(--text3);font-style:italic;font-size:13px;">Aucune compétence renseignée</span>'}</div>

      <div class="panel-sec">Curriculum Vitæ</div>
      ${
        c.cv && c.cv.base64
          ? `<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--jade-soft);border:1px solid rgba(15,158,114,0.2);border-radius:var(--r-sm);">
            <span style="font-size:30px;">📎</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.cv.name}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px;">${c.cv.size ? (c.cv.size > 1024 * 1024 ? (c.cv.size / 1024 / 1024).toFixed(1) + " Mo" : Math.round(c.cv.size / 1024) + " Ko") : ""}</div>
            </div>
            <a href="${c.cv.base64}" download="${c.cv.name}"
              style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:var(--jade);color:#fff;border-radius:var(--r-sm);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap;flex-shrink:0;">
              ⬇ Télécharger le CV
            </a>
          </div>`
          : `<div style="padding:14px 16px;background:var(--bg3);border:1px dashed var(--line);border-radius:var(--r-sm);font-size:13px;color:var(--text3);font-style:italic;">
            Aucun CV déposé par ce candidat.
          </div>`
      }

      <div class="panel-actions">
        <a href="mailto:${c.email}?subject=Opportunité professionnelle — POSTE JOB&body=Bonjour ${c.prenom},%0D%0A%0D%0ANous avons trouvé votre profil sur POSTE JOB et souhaitons vous contacter..."
          style="display:block;width:100%;padding:13px;background:var(--amber);border-radius:var(--r-sm);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#fff;text-align:center;text-decoration:none;transition:0.2s;box-sizing:border-box;"
          onmouseover="this.style.background='var(--amber-dark)'" onmouseout="this.style.background='var(--amber)'">
          ✉️ Contacter par email
        </a>
        ${
          c.telephone
            ? `<a href="tel:${c.telephone}"
          style="display:block;width:100%;padding:13px;background:transparent;border:1.5px solid var(--jade);border-radius:var(--r-sm);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:var(--jade);text-align:center;text-decoration:none;transition:0.2s;box-sizing:border-box;"
          onmouseover="this.style.background='var(--jade-soft)'" onmouseout="this.style.background='transparent'">
          📞 Appeler — ${c.telephone}
        </a>`
            : ""
        }
        <button class="btn-save-full" id="panel-save-btn" onclick="toggleSave('${c.email}', document.getElementById('save-${c.email.replace(/[^a-z0-9]/gi, "_")}'));updatePanelSave('${c.email}')">${saved ? "♥ Retirer des favoris" : "♡ Sauvegarder le profil"}</button>
      </div>
    `;

  document.getElementById("panel-overlay").classList.add("open");
}

function updatePanelSave(email) {
  const btn = document.getElementById("panel-save-btn");
  if (!btn) return;
  btn.textContent = savedSet.has(email)
    ? "♥ Retirer des favoris"
    : "♡ Sauvegarder le profil";
}

function closePanel() {
  document.getElementById("panel-overlay").classList.remove("open");
}

// ── Déconnexion ──
function logout() {
  sessionStorage.removeItem("pj_user");
  window.location.href = "index.html";
}

// ── Toast ──
function showToast(msg, bg) {
  const t = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  t.style.background = bg || "#1A1810";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}
