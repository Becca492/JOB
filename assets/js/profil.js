const API_URL = "http://localhost:5181/api";
let user = null;

window.addEventListener("DOMContentLoaded", () => {
  user = JSON.parse(sessionStorage.getItem("pj_user") || "null");
  if (!user || user.role !== "candidat") {
    window.location.href = "index.html";
    return;
  }
  renderProfile();
  renderCVCard();
});

function renderCVCard() {
  const el = document.getElementById("cv-card-content");
  if (!el) return;
  const cv = user.cv;
  if (!cv || !cv.name) {
    el.innerHTML =
      '<span style="color:var(--text3);font-style:italic;font-size:13px;">Aucun CV chargé — cliquez sur "Modifier le profil" pour en ajouter un.</span>';
    return;
  }
  el.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--jade-soft);border:1px solid rgba(15,158,114,0.2);border-radius:var(--r-sm);">
        <span style="font-size:32px;">📎</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cv.name}</div>
          <div style="font-size:12px;color:var(--text3);">${formatFileSize(cv.size || 0)} · Mis à jour récemment</div>
        </div>
        <a href="${cv.base64}" download="${cv.name}" style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;background:var(--jade);color:#fff;border-radius:var(--r-sm);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap;transition:0.2s;">⬇ Télécharger</a>
      </div>
    `;
}

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

// ── Rendu profil ──
function renderProfile() {
  const u = user;
  const init = initials(u.prenom, u.nom);
  const lvl = xpLabel(u.xp || 0);
  const pct = Math.round(((u.xp || 0) / 20) * 100);

  document.getElementById("topbar-ava").textContent = init;
  document.getElementById("topbar-name").textContent =
    u.prenom + " " + (u.nom[0] || "") + ".";
  document.getElementById("p-ava").textContent = init;
  document.getElementById("p-nm").textContent = u.prenom + " " + u.nom;
  document.getElementById("p-role").textContent = u.poste || "—";
  document.getElementById("p-badge-xp").textContent =
    `⭐ ${lvl} · ${u.xp || 0} ans`;
  document.getElementById("p-badge-ville").textContent =
    `📍 ${u.ville || "—"}, ${u.pays || "CI"}`;
  document.getElementById("p-badge-dispo").textContent =
    u.dispo === "Immédiate"
      ? "✅ Disponible immédiatement"
      : `🕐 Dispo : ${u.dispo || "—"}`;
  document.getElementById("p-email").textContent = u.email;
  document.getElementById("p-tel").textContent = u.tel || "—";
  document.getElementById("p-secteur").textContent = u.secteur || "—";
  document.getElementById("p-etude").textContent = u.etude || "—";
  document.getElementById("p-salaire").textContent = u.salaire
    ? u.salaire + " FCFA/mois"
    : "—";
  document.getElementById("p-xp-num").textContent = u.xp || 0;
  document.getElementById("p-xp-bar").style.width = pct + "%";
  document.getElementById("p-xp-pill").textContent = lvl;
  document.getElementById("p-bio").textContent =
    u.bio || "Aucune présentation renseignée.";
  document.getElementById("p-chips").innerHTML = (u.skills || []).length
    ? (u.skills || []).map((s) => `<span class="chip-ro">${s}</span>`).join("")
    : '<span style="color:var(--text3);font-style:italic;font-size:13px;">Aucune compétence renseignée</span>';

  // Complétion
  const fields = [
    u.prenom,
    u.nom,
    u.email,
    u.poste,
    u.ville,
    u.tel,
    u.bio,
    u.salaire,
  ];
  const filled = fields.filter((f) => f && String(f).trim()).length;
  const skillBonus = (u.skills || []).length >= 3 ? 1 : 0;
  const total = Math.round(((filled + skillBonus) / (fields.length + 1)) * 100);
  document.getElementById("completion-fill").style.width = total + "%";
  document.getElementById("completion-lbl").textContent =
    `${total}% complet — ${total < 60 ? "Ajoutez vos compétences et votre bio pour attirer plus de recruteurs." : total < 90 ? "Bon profil ! Complétez encore quelques champs." : "Profil excellent ! Vous êtes bien visible des recruteurs."}`;
}

// ── CV upload modal ──
let newCvData = null;

function handleModalCV(input) {
  if (input.files && input.files[0]) processModalCV(input.files[0]);
}
function handleModalCVDrop(event) {
  const file = event.dataTransfer.files[0];
  if (file) processModalCV(file);
}
function processModalCV(file) {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
    showToast("⚠ Format non supporté. Utilisez PDF, DOC ou DOCX.", "#c03030");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("⚠ Le fichier dépasse 5 Mo.", "#c03030");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    newCvData = {
      name: file.name,
      size: file.size,
      type: file.type,
      base64: e.target.result,
    };
    const drop = document.getElementById("m-cv-drop");
    drop.classList.add("ok");
    document.getElementById("m-cv-ico").textContent = "✅";
    document.getElementById("m-cv-lbl").textContent =
      "Nouveau CV prêt à enregistrer";
    document.getElementById("m-cv-lbl").style.color = "var(--jade)";
    document.getElementById("m-cv-hint").textContent = "Cliquez pour changer";
    const prev = document.getElementById("m-cv-preview");
    document.getElementById("m-cv-filename").textContent = file.name;
    document.getElementById("m-cv-filesize").textContent = formatFileSize(
      file.size,
    );
    prev.style.display = "flex";
  };
  reader.readAsDataURL(file);
}
function removeModalCV() {
  newCvData = null;
  document.getElementById("m-cv-input").value = "";
  const drop = document.getElementById("m-cv-drop");
  drop.classList.remove("ok");
  document.getElementById("m-cv-ico").textContent = "📄";
  document.getElementById("m-cv-lbl").textContent =
    "Cliquez ou glissez un nouveau CV";
  document.getElementById("m-cv-lbl").style.color = "";
  document.getElementById("m-cv-preview").style.display = "none";
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}
function openModal() {
  const u = user;
  document.getElementById("m-prenom").value = u.prenom || "";
  document.getElementById("m-nom").value = u.nom || "";
  document.getElementById("m-poste").value = u.poste || "";
  document.getElementById("m-ville").value = u.ville || "";
  document.getElementById("m-tel").value = u.tel || "";
  document.getElementById("m-bio").value = u.bio || "";
  document.getElementById("m-salaire").value = u.salaire || "";
  // Selects
  setSelect("m-secteur", u.secteur);
  setSelect("m-dispo", u.dispo);
  setSelect("m-etude", u.etude);
  // XP slider
  const xp = u.xp || 0;
  document.getElementById("m-xp-slider").value = xp;
  updateModalSlider(xp);
  // Chips
  const box = document.getElementById("m-chips-box");
  const inp = document.getElementById("m-chip-inp");
  box.querySelectorAll(".chip-tag").forEach((c) => c.remove());
  (u.skills || []).forEach((s) => {
    const chip = document.createElement("div");
    chip.className = "chip-tag";
    chip.innerHTML =
      s +
      '<button type="button" onclick="this.parentElement.remove()">×</button>';
    box.insertBefore(chip, inp);
  });
  // CV actuel
  newCvData = null;
  removeModalCV();
  const cvWrap = document.getElementById("cv-current-wrap");
  if (u.cv && u.cv.name) {
    document.getElementById("cv-current-name").textContent = u.cv.name;
    document.getElementById("cv-current-size").textContent =
      formatFileSize(u.cv.size || 0) + " · CV actuel";
    const dlBtn = document.getElementById("cv-download-btn");
    dlBtn.href = u.cv.base64;
    dlBtn.download = u.cv.name;
    cvWrap.style.display = "flex";
  } else {
    cvWrap.style.display = "none";
  }
  document.getElementById("modal-overlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

function setSelect(id, val) {
  const sel = document.getElementById(id);
  for (let opt of sel.options) {
    if (opt.value === val || opt.text === val) {
      sel.value = opt.value;
      break;
    }
  }
}

// ── Slider modal ──
function updateModalSlider(val) {
  val = parseInt(val);
  document.getElementById("m-xp-val").textContent = val;
  document.getElementById("m-xp-lvl").textContent = xpLabel(val);
  document.getElementById("m-track").style.width = (val / 20) * 100 + "%";
}

// ── Chips modal ──
function addModalChip(e) {
  if (e.key !== "Enter") return;
  const inp = document.getElementById("m-chip-inp");
  const val = inp.value.trim();
  if (!val) return;
  const chip = document.createElement("div");
  chip.className = "chip-tag";
  chip.innerHTML =
    val +
    '<button type="button" onclick="this.parentElement.remove()">×</button>';
  document.getElementById("m-chips-box").insertBefore(chip, inp);
  inp.value = "";
  e.preventDefault();
}

// ── Sauvegarder ──
// ── Sauvegarder ──
async function saveProfile() {
  const updates = {
    prenom: document.getElementById("m-prenom").value.trim(),
    nom: document.getElementById("m-nom").value.trim(),
    telephone: document.getElementById("m-tel").value.trim(),
    ville: document.getElementById("m-ville").value.trim(),

    poste: document.getElementById("m-poste").value.trim(),
    secteur: document.getElementById("m-secteur").value,
    disponibilite: document.getElementById("m-dispo").value,

    niveauEtude: document.getElementById("m-etude").value,
    pretentionSalariale: document.getElementById("m-salaire").value.trim(),

    experience: parseInt(document.getElementById("m-xp-slider").value) || 0,

    skills: [...document.querySelectorAll("#m-chips-box .chip-tag")]
      .map((c) => c.textContent.replace("×", "").trim())
      .join(","),

    bio: document.getElementById("m-bio").value.trim(),

    cvFilePath: newCvData?.name || user.cvFilePath || "",
  };

  try {
    const response = await fetch(`${API_URL}/Candidat/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...user,
        ...updates,
      }),
    });

    if (!response.ok) {
      throw new Error("Erreur mise à jour");
    }

    const updatedUser = await response.json();

    user = updatedUser;

    sessionStorage.setItem("pj_user", JSON.stringify(updatedUser));

    renderProfile();
    renderCVCard();
    closeModal();

    showToast("✅ Profil mis à jour !");
  } catch (err) {
    console.error(err);

    showToast("❌ Impossible de sauvegarder", "#c03030");
  }
}

// ── Déconnexion ──
function logout() {
  sessionStorage.removeItem("pj_user");
  localStorage.removeItem("token");
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
