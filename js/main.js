/* ==========================================================================
   Librería Cuadratín (SITIO DE DEMOSTRACIÓN, negocio ficticio)
   Concepto «Lomos»: el recurso protagonista es la balda. Los lomos salen a
   saludar cuando pasas el dedo y arrastran a los vecinos, como una estantería
   de verdad; el resto del sitio entra como sale un libro: desde detrás del
   canto.

   - `has-motion` solo se enciende si GSAP y ScrollTrigger existen de verdad.
   - Lo de «una sola vez» va con IntersectionObserver: un ScrollTrigger con
     once:true no dispara si el elemento ya está en pantalla al crearse.
   - La balda funciona SIN GSAP y con movimiento reducido: es CSS.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = gsapReady && !reduce.matches;

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (motion) raiz.classList.add('has-motion');
  }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Cortina de entrada ────────────────────────────────────────────────
     Obligatoria (§5 del pliego) y con RETIRADA GARANTIZADA: se quita
     siempre —sin GSAP, con movimiento reducido, o si algo falla a mitad—,
     porque si se queda tapa la página entera. `ESPERA` es lo que el hero
     aguanta antes de entrar, para que el relevo sea limpio.
     ────────────────────────────────────────────────────────────────────── */
  var ESPERA = 0;
  (function cortina() {
    var el = document.querySelector('[data-cortina]');
    if (!el) return;
    var fuera = false;
    function quitar() { if (fuera) return; fuera = true; el.hidden = true; }
    if (!motion) { quitar(); return; }
    ESPERA = 1.45;

    var lomos = Array.prototype.slice.call(el.querySelectorAll('.cortina__lomo'));
    var centro = el.querySelector('.cortina__centro');
    gsap.set(centro, { opacity: 0, y: 10 });
    var tl = gsap.timeline({ onComplete: quitar });
    tl.to(centro, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' })
      .to(lomos, { y: 14, duration: 0.3, ease: 'power2.inOut', stagger: 0.025 }, '-=0.2')
      .to(centro, { opacity: 0, duration: 0.28, ease: 'power1.in' }, '+=0.06')
      .to(lomos, { yPercent: -101, duration: 0.8, ease: 'expo.inOut', stagger: 0.05 }, '-=0.16');
    setTimeout(quitar, 5000);   // red de seguridad: pase lo que pase, se va
  })();


  function alEntrar(el, hacer, margen) {
    if (!('IntersectionObserver' in window)) { hacer(); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        hacer();
      });
    }, { rootMargin: margen || '0px 0px -8% 0px' });
    io.observe(el);
  }

  /* ── 1. Scroll suave ─────────────────────────────────────────────────── */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.getElementById(id.slice(1));
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      if (lenis) lenis.scrollTo(destino, { offset: -70 });
      else destino.scrollIntoView();
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ── 2. La balda (recurso protagonista) ──────────────────────────────── */
  (function balda() {
    var lista = $('[data-lomos]');
    if (!lista) return;
    var lomos = $$('.lomo', lista);

    // los vecinos se inclinan un poco, como cuando sacas un libro de verdad
    function vecinos(el) {
      var i = lomos.indexOf(el);
      lomos.forEach(function (l, j) {
        l.classList.toggle('es-vecino', j === i - 1 || j === i + 1);
      });
    }
    function limpiar() { lomos.forEach(function (l) { l.classList.remove('es-vecino'); }); }

    lomos.forEach(function (l) {
      l.addEventListener('pointerenter', function () { vecinos(l); });
      l.addEventListener('focus', function () { vecinos(l); });
      l.addEventListener('blur', limpiar);
    });
    lista.addEventListener('pointerleave', limpiar);

    // al llegar, la balda se llena de izquierda a derecha
    if (motion) {
      gsap.set(lomos, { yPercent: 108 });
      gsap.to(lomos, {
        yPercent: 0, duration: 0.7, ease: 'power3.out',
        stagger: { each: 0.028, from: 'start' }, delay: ESPERA + 0.25
      });
    }
  })();

  /* ── 3. Titulares: el texto sube desde detrás del canto ──────────────── */
  function envolver(el) {
    var texto = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', texto);
    el.innerHTML = '';
    var linea = document.createElement('span');
    linea.className = 'linea';
    linea.setAttribute('aria-hidden', 'true');
    var dentro = document.createElement('span');
    dentro.className = 'linea__texto';
    dentro.textContent = texto;
    linea.appendChild(dentro);
    el.appendChild(linea);
    return dentro;
  }

  if (motion) {
    $$('[data-linea]').forEach(function (el) {
      var dentro = envolver(el);
      // `y: 0` explícito: GSAP leería un translate heredado del CSS como píxeles
      gsap.set(dentro, { y: 0, yPercent: 105, opacity: 0 });
      var anim = { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' };
      if (el.closest('.hero')) gsap.to(dentro, Object.assign({ delay: ESPERA + 0.2 }, anim));
      else alEntrar(el, function () { gsap.to(dentro, anim); });
    });
  }

  /* ── 4. Entradas ─────────────────────────────────────────────────────── */
  if (motion) {
    [['.kicker', 12], ['.indice', 12], ['.parrafo', 14], ['.hero__entrada', 14],
     ['.hero__acciones', 14], ['.libro', 24], ['.plano__lista li', 10],
     ['.sesiones li', 12], ['.club__nota', 20], ['.pasos li', 14],
     ['.formulario', 20], ['.fichas li', 18], ['.voces li', 18]
    ].forEach(function (par) {
      $$(par[0]).forEach(function (el, i) {
        var enHero = !!el.closest('.hero');
        var ajustes = {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          startAt: { y: par[1] },
          delay: enHero ? ESPERA + 0.45 + i * 0.08 : (i % 4) * 0.05
        };
        if (enHero) gsap.to(el, ajustes);
        else alEntrar(el, function () { gsap.to(el, ajustes); });
      });
    });
  }

  /* ── 5. El plano: zonas y lista se encienden a la vez ────────────────── */
  (function plano() {
    var zonas = $$('.plano__zona');
    var items = $$('[data-plano-lista] li');
    if (!zonas.length) return;

    function marcar(zona) {
      zonas.forEach(function (z) { z.classList.toggle('es-activa', z.getAttribute('data-zona') === zona); });
      items.forEach(function (i) { i.classList.toggle('es-activa', i.getAttribute('data-zona') === zona); });
    }
    function limpiar() { marcar(null); }

    zonas.concat(items).forEach(function (el) {
      var zona = el.getAttribute('data-zona');
      el.addEventListener('pointerenter', function () { marcar(zona); });
      el.addEventListener('pointerleave', limpiar);
    });
  })();

  /* ── 6. Club de lectura: primeros jueves reales (contenido vivo) ─────── */
  (function club() {
    var lista = $('[data-sesiones]');
    if (!lista) return;

    // Títulos inventados para la demostración, en el orden en que se leerán.
    var LECTURAS = [
      ['Trece inviernos', 'Marta Salgado · Editorial Sirga'],
      ['Camiño de sirga', 'Xoán Barreiro · Edicións Marea'],
      ['El taller de las cosas rotas', 'Irene Lamas · Cuadratín Libros'],
      ['Cuarto menguante', 'Pablo Alborés · Editorial Sirga'],
      ['La lengua del río', 'Sabela Cotelo · Edicións Marea'],
      ['Tres de la tarde', 'Nuno Baltar · Cuadratín Libros']
    ];
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    function primerJueves(anio, mes) {
      var d = new Date(anio, mes, 1);
      while (d.getDay() !== 4) d.setDate(d.getDate() + 1);
      return d;
    }

    function pintar() {
      var hoy = new Date();
      var fechas = [];
      var anio = hoy.getFullYear(), mes = hoy.getMonth();
      while (fechas.length < LECTURAS.length) {
        var f = primerJueves(anio, mes);
        // si el de este mes ya pasó (contando la sesión de las 20:00), al siguiente
        var fin = new Date(f.getTime()); fin.setHours(21, 30, 0, 0);
        if (fin > hoy) fechas.push(f);
        mes++;
        if (mes > 11) { mes = 0; anio++; }
      }

      lista.innerHTML = fechas.map(function (f, i) {
        var texto = 'Jueves ' + f.getDate() + ' de ' + MESES[f.getMonth()] +
          (f.getFullYear() !== hoy.getFullYear() ? ' de ' + f.getFullYear() : '') + ' · 20:00';
        return '<li><span class="sesiones__fecha">' + texto + '</span>' +
          '<span class="sesiones__libro">' + LECTURAS[i][0] + '<em>' + LECTURAS[i][1] + '</em></span></li>';
      }).join('');
    }
    pintar();
    // por si la página se queda abierta y cambia el día
    setInterval(pintar, 60 * 60 * 1000);
  })();

  /* ── 7. Botones magnéticos ───────────────────────────────────────────── */
  if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-iman]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var c = el.getBoundingClientRect();
        qx((e.clientX - (c.left + c.width / 2)) * 0.3);
        qy((e.clientY - (c.top + c.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      el.addEventListener('blur', function () { qx(0); qy(0); });
    });
  }

  /* ── 8. Cursor: un marcapáginas ──────────────────────────────────────── */
  (function cursor() {
    var el = $('[data-cursor]');
    if (!el || !motion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var texto = $('.cursor__texto', el);
    var qx = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power3.out' });
    var qy = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); });

    var zonas = [
      ['.lomo', 'sácalo'],
      ['.libro', 'ábrelo'],
      ['.plano__zona, .plano__lista li', 'aquí'],
      ['[data-mapa-boton]', 'cargar'],
      ['a, button, input, textarea', 'pasa']
    ];
    document.addEventListener('pointerover', function (e) {
      for (var i = 0; i < zonas.length; i++) {
        if (e.target.closest(zonas[i][0])) {
          el.classList.add('es-grande');
          texto.textContent = zonas[i][1];
          return;
        }
      }
      el.classList.remove('es-grande');
      texto.textContent = '';
    });
  })();

  /* ── 9. Horario en vivo ──────────────────────────────────────────────── */
  (function horario() {
    var estado = $('[data-estado]');
    if (!estado) return;
    var filas = $$('[data-horario] > div');
    // Horario ficticio. 0 = domingo. Minutos desde medianoche.
    var HORARIO = {
      0: [],
      1: [[600, 840], [1020, 1230]],
      2: [[600, 840], [1020, 1230]],
      3: [[600, 840], [1020, 1230]],
      4: [[600, 840], [1020, 1230]],
      5: [[600, 840], [1020, 1230]],
      6: [[630, 840]]
    };
    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    function dd(n) { return String(n).padStart(2, '0'); }
    function txt(m) { return dd(Math.floor(m / 60)) + ':' + dd(m % 60); }

    function refrescar() {
      var ahora = new Date();
      var d = ahora.getDay();
      var min = ahora.getHours() * 60 + ahora.getMinutes();
      var cierra = null, abreHoy = null;
      HORARIO[d].forEach(function (t) {
        if (min >= t[0] && min < t[1]) cierra = t[1];
        else if (min < t[0] && abreHoy === null) abreHoy = t[0];
      });

      if (cierra !== null) {
        estado.textContent = 'Abierta ahora · hasta las ' + txt(cierra);
        estado.classList.add('esta-abierto');
      } else if (abreHoy !== null) {
        estado.textContent = 'Cerrada · abre hoy a las ' + txt(abreHoy);
        estado.classList.remove('esta-abierto');
      } else {
        var salto = 1;
        while (salto < 8 && HORARIO[(d + salto) % 7].length === 0) salto++;
        var dia = (d + salto) % 7;
        estado.textContent = 'Cerrada · abre el ' + DIAS[dia] + ' a las ' + txt(HORARIO[dia][0][0]);
        estado.classList.remove('esta-abierto');
      }
      filas.forEach(function (f) {
        var dias = (f.getAttribute('data-dias') || '').split(',');
        f.classList.toggle('es-hoy', dias.indexOf(String(d)) !== -1);
      });
    }
    refrescar();
    setInterval(refrescar, 30000);
  })();

  /* ── 10. Cabecera ────────────────────────────────────────────────────── */
  (function cabecera() {
    var el = $('[data-cabecera]');
    if (!el) return;
    function mirar() { el.classList.toggle('esta-pegada', window.scrollY > 20); }
    mirar();
    window.addEventListener('scroll', mirar, { passive: true });
  })();

  /* ── 11. Menú móvil ──────────────────────────────────────────────────── */
  var boton = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  function cerrarMenu() {
    if (!boton || !menu) return;
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('esta-abierto');
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('esta-abierto', !abierto);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ── 12. Mapa solo bajo clic ─────────────────────────────────────────── */
  (function mapa() {
    var caja = $('[data-mapa]');
    var btn = $('[data-mapa-boton]');
    if (!caja || !btn) return;
    btn.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Praza do Cuadrante 2, Lugo') + '&output=embed';
      marco.title = 'Mapa de la dirección de muestra: Praza do Cuadrante, 2, Lugo';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      btn.remove();
      caja.insertBefore(marco, caja.firstChild);
      if (gsapReady) ScrollTrigger.refresh();
    });
  })();

  /* ── 13. Formulario de encargo (de muestra) ──────────────────────────── */
  (function encargo() {
    var form = $('[data-encargo]');
    if (!form) return;
    var salida = $('[data-encargo-estado]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.querySelector('#nombre');
      var tel = form.querySelector('#tel');
      if (!nombre.value.trim()) { salida.textContent = 'Escribe un nombre para guardarte el libro.'; nombre.focus(); return; }
      if (!tel.value.trim()) { salida.textContent = 'Hace falta un teléfono para avisarte cuando llegue.'; tel.focus(); return; }
      salida.textContent = 'Formulario de demostración: el encargo de ' + nombre.value.trim() + ' no se ha enviado a ningún sitio.';
    });
  })();

  /* ── 14. Aviso de cookies ────────────────────────────────────────────── */
  (function cookies() {
    var banner = $('[data-cookies]');
    if (!banner) return;
    var CLAVE = 'cuadratin-cookies';
    var visto = null;
    try { visto = localStorage.getItem(CLAVE); } catch (err) { visto = null; }
    if (!visto) banner.hidden = false;
    var ok = $('[data-cookies-ok]', banner);
    if (ok) {
      ok.addEventListener('click', function () {
        banner.hidden = true;
        try { localStorage.setItem(CLAVE, '1'); } catch (err) { /* modo privado */ }
      });
    }
  })();

  /* ── 15. Refrescos ───────────────────────────────────────────────────── */
  if (gsapReady) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
