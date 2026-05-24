const STORAGE_KEY = "theme";

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme = getStoredTheme()) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function unapplyTheme() {
  document.documentElement.classList.remove("dark");
}
