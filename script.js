/* ============================================================
   The Thief's Cut — comportamiento
   1. La antorcha recorre el plano de la portada
   2. Los bloques aparecen al bajar
   3. Visor de la galería
   4. El juego se carga solo cuando lo piden
   ============================================================ */

(function () {
  'use strict';

  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Antorcha sobre el plano ---------- */

  var plano = document.getElementById('plano');

  if (plano) {
    if (punteroFino) {
      plano.addEventListener('pointermove', function (e) {
        var caja = plano.getBoundingClientRect();
        plano.style.setProperty('--mx', (e.clientX - caja.left) + 'px');
        plano.style.setProperty('--my', (e.clientY - caja.top) + 'px');
      });

      plano.addEventListener('pointerleave', function () {
        plano.style.setProperty('--mx', '50%');
        plano.style.setProperty('--my', '45%');
      });
    } else if (!menosMovimiento) {
      // Sin cursor: la luz recorre el plano sola, como una ronda
      var inicio = null;

      var ronda = function (t) {
        if (inicio === null) inicio = t;
        var s = (t - inicio) / 1000;
        var caja = plano.getBoundingClientRect();
        var x = caja.width * (0.5 + 0.28 * Math.sin(s * 0.34));
        var y = caja.height * (0.48 + 0.24 * Math.sin(s * 0.19 + 1.1));
        plano.style.setProperty('--mx', x + 'px');
        plano.style.setProperty('--my', y + 'px');
        requestAnimationFrame(ronda);
      };

      requestAnimationFrame(ronda);
    }
  }

  /* ---------- 2. Revelado al bajar ---------- */

  var bloques = document.querySelectorAll('.revelar');

  if (menosMovimiento || !('IntersectionObserver' in window)) {
    bloques.forEach(function (b) { b.classList.add('visto'); });
  } else {
    var vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visto');
          vigia.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    bloques.forEach(function (b, i) {
      b.style.transitionDelay = (i % 4) * 90 + 'ms';
      vigia.observe(b);
    });
  }

  /* ---------- 4. Visor de la galería ---------- */

  var piezas = Array.prototype.slice.call(
    document.querySelectorAll('.galeria__pieza img')
  );
  var visor = document.getElementById('visor');

  if (piezas.length && visor) {
    var visorImg = document.getElementById('visor-img');
    var visorPie = document.getElementById('visor-pie');
    var actual = 0;
    var previo = null;

    function mostrar(i) {
      actual = (i + piezas.length) % piezas.length;
      var img = piezas[actual];
      var pie = img.parentElement.querySelector('figcaption');

      visorImg.src = img.currentSrc || img.src;
      visorImg.alt = img.alt || '';
      visorPie.textContent = pie ? pie.textContent : '';
    }

    function abrir(i) {
      previo = document.activeElement;
      mostrar(i);
      visor.hidden = false;
      document.body.style.overflow = 'hidden';
      visor.querySelector('[data-visor="cerrar"]').focus();
    }

    function cerrar() {
      visor.hidden = true;
      visorImg.src = '';
      document.body.style.overflow = '';
      if (previo && previo.focus) previo.focus();
    }

    // Cada imagen abre el visor, con mouse y con teclado
    piezas.forEach(function (img, i) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');

      img.addEventListener('click', function () { abrir(i); });

      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrir(i);
        }
      });
    });

    visor.addEventListener('click', function (e) {
      var accion = e.target.getAttribute('data-visor');

      if (accion === 'cerrar') cerrar();
      else if (accion === 'atras') mostrar(actual - 1);
      else if (accion === 'siguiente') mostrar(actual + 1);
      else if (e.target === visor) cerrar(); // clic en el fondo
    });

    document.addEventListener('keydown', function (e) {
      if (visor.hidden) return;

      if (e.key === 'Escape') cerrar();
      else if (e.key === 'ArrowLeft') mostrar(actual - 1);
      else if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
  }

  /* ---------- 5. Cargar el juego bajo demanda ---------- */

  var encender = document.getElementById('encender');
  var caja = document.querySelector('.marco__caja');

  if (encender && caja) {
    encender.addEventListener('click', function () {
      var fuente = caja.getAttribute('data-juego');
      if (!fuente) return;

      var marco = document.createElement('iframe');
      marco.src = fuente;
      marco.title = "The Thief's Cut — versión jugable";
      marco.allow = 'fullscreen; autoplay; gamepad';
      marco.setAttribute('allowfullscreen', '');

      caja.appendChild(marco);
      caja.querySelector('.marco__portada').remove();
      marco.focus();
    });
  }
})();
