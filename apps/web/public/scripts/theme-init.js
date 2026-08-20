try {
  var storedTheme = window.localStorage.getItem("nexora-theme");
  var isLight = storedTheme === "light";
  document.documentElement.classList.toggle("light", isLight);
  document.documentElement.classList.toggle("dark", !isLight);

  var storedAccent = window.localStorage.getItem("nexora-accent-theme");
  if (storedAccent && storedAccent !== "emerald") {
    document.documentElement.classList.add("theme-" + storedAccent);
  }
} catch {}
