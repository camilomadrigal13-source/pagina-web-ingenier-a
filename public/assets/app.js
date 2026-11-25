// Interacciones del sitio. Sin dependencias. Cada bloque funciona solo si encuentra sus elementos.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;

  /* Botón de WhatsApp: aparece al bajar un poco, para no tapar el primer contenido */
  var waF = $(".wa-flot");
  if (waF) {
    var mostrarWA = function () { waF.classList.toggle("visible", (window.scrollY || document.documentElement.scrollTop) > 260); };
    window.addEventListener("scroll", mostrarWA, { passive: true }); mostrarWA();
  }

  /* Tema claro/oscuro */
  var btnTema = $("#tema");
  function temaActual() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return "dark"; // el diseño es oscuro por defecto; el modo claro es opcional con el botón
  }
  function pintarTema() { if (btnTema) btnTema.setAttribute("aria-pressed", temaActual() === "dark" ? "true" : "false"); }
  if (btnTema) {
    pintarTema();
    btnTema.addEventListener("click", function () {
      var n = temaActual() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", n);
      try { localStorage.setItem("tema", n); } catch (e) {}
      pintarTema();
    });
  }

  /* Menú móvil */
  var mb = $("#menu-btn"), menu = $("#menu");
  function cerrarMenu() { if (!menu) return; body.classList.remove("menu-abierto"); menu.classList.remove("abierto"); mb.setAttribute("aria-expanded", "false"); mb.setAttribute("aria-label", "Abrir menú"); }
  if (mb && menu) {
    mb.addEventListener("click", function () {
      var abierto = menu.classList.toggle("abierto"); body.classList.toggle("menu-abierto", abierto);
      mb.setAttribute("aria-expanded", abierto ? "true" : "false");
      mb.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("abierto")) { cerrarMenu(); mb.focus(); } });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", cerrarMenu); });
    document.addEventListener("click", function (e) { if (menu.classList.contains("abierto") && !menu.contains(e.target) && !mb.contains(e.target)) cerrarMenu(); });
  }

  /* Filtros del portafolio */
  var filtros = $$(".filtro");
  if (filtros.length) {
    var items = $$(".proy-i"), cont = $("#filtros-n");
    filtros.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filtro"), n = 0;
        filtros.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        items.forEach(function (it) {
          var ok = f === "todos" || (it.getAttribute("data-cat") || "").split(" ").indexOf(f) > -1;
          it.hidden = !ok; if (ok) n++;
        });
        if (cont) cont.textContent = n + (n === 1 ? " proyecto" : " proyectos");
      });
    });
  }

  /* Ventana de detalle de proyecto (dialog nativo: maneja foco y Escape) */
  $$("[data-abrir]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = document.getElementById("m-" + b.getAttribute("data-abrir"));
      if (d && d.showModal) d.showModal();
    });
  });
  /* Visor de fotos a pantalla completa (flechas, deslizar con el dedo, Esc) */
  var lb = null, lbImgs = [], lbI = 0, lbX = null;
  function lbMostrar() {
    var im = lbImgs[lbI];
    $("img", lb).src = im.getAttribute("src"); $("img", lb).alt = im.alt;
    $(".lb-n", lb).textContent = (lbI + 1) + " / " + lbImgs.length;
    $$(".lb-prev,.lb-next", lb).forEach(function (b) { b.hidden = lbImgs.length < 2; });
  }
  function lbIr(d) { lbI = (lbI + d + lbImgs.length) % lbImgs.length; lbMostrar(); }
  function lbAbrir(modal, im) {
    if (!lb) {
      lb = document.createElement("dialog"); lb.className = "lb"; lb.setAttribute("aria-label", "Foto ampliada");
      lb.innerHTML = '<button class="lb-x" type="button" aria-label="Cerrar">\u00d7</button><button class="lb-prev" type="button" aria-label="Foto anterior">\u2039</button><img alt=""><button class="lb-next" type="button" aria-label="Foto siguiente">\u203a</button><p class="lb-n mono"></p>';
      document.body.appendChild(lb);
      $(".lb-x", lb).addEventListener("click", function () { lb.close(); });
      $(".lb-prev", lb).addEventListener("click", function () { lbIr(-1); });
      $(".lb-next", lb).addEventListener("click", function () { lbIr(1); });
      lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
      lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") lbIr(-1); if (e.key === "ArrowRight") lbIr(1); });
      lb.addEventListener("touchstart", function (e) { lbX = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener("touchend", function (e) { if (lbX === null) return; var dx = e.changedTouches[0].clientX - lbX; lbX = null; if (Math.abs(dx) > 40) lbIr(dx < 0 ? 1 : -1); });
    }
    lbImgs = $$(".modal-g img", modal); lbI = Math.max(0, lbImgs.indexOf(im));
    lbMostrar(); lb.showModal();
  }
  $$("dialog.modal").forEach(function (d) {
    d.addEventListener("click", function (e) {
      if (e.target === d) { d.close(); return; }
      var im = e.target.closest ? e.target.closest(".modal-g img") : null;
      if (im) lbAbrir(d, im);
    });
    $$(".modal-g img", d).forEach(function (im) {
      im.setAttribute("tabindex", "0"); im.setAttribute("role", "button"); im.style.cursor = "zoom-in";
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lbAbrir(d, im); } });
    });
    $$("[data-cerrar]", d).forEach(function (x) { x.addEventListener("click", function () { d.close(); }); });
  });

  /* El mismo visor en la página propia de cada proyecto */
  $$(".proy-galeria").forEach(function (g) {
    $$("img", g).forEach(function (im) {
      im.setAttribute("tabindex", "0"); im.setAttribute("role", "button"); im.style.cursor = "zoom-in";
      im.addEventListener("click", function () { lbAbrir(g, im); });
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lbAbrir(g, im); } });
    });
  });

  /* Formularios */
  var endpoint = body.getAttribute("data-endpoint") || "/api/contacto";
  var wa = body.getAttribute("data-wa") || "";
  var re = { correo: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ };

  function msg(el, texto) {
    var e = document.getElementById(el.id + "-error") || (el.name === "servicios" ? $("#cot-servicios-error") : null);
    if (!e) return;
    e.textContent = texto || ""; e.hidden = !texto;
    if (el.name !== "servicios") { if (texto) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
  }
  var nErr = 0;
  function validar(form) {
    var primero = null; nErr = 0;
    $$("input[required],select[required],textarea[required]", form).forEach(function (el) {
      var t = "", v = (el.value || "").trim();
      if (el.type === "checkbox") { if (!el.checked) t = "Necesitamos tu autorización para responderte."; }
      else if (!v) t = "Completa este campo.";
      else if (el.type === "email" && !re.correo.test(v)) t = "Escribe un correo válido, por ejemplo nombre@empresa.com.";
      else if (el.name === "mensaje" && v.length < 15) t = "Cuéntanos un poco más (mínimo 15 caracteres).";
      msg(el, t);
      if (t) nErr++;
      if (t && !primero) primero = el;
    });
    var cor = $("input[name=correo]", form), tel = $("input[name=telefono]", form);
    if (cor) {
      var vc = (cor.value || "").trim(), vt = tel ? (tel.value || "").trim() : "";
      var tc = vc && !re.correo.test(vc) ? "Escribe un correo válido, por ejemplo nombre@empresa.com." : (!vc && !vt ? "Escribe un correo o un teléfono." : "");
      msg(cor, tc); if (tc) { nErr++; primero = primero || cor; }
    }
    if (tel && tel.value && !/^[0-9 +()\-]{7,30}$/.test(tel.value.trim())) { msg(tel, "Escribe un teléfono válido."); nErr++; primero = primero || tel; } else if (tel) msg(tel, "");
    var area = $("input[name=area_m2]", form);
    if (area && area.value && !(Number(area.value) > 0)) { msg(area, "Escribe un área mayor que cero."); nErr++; primero = primero || area; } else if (area) msg(area, "");
    var srv = $$("input[name=servicios]", form);
    if (srv.length) {
      var hay = srv.some(function (x) { return x.checked; });
      var e = $("#cot-servicios-error");
      if (e) { e.textContent = hay ? "" : "Selecciona al menos un servicio."; e.hidden = hay; }
      if (!hay) nErr++;
      if (!hay && !primero) primero = srv[0];
    }
    return primero;
  }
  function datos(form) {
    var o = { servicios: [] };
    $$("input,select,textarea", form).forEach(function (el) {
      if (!el.name) return;
      if (el.type === "checkbox") { if (el.name === "servicios") { if (el.checked) o.servicios.push(el.value); } else o[el.name] = el.checked; }
      else o[el.name] = el.value.trim();
    });
    if (!o.servicios.length) delete o.servicios;
    return o;
  }
  function textoWA(d) {
    var l = ["Hola, quiero solicitar una propuesta."];
    if (d.nombre) l.push("Nombre: " + d.nombre);
    if (d.tipo_proyecto) l.push("Proyecto: " + d.tipo_proyecto);
    if (d.ubicacion) l.push("Ubicación: " + d.ubicacion);
    if (d.area_m2) l.push("Área: " + d.area_m2 + " m²");
    if (d.nivel) l.push("Nivel: " + d.nivel);
    if (d.servicio) l.push("Servicio: " + d.servicio);
    if (d.servicios) l.push("Servicios: " + d.servicios.join("; "));
    if (d.mensaje) l.push("Detalle: " + d.mensaje);
    return l.join("\n");
  }
  function estado(form, tipo, titulo, texto, sinFoco) {
    var e = $(".estado", form);
    e.className = "estado " + tipo; e.hidden = false;
    e.innerHTML = "<strong></strong><span></span>";
    e.firstChild.textContent = titulo; e.lastChild.textContent = texto;
    if (!sinFoco) e.focus();
  }
  $$("form.form").forEach(function (form) {
    var btn = $("button[type=submit]", form);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var malo = validar(form);
      if (malo) { malo.focus(); estado(form, "err", "Revisa el formulario", nErr === 1 ? "Hay 1 campo por corregir." : "Hay " + nErr + " campos por corregir.", true); return; }
      var d = datos(form);
      btn.disabled = true; $(".btn-t", btn).hidden = true; $(".btn-c", btn).hidden = false;
      var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 15000);
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d), signal: ctl.signal })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (r) {
          if (r.ok) { form.reset(); resumen(); if (typeof estimar === "function") estimar(); estado(form, "ok", "Recibimos tu mensaje", "Te responderemos por el medio que indicaste. Si es urgente, escríbenos por WhatsApp."); }
          else { estado(form, "err", "No pudimos enviar el mensaje", (r.j && r.j.error ? r.j.error + " " : "") + "Inténtalo de nuevo" + (wa ? " o escríbenos por WhatsApp." : ".")); }
        })
        .catch(function () { estado(form, "err", "Sin conexión con el servidor", "Revisa tu conexión e inténtalo de nuevo" + (wa ? ", o escríbenos por WhatsApp." : ".")); })
        .then(function () { if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} } clearTimeout(to); btn.disabled = false; $(".btn-t", btn).hidden = false; $(".btn-c", btn).hidden = true; });
    });
    var bw = $("[data-wa-form]", form);
    if (bw) bw.addEventListener("click", function () {
      var d = datos(form);
      window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(textoWA(d)), "_blank", "noopener");
    });
    $$("input,select,textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) msg(el, ""); });
    });
  });

  /* Cotizador: resumen vivo, información sugerida y precarga por URL */
  var cot = $("#form-cotizar");
  function resumen() {
    if (!cot) return;
    var sel = $$("input[name=servicios]:checked", cot);
    var r = $("#res-serv"), info = $("#res-info"), lista = $("#res-lista");
    r.textContent = "";
    var dl = $("#resumen"); if (dl) dl.hidden = !sel.length;
    if (!sel.length) { info.hidden = true; return; }
    var ul = document.createElement("ul"); ul.className = "lista";
    sel.forEach(function (c) { var li = document.createElement("li"); li.textContent = c.value.replace(/^[A-D]: /, ""); ul.appendChild(li); });
    r.appendChild(ul);
    var mapa = {}; try { mapa = JSON.parse($("#info-servicio").textContent); } catch (e) {}
    var us = {}; sel.forEach(function (c) { us[c.getAttribute("data-u")] = 1; });
    var vistos = {}; lista.textContent = "";
    Object.keys(us).forEach(function (u) { (mapa[u] || []).forEach(function (t) { if (!vistos[t]) { vistos[t] = 1; var li = document.createElement("li"); li.textContent = t; lista.appendChild(li); } }); });
    info.hidden = false;
  }

  /* Estimación referencial (solo si la página trae tarifas) */
  var tarJson = $("#tarifas"), tar = null;
  try { tar = tarJson ? JSON.parse(tarJson.textContent) : null; } catch (e) {}
  function cop(n) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: tar.moneda || "COP", maximumFractionDigits: 0 }).format(n); }
  function redondear(n) { var r = tar.redondeo || 1; return Math.round(n / r) * r; }
  function estimar() {
    if (!cot || !tar) return;
    var caja = $("#estimado"), sel = $$("input[name=servicios]:checked", cot), campoEst = $("#cot-estimacion");
    var vacio = $("#est-vacio"), barra = $("#est-barra");
    if (vacio) vacio.hidden = sel.length > 0;
    if (!sel.length) { caja.hidden = true; if (barra) barra.hidden = true; if (campoEst) campoEst.value = ""; return; }
    var area = parseFloat($("#cot-area").value) || 0;
    var f = (tar.factor_tipo && tar.factor_tipo[$("#cot-tipo").value]) || 1;
    var bajo = 0, alto = 0, lineas = [], faltaArea = false, otros = false;
    sel.forEach(function (c) {
      var t = tar.servicios[c.value], nombre = c.value.replace(/^[A-D]: /, ""), txt;
      if (!t || t.modo !== "m2") { txt = "A definir con la propuesta"; otros = true; }
      else if (!area) { txt = "Indica el área para estimar"; faltaArea = true; }
      else {
        var b = redondear(t.valor * area * f * tar.rango.bajo), a = redondear(t.valor * area * f * tar.rango.alto);
        bajo += b; alto += a; txt = cop(b) + " – " + cop(a);
      }
      lineas.push([nombre, txt]);
    });
    var ul = $("#est-lineas"), tot = $("#est-total");
    ul.textContent = "";
    lineas.forEach(function (l) {
      var li = document.createElement("li"), a = document.createElement("span"), b = document.createElement("span");
      a.textContent = l[0]; b.textContent = l[1]; b.className = "mono"; li.appendChild(a); li.appendChild(b); ul.appendChild(li);
    });
    var base;
    if (alto > 0) { base = cop(bajo) + " – " + cop(alto); tot.textContent = base + (otros || faltaArea ? " + otros por definir" : ""); }
    else { base = faltaArea ? "Falta el área para estimar" : "Valor a definir con la propuesta"; tot.textContent = base; }
    caja.hidden = false;
    if (barra) { barra.hidden = false; $("#est-barra-t").textContent = alto > 0 ? cop(bajo) + " – " + cop(alto) : base; }
    if (campoEst) campoEst.value = ("Cotización preliminar mostrada al cliente (" + (tar.demo ? "valores de ejemplo" : "referencial") + "): " + base + "\n" + lineas.map(function (l) { return l[0] + ": " + l[1]; }).join("\n")).slice(0, 1800);
  }
  var bEnv = $("#est-enviar");
  if (bEnv) bEnv.addEventListener("click", function () {
    var n = $("#cotizar-nombre"); n.scrollIntoView({ behavior: "smooth", block: "center" }); n.focus({ preventScroll: true });
  });

  if (cot) {
    var q = new URLSearchParams(location.search), u = q.get("u"), s = q.get("s");
    $$("input[name=servicios]", cot).forEach(function (c) {
      if (s && c.getAttribute("data-u") === u && c.value === u + ": " + s) c.checked = true;
      c.addEventListener("change", function () { resumen(); estimar(); });
    });
    ["#cot-area", "#cot-tipo"].forEach(function (id) { var el = $(id); el.addEventListener("input", estimar); el.addEventListener("change", estimar); });
    resumen(); estimar();
  }
})();
