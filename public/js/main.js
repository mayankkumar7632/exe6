const API_BASE = "/api/auth";

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("user");
}

function updateNavbar() {
  const user = getUser();
  const navAuth = document.getElementById("nav-auth");
  if (!navAuth) return;

  if (user) {
    navAuth.innerHTML = `
      <span class="user-badge">${user.fullName}</span>
      <button class="btn btn-outline" onclick="logout()">Logout</button>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="/pages/login.html" class="btn btn-outline">Login</a>
      <a href="/pages/register.html" class="btn btn-primary">Register</a>
    `;
  }
}

async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
  } catch (e) {}
  clearUser();
  window.location.href = "/";
}

function flash(message, type) {
  let overlay = document.getElementById("flash-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "flash-overlay";
    overlay.className = "flash-overlay";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="flash-message ${type}">${message}</div>`;
  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 3000);
}

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === path) link.classList.add("active");
    if (path === "/" && link.getAttribute("href") === "/") link.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  setActiveNav();
});
