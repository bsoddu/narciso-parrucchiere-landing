// Cookie banner — sposta anche il bottone WhatsApp fluttuante mentre il banner e' visibile
// (altrimenti su mobile il banner (z-index piu' alto) copre il bottone WA)
(function () {
  var banner = document.getElementById('ck');
  var okBtn = document.getElementById('ck-ok');
  var noBtn = document.getElementById('ck-no');

  function syncWaOffset() {
    var h = banner.classList.contains('show') ? banner.offsetHeight : 0;
    document.documentElement.style.setProperty('--wa-off', h + 'px');
  }

  if (!localStorage.getItem('narciso_cookies_choice')) {
    banner.classList.add('show');
  }
  syncWaOffset();
  window.addEventListener('resize', syncWaOffset);

  okBtn.addEventListener('click', function () {
    localStorage.setItem('narciso_cookies_choice', 'accepted');
    banner.classList.remove('show');
    syncWaOffset();
  });
  noBtn.addEventListener('click', function () {
    localStorage.setItem('narciso_cookies_choice', 'rejected');
    banner.classList.remove('show');
    syncWaOffset();
  });
})();

// Booking form — button-group selection + WhatsApp submit
(function () {
  var form = document.getElementById('bf');
  var svcInput = document.getElementById('svcInput');
  var msg = document.getElementById('fmsg');
  var selectedService = '';
  var selectedTime = '';

  document.querySelectorAll('#svcButtons .tb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#svcButtons .tb').forEach(function (b) { b.classList.remove('sel'); });
      btn.classList.add('sel');
      selectedService = btn.dataset.s;
      svcInput.value = selectedService;
    });
  });
  document.querySelectorAll('#timeButtons .tb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#timeButtons .tb').forEach(function (b) { b.classList.remove('sel'); });
      btn.classList.add('sel');
      selectedTime = btn.dataset.t;
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.bot.value) return; // honeypot

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var privacy = form.privacy.checked;

    if (!name || !phone) {
      msg.textContent = 'Compila nome e telefono.';
      return;
    }
    if (!privacy) {
      msg.textContent = 'Devi accettare la privacy policy.';
      return;
    }

    var lines = [
      'Ciao! Vorrei prenotare un turno.',
      'Nome: ' + name,
      'Telefono: ' + phone,
    ];
    if (selectedService) lines.push('Servizio: ' + selectedService);
    if (selectedTime) lines.push('Preferenza orario: ' + selectedTime);

    var text = encodeURIComponent(lines.join('\n'));
    msg.textContent = 'Ti sto portando su WhatsApp...';
    window.open('https://wa.me/393403098857?text=' + text, '_blank', 'noopener,noreferrer');
  });
})();

// Low-power detection
const cores = navigator.hardwareConcurrency || 4;
const mem = navigator.deviceMemory || 8;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPower = prefersReduced || cores <= 2 || mem <= 4;
if (isLowPower) document.documentElement.classList.add('low-power');

let animationsStarted = false;

function initMarquee() {
  if (isLowPower || typeof gsap === 'undefined') return;
  const track = document.getElementById('mq');
  if (!track) return;
  const halfWidth = track.scrollWidth / 2;
  gsap.to(track, { x: -halfWidth, duration: 24, ease: 'none', repeat: -1 });
}

function initLenis() {
  if (isLowPower || typeof Lenis === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
  const lenis = new Lenis({
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(500, 33);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  lenis.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  });
  window._lenis = lenis;
}

function boot() {
  if (animationsStarted) return;
  animationsStarted = true;
  initMarquee();
  initLenis();
  if (typeof ScrollTrigger !== 'undefined') {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

window.addEventListener('load', () => {
  document.fonts.ready.then(boot).catch(boot);
  setTimeout(boot, 2500);
});
