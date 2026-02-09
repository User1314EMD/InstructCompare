(function () {
  "use strict";

  var STORAGE_KEY = "instructcompare_theme";
  var html = document.documentElement;

  function getTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    var current = html.getAttribute("data-theme") || getTheme();
    setTheme(current === "dark" ? "light" : "dark");
  }

  setTheme(getTheme());

  window.toggleTheme = toggleTheme;
  window.setTheme = setTheme;
  window.getTheme = getTheme;
})();
