try {
  var storedTheme = window.localStorage.getItem("nexora-theme");
  document.documentElement.classList.toggle("light", storedTheme === "light");
} catch (_) {}
