// Home page touches carried over from the old Django portfolio: the rotating
// "I'm ..." greeting and a particle field behind the page. Self-contained (no
// CDN), paused while the tab is hidden, and still for visitors who ask for
// reduced motion.
(function () {
  "use strict";
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Rotating greeting: fade out, swap the words, fade back in.
  var role = document.getElementById("role");
  if (role && !still) {
    var roles = ["a future doctor", "a programmer"];
    var i = 0;
    setInterval(function () {
      role.style.opacity = 0;
      setTimeout(function () {
        i = (i + 1) % roles.length;
        role.textContent = roles[i];
        role.style.opacity = 1;
      }, 500);
    }, 2500);
  }

  // Particle field: dots drift, nearby dots link up, links reach toward the
  // cursor, a click adds a few more.
  var canvas = document.getElementById("particles");
  if (!canvas || !canvas.getContext) return;
  // Lift the canvas out of the page content so it sits behind header, text
  // and footer (they are z-index 1; the canvas is 0 at body level).
  if (canvas.parentNode !== document.body) document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var dots = [], mouse = null, w = 0, h = 0, running = true;
  var LINK = 160, GRAB = 140, MAX = 90;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function add(x, y) {
    var speed = still ? 0 : 0.35;
    dots.push({
      x: x, y: y, r: 0.8 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 2 * speed, vy: (Math.random() - 0.5) * 2 * speed
    });
  }
  function seed() {
    dots = [];
    var n = Math.round(Math.min(70, (w * h) / 22000));
    for (var k = 0; k < n; k++) add(Math.random() * w, Math.random() * h);
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (var a = 0; a < dots.length; a++) {
      var p = dots[a];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      for (var b = a + 1; b < dots.length; b++) {
        var q = dots[b], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = "rgba(138,138,138," + (0.35 * (1 - d / LINK)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      if (mouse) {
        var mx = p.x - mouse.x, my = p.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
        if (md < GRAB) {
          ctx.strokeStyle = "rgba(239,239,239," + (0.5 * (1 - md / GRAB)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(239,239,239,0.55)";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (running && !still) window.requestAnimationFrame(frame);
  }

  resize(); seed(); frame();
  window.addEventListener("resize", function () { resize(); seed(); if (still) frame(); });
  window.addEventListener("mousemove", function (e) { mouse = { x: e.clientX, y: e.clientY }; });
  window.addEventListener("mouseout", function () { mouse = null; });
  window.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) return;
    for (var k = 0; k < 4 && dots.length < MAX; k++) add(e.clientX, e.clientY);
    if (still) frame();
  });
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running && !still) window.requestAnimationFrame(frame);
  });
})();
