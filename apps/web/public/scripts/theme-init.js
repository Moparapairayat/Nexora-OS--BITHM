try {
  var storedTheme = window.localStorage.getItem("nexora-theme");
  document.documentElement.classList.toggle("light", storedTheme === "light");

  var storedAccent = window.localStorage.getItem("nexora-accent-theme");
  if (storedAccent && storedAccent !== "emerald") {
    document.documentElement.classList.add("theme-" + storedAccent);
  }
} catch {}
