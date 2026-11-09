// Se ejecuta antes de pintar para evitar el parpadeo de tema. Sin dependencias.
(function () {
  try {
    var t = localStorage.getItem("tema");
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
