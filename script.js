/* ============================================================
   Nadie Sale Solo — comportamiento
   1. La antorcha recorre el plano de la portada
   2. Los bloques aparecen al bajar
   3. El juego se carga solo cuando lo piden
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

  /* ---------- 3. Cargar el juego bajo demanda ---------- */

  var encender = document.getElementById('encender');
  var caja = document.querySelector('.marco__caja');

  if (encender && caja) {
    encender.addEventListener('click', function () {
      var fuente = caja.getAttribute('data-juego');
      if (!fuente) return;

      var marco = document.createElement('iframe');
      marco.src = fuente;
      marco.title = 'Nadie Sale Solo — versión jugable';
      marco.allow = 'fullscreen; autoplay; gamepad';
      marco.setAttribute('allowfullscreen', '');

      caja.appendChild(marco);
      caja.querySelector('.marco__portada').remove();
      marco.focus();
    });
  }
})();
