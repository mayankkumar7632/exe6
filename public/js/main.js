const API_BASE = "/api/auth";

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

// Converts an absolute path like "/pages/login.html" into a path
// relative to the current page, so it also works when hosted
// under a subdirectory (e.g. GitHub Pages: /repo/...)
function withBase(path) {
  const isRootPage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname.endsWith("/");
  const base = isRootPage ? "" : "../";
  if (path === "/") return base === "" ? "./" : "../";
  let clean = path.replace(/\/+$/, "") || "/";
  if (clean.startsWith("/")) clean = clean.slice(1);
  return base + clean;
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
      <a href="${withBase("/pages/login.html")}" class="btn btn-outline">Login</a>
      <a href="${withBase("/pages/register.html")}" class="btn btn-primary">Register</a>
    `;
  }
}

async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
  } catch (e) {}
  clearUser();
  window.location.href = withBase("/");
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
  // Normalize trailing slash so "/" and "/index.html" style comparisons work
  const current = path !== "/" && path.endsWith("/")
    ? path.slice(0, -1)
    : path;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";
    const linkPath = href.startsWith("/")
      ? href
      : new URL(href, window.location.href).pathname;
    const normalizedLink =
      linkPath !== "/" && linkPath.endsWith("/")
        ? linkPath.slice(0, -1)
        : linkPath;
    if (normalizedLink === current) link.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  setActiveNav();
});
