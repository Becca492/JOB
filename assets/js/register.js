// ── DB ──
const API_URL = "http://localhost:5181/api";

// ── Rôle inscription ──
let regRole = "candidat";
function setRegRole(role, btn) {
  regRole = role;
  document.getElementById("role-btn-candidat").style.background =
    role === "candidat" ? "var(--amber-soft)" : "var(--bg2)";
  document.getElementById("role-btn-candidat").style.borderColor =
    role === "candidat" ? "var(--amber)" : "var(--line)";
  document.getElementById("role-btn-candidat").style.color =
    role === "candidat" ? "var(--amber)" : "var(--text2)";
  document.getElementById("role-btn-recruteur").style.background =
    role === "recruteur" ? "var(--amber-soft)" : "var(--bg2)";
  document.getElementById("role-btn-recruteur").style.borderColor =
    role === "recruteur" ? "var(--amber)" : "var(--line)";
  document.getElementById("role-btn-recruteur").style.color =
    role === "recruteur" ? "var(--amber)" : "var(--text2)";
  // Masquer les champs pro si recruteur
  const proSections = document.querySelectorAll(".rcard:not(:first-of-type)");
  proSections.forEach((card, i) => {
    if (i > 0) card.style.display = role === "recruteur" ? "none" : "block";
  });
}

// ── Toggle password ──
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "👁" : "🙈";
}

// ── Force mot de passe ──
function checkStrength(pw) {
  const bars = [
    document.getElementById("bar1"),
    document.getElementById("bar2"),
    document.getElementById("bar3"),
    document.getElementById("bar4"),
  ];
  const lbl = document.getElementById("pw-lbl");
  bars.forEach((b) => (b.className = "pw-bar"));
  if (!pw) {
    lbl.textContent = "";
    return;
  }
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) || /\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const cls = score <= 1 ? "weak" : score <= 2 ? "medium" : "strong";
  const lbls = ["", "Faible", "Faible", "Moyen", "Fort"];
  for (let i = 0; i < score; i++) bars[i].classList.add(cls);
  lbl.textContent = lbls[score] || "";
  lbl.style.color =
    score <= 1 ? "#e05050" : score <= 2 ? "var(--amber)" : "var(--jade)";
}

// ── Slider XP ──
function updateSlider(val) {
  val = parseInt(val);
  document.getElementById("exp-val").textContent = val;
  document.getElementById("exp-track").style.width = (val / 20) * 100 + "%";
  const lvl =
    val <= 1
      ? "Débutant"
      : val <= 3
        ? "Junior"
        : val <= 6
          ? "Confirmé"
          : val <= 10
            ? "Senior"
            : "Expert";
  document.getElementById("exp-lvl").textContent = lvl;
}

// ── Chips ──
function addChip(e) {
  if (e.key !== "Enter") return;
  const inp = document.getElementById("chip-input");
  const val = inp.value.trim();
  if (!val) return;
  const chip = document.createElement("div");
  chip.className = "chip-tag";
  chip.innerHTML =
    val +
    '<button type="button" onclick="this.parentElement.remove()">×</button>';
  document.getElementById("chips-box").insertBefore(chip, inp);
  inp.value = "";
  e.preventDefault();
}

// ── Upload CV réel ──
let cvData = null; // { name, size, base64, type }

function handleCVUpload(input) {
  if (input.files && input.files[0]) processCV(input.files[0]);
}
function handleCVDrop(event) {
  const file = event.dataTransfer.files[0];
  if (file) processCV(file);
}
function processCV(file) {
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
    cvData = {
      name: file.name,
      size: file.size,
      type: file.type,
      base64: e.target.result,
    };
    showCVPreview(file.name, file.size);
  };
  reader.readAsDataURL(file);
}
function showCVPreview(name, size) {
  const drop = document.getElementById("cv-drop");
  drop.classList.add("ok");
  document.getElementById("cv-ico").textContent = "✅";
  document.getElementById("cv-lbl").textContent = "CV chargé avec succès";
  document.getElementById("cv-lbl").style.color = "var(--jade)";
  document.getElementById("cv-hint").textContent =
    "Cliquez pour changer de fichier";
  const prev = document.getElementById("cv-preview");
  document.getElementById("cv-filename").textContent = name;
  document.getElementById("cv-filesize").textContent = formatSize(size);
  prev.style.display = "flex";
}
function removeCV() {
  cvData = null;
  document.getElementById("cv-input").value = "";
  const drop = document.getElementById("cv-drop");
  drop.classList.remove("ok");
  document.getElementById("cv-ico").textContent = "📄";
  document.getElementById("cv-lbl").textContent =
    "Cliquez ou glissez votre CV ici";
  document.getElementById("cv-lbl").style.color = "";
  document.getElementById("cv-hint").textContent =
    "PDF · DOC · DOCX — max 5 Mo";
  document.getElementById("cv-preview").style.display = "none";
}
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

// ── Toast ──
function showToast(msg, bg) {
  const t = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  t.style.background = bg || "var(--text)";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}

// ── Validation + soumission ──
async function submitRegister() {
  const prenom = document.getElementById("r-prenom").value.trim();
  const nom = document.getElementById("r-nom").value.trim();
  const email = document.getElementById("r-email").value.trim().toLowerCase();
  const tel = document.getElementById("r-tel").value.trim();
  const ville = document.getElementById("r-ville").value.trim();
  const pays = document.getElementById("r-pays").value;
  const poste = document.getElementById("r-poste").value.trim();
  const secteur = document.getElementById("r-secteur").value;
  const dispo = document.getElementById("r-dispo").value;
  const etude = document.getElementById("r-etude").value;
  const salaire = document.getElementById("r-salaire").value.trim();
  const bio = document.getElementById("r-bio").value.trim();
  const xp = parseInt(document.getElementById("exp-slider").value) || 0;
  const pw = document.getElementById("r-pw").value;
  const pw2 = document.getElementById("r-pw2").value;

  const skills = [...document.querySelectorAll("#chips-box .chip-tag")].map(
    (c) => c.textContent.replace("×", "").trim(),
  );

  const errBox = document.getElementById("err-box");

  function showErr(msg) {
    errBox.textContent = "⚠ " + msg;
    errBox.style.display = "block";
    errBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  errBox.style.display = "none";

  // ── VALIDATION ──
  if (!prenom) return showErr("Le prénom est obligatoire.");
  if (!nom) return showErr("Le nom est obligatoire.");
  if (!email || !email.includes("@")) return showErr("Email invalide.");
  if (!poste) return showErr("Le poste est obligatoire.");
  if (!pw) return showErr("Mot de passe obligatoire.");
  if (pw.length < 6) return showErr("6 caractères minimum.");
  if (pw !== pw2) return showErr("Les mots de passe ne correspondent pas.");

  // ── OBJET USER ──
  const newUser = {
    email,
    password: pw,
    role: regRole,
    prenom,
    nom,
    poste,
    ville: ville || "Abidjan",
    pays,
    tel: tel || "",
    bio: bio || "",
    secteur,
    dispo,
    etude,
    salaire: salaire || "0",
    xp,
    skills,
    cv: cvData,
  };

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const err = await res.text();
      return showErr("Erreur serveur : " + err);
    }

    const savedUser = await res.json();

    sessionStorage.setItem("pj_user", JSON.stringify(savedUser));

    showToast("🎉 Compte créé ! Redirection…", "var(--jade)");

    setTimeout(() => {
      window.location.href =
        regRole === "recruteur" ? "recruteur.html" : "profil.html";
    }, 1200);
  } catch (e) {
    console.error(e);
    showErr("Erreur de connexion au serveur");
  }
}
