/* ================================================
   XYZ — Cosmos: animación del canvas principal
   Ejes cartesianos + campo de estrellas
   ================================================ */

(function () {
  const canvas = document.getElementById('cosmos');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  let stars = [];
  let startTime = null;

  /* ── Tiempos (ms) ── */
  const T = {
    STARS_IN:       700,
    AXES_START:     900,
    AXES_DURATION: 1400,
    IDENTITY_SHOW: 2500,
    TAGLINE_SHOW:  3100,
  };

  const STAR_COUNT = 130;

  /* ── Setup ── */

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
  }

  function spawnStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.15,
        base: Math.random() * 0.55 + 0.1,
        speed: Math.random() * 0.018 + 0.004,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ── Easing ── */

  function easeInOut(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Dibujo ── */

  function drawStars(elapsed) {
    const globalAlpha = Math.min(1, elapsed / T.STARS_IN);
    stars.forEach(s => {
      const twinkle = Math.sin(elapsed * s.speed + s.phase) * 0.28 + 0.72;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.base * twinkle * globalAlpha})`;
      ctx.fill();
    });
  }

  function drawArrowhead(x, y, angle, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * 0.42);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size * 0.42);
    ctx.stroke();
    ctx.restore();
  }

  function drawAxes(elapsed) {
    if (elapsed < T.AXES_START) return;

    const raw = (elapsed - T.AXES_START) / T.AXES_DURATION;
    const p   = Math.min(1, raw);
    const e   = easeInOut(p);

    const axisLen  = Math.min(W, H) * 0.34;
    const zLen     = axisLen * 0.62;
    const zAngle   = Math.PI + Math.PI / 5.5; /* ~213° — hacia la izquierda-abajo */
    const lineAlpha = 0.22;

    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);

    /* X: horizontal */
    ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
    ctx.beginPath();
    ctx.moveTo(cx - axisLen * e, cy);
    ctx.lineTo(cx + axisLen * e, cy);
    ctx.stroke();

    /* Y: vertical */
    ctx.beginPath();
    ctx.moveTo(cx, cy + axisLen * e);
    ctx.lineTo(cx, cy - axisLen * e);
    ctx.stroke();

    /* Z: diagonal perspectiva */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(zAngle) * zLen * e,
               cy + Math.sin(zAngle) * zLen * e);
    ctx.stroke();

    /* Punto origen */
    const dotAlpha = Math.max(0, (p - 0.35) / 0.35) * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${dotAlpha})`;
    ctx.fill();

    /* Puntas de flecha — aparecen al final */
    if (p > 0.85) {
      const arrowAlpha = ((p - 0.85) / 0.15) * lineAlpha;
      const aSize = 6;
      drawArrowhead(cx + axisLen * e, cy,                                  0,         aSize, arrowAlpha);
      drawArrowhead(cx,               cy - axisLen * e,                   -Math.PI/2, aSize, arrowAlpha);
      drawArrowhead(cx + Math.cos(zAngle) * zLen * e,
                   cy + Math.sin(zAngle) * zLen * e,                       zAngle,    aSize, arrowAlpha);
    }

    /* Etiquetas de eje */
    if (p > 0.92) {
      const lAlpha = ((p - 0.92) / 0.08) * 0.18;
      ctx.fillStyle = `rgba(255,255,255,${lAlpha})`;
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText('x', cx + axisLen * e + 10,  cy + 4);
      ctx.fillText('y', cx + 7,                  cy - axisLen * e - 8);
      ctx.fillText('z', cx + Math.cos(zAngle) * zLen * e - 16,
                        cy + Math.sin(zAngle) * zLen * e + 13);
    }

    ctx.restore();
  }

  /* ── Revelar texto ── */

  function revealText(elapsed) {
    const identity = document.getElementById('heroIdentity');
    const tagline  = document.getElementById('heroTagline');

    if (elapsed >= T.IDENTITY_SHOW && identity && !identity.classList.contains('visible')) {
      identity.classList.add('visible');
    }
    if (elapsed >= T.TAGLINE_SHOW && tagline && !tagline.classList.contains('visible')) {
      tagline.classList.add('visible');
    }
  }

  /* ── Loop ── */

  function loop(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    ctx.clearRect(0, 0, W, H);
    drawStars(elapsed);
    drawAxes(elapsed);
    revealText(elapsed);

    requestAnimationFrame(loop);
  }

  /* ── Init ── */

  resize();
  spawnStars();
  requestAnimationFrame(loop);

  window.addEventListener('resize', () => {
    resize();
    spawnStars();
  });

})();
