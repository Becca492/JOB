// ── Configuration API ──
const API_URL = "http://localhost:5181/api/Auth";

let currentRole = "candidat";

// ── Sélection du rôle ──
function selectRole(r, btn) {
  currentRole = r;

  document
    .querySelectorAll(".role-tab")
    .forEach((t) => t.classList.remove("active"));

  btn.classList.add("active");

  document.getElementById("auth-sub").textContent =
    r === "recruteur"
      ? "Connectez-vous à votre espace recruteur"
      : "Connectez-vous à votre espace candidat";

  document.getElementById("candidat-only").style.display =
    r === "recruteur" ? "none" : "block";
}

// ── Afficher / masquer mot de passe ──
function togglePw(id, btn) {
  const inp = document.getElementById(id);

  inp.type = inp.type === "password" ? "text" : "password";

  btn.textContent = inp.type === "password" ? "👁" : "🙈";
}

// ── Connexion API ──
async function doLogin() {
  const email = document
    .getElementById("login-email")
    .value.trim()
    .toLowerCase();

  const password = document.getElementById("login-pw").value;

  const errBox = document.getElementById("err-box");

  errBox.style.display = "none";

  if (!email || !password) {
    errBox.textContent = "⚠ Veuillez remplir tous les champs.";
    errBox.style.display = "block";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      errBox.textContent = "⚠ Email ou mot de passe incorrect.";
      errBox.style.display = "block";
      return;
    }

    const user = await response.json();

    // Vérification du rôle choisi
    if (currentRole === "recruteur" && user.role !== "recruteur") {
      errBox.textContent = "⚠ Ce compte n'est pas un compte recruteur.";
      errBox.style.display = "block";
      return;
    }

    if (currentRole === "candidat" && user.role !== "candidat") {
      errBox.textContent = "⚠ Ce compte n'est pas un compte candidat.";
      errBox.style.display = "block";
      return;
    }

    // Sauvegarde utilisateur connecté
    sessionStorage.setItem("pj_user", JSON.stringify(user));

    // Si plus tard tu ajoutes JWT
    if (user.token) {
      localStorage.setItem("token", user.token);
    }

    // Redirection
    if (user.role === "admin") {
      window.location.href = "admin.html";
    } else if (user.role === "recruteur") {
      window.location.href = "recruteur.html";
    } else {
      window.location.href = "profil.html";
    }
  } catch (error) {
    console.error(error);

    errBox.textContent = "⚠ Impossible de contacter le serveur.";

    errBox.style.display = "block";
  }
}

// ── Chargement de la page ──
document.addEventListener("DOMContentLoaded", () => {
  // Vérifie si déjà connecté
  const user = sessionStorage.getItem("pj_user");

  if (user) {
    const currentUser = JSON.parse(user);

    if (currentUser.role === "admin") {
      window.location.href = "admin.html";
    } else if (currentUser.role === "recruteur") {
      window.location.href = "recruteur.html";
    } else {
      window.location.href = "profil.html";
    }
  }

  // Compteur (temporaire)
  const stat = document.getElementById("stat-profiles");

  if (stat) {
    stat.textContent = "...";
  }
});
