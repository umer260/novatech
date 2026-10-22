(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var root = document.documentElement;
  var themeBtn = $('#theme');
  function paintTheme() {
    var light = root.dataset.theme === 'light';
    if (themeBtn) {
      themeBtn.textContent = light ? '☾' : '☀';
      themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }
  paintTheme();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('nt-theme', next); } catch (e) {}
    paintTheme();
  });

  var nav = $('#nav'), burger = $('#burger'), header = $('.hd');
  if (burger) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
  });
  var sec = document.body.dataset.sec;
  var active = sec && $('#nav a[href="' + sec + '.html"]');
  if (active) active.setAttribute('aria-current', 'page');

  var top = $('.top');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('stuck', y > 8);
    top.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  $$('.reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  function count(el) {
    var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 }) : null;
  $$('[data-count]').forEach(function (el) { cio ? cio.observe(el) : (el.textContent = el.dataset.count + (el.dataset.suffix || '')); });

  var demo = $('[data-demo]');
  if (demo) {
    var prompts = [
      ['Predict which customers will cancel next month', 'Churn model trained on 14 months of data. 91% accuracy. Dashboard ready in 3 weeks.'],
      ['Answer support tickets from our help docs', 'Retrieval chatbot live in 10 days. Handles 62% of tickets without an agent.'],
      ['Move our monolith to Kubernetes without downtime', 'Blue-green rollout plan, 40 services, zero planned downtime. Cutover in 6 weeks.'],
      ['Ship a delivery app for iOS and Android', 'One Flutter codebase, live tracking, push alerts. First store build in 8 weeks.']
    ];
    var q = $('.q', demo), a = $('.a', demo), i = 0;
    var run = function () {
      var p = prompts[i % prompts.length], n = 0;
      q.textContent = ''; a.textContent = ''; a.classList.remove('on');
      var t = setInterval(function () {
        q.textContent = p[0].slice(0, ++n);
        if (n >= p[0].length) {
          clearInterval(t); a.textContent = p[1]; a.classList.add('on'); i++;
          setTimeout(run, 3400);
        }
      }, 34);
    };
    if (reduce) { q.textContent = prompts[0][0]; a.textContent = prompts[0][1]; a.classList.add('on'); } else run();
  }

  $$('[data-filterable]').forEach(function (box) {
    var items = $$('[data-cat]', box), btns = $$('.chips button', box), input = $('[data-q]', box), empty = $('.empty', box);
    var f = 'all';
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '', shown = 0;
      items.forEach(function (it) {
        var ok = (f === 'all' || it.dataset.cat.split(' ').indexOf(f) > -1) && (!q || it.textContent.toLowerCase().indexOf(q) > -1);
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        f = b.dataset.f;
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
  });

  var bill = $('[data-billing]');
  if (bill) {
    var yearly = false;
    bill.addEventListener('click', function () {
      yearly = !yearly;
      bill.setAttribute('aria-pressed', yearly);
      $$('.price').forEach(function (p) { p.textContent = '$' + (yearly ? p.dataset.y : p.dataset.m); });
      $$('.per').forEach(function (p) { p.textContent = yearly ? 'per month, billed yearly' : 'per month, billed monthly'; });
    });
  }

  $$('.faq .it').forEach(function (it) {
    var b = $('button', it);
    b.addEventListener('click', function () {
      var open = it.classList.toggle('open');
      b.setAttribute('aria-expanded', open);
    });
  });

  var form = $('#contact-form');
  if (form) {
    var rules = {
      name: function (v) { return v.length >= 2 ? '' : 'Enter your full name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address, like name@company.com.'; },
      message: function (v) { return v.length >= 20 ? '' : 'Tell us a little more. At least 20 characters.'; }
    };
    function check(name) {
      var el = form.elements[name], msg = rules[name](el.value.trim());
      el.closest('.field').classList.toggle('bad', !!msg);
      el.setAttribute('aria-invalid', !!msg);
      $('.err', el.closest('.field')).textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (n) { form.elements[n].addEventListener('blur', function () { check(n); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var good = Object.keys(rules).map(check).every(Boolean);
      if (!good) { var bad = $('.bad input, .bad textarea', form); if (bad) bad.focus(); return; }
      form.hidden = true;
      var ok = $('#sent');
      ok.hidden = false;
      $('.who-name', ok).textContent = form.elements.name.value.trim().split(' ')[0];
      ok.focus();
    });
  }
})();
