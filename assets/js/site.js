/* SurgeLab marketing site — one small script, plus anime.js for the showy bits.
   The page works with all of this switched off. Every animation respects
   prefers-reduced-motion. anime.js is optional: if it has not loaded, the CSS
   reveals take over. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var A = window.anime && window.anime.animate ? window.anime : null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!(A && !reduce)) document.documentElement.classList.remove("js-anime");

  /* ---------------------------------------------------------- nav menu */
  $$(".menu-btn").forEach(function (menuBtn) {
    var mobileNav = document.getElementById(menuBtn.getAttribute("aria-controls"));
    if (!mobileNav) return;
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
    });
  });

  /* ------------------------------------------------ observer helper */
  function onEnter(els, cb, threshold, margin) {
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
    }, { threshold: threshold || 0.15, rootMargin: margin || "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------- reveal on scroll */
  var revealEls = $$("[data-reveal]");
  if (A && !reduce) {
    // The starting state lives in the stylesheet (.js-anime), so nothing is written to the DOM until an element is about to appear.
    onEnter(revealEls, function (el) {
      var kind = el.getAttribute("data-reveal");
      var delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
      var from = kind === "left" ? { x: { from: -40 } } : kind === "right" ? { x: { from: 40 } } : kind === "scale" ? { scale: { from: 0.94 }, y: { from: 24 } } : { y: { from: 36 } };
      A.animate(el, Object.assign({ opacity: { from: 0, to: 1 }, duration: 1100, delay: delay, ease: "outExpo" }, from));
      el.classList.add("is-in");
    });
  } else {
    onEnter(revealEls, function (el) { el.classList.add("is-in"); });
  }

  /* ----------------------------------------------- numbers that count */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-decimals") || "0") | 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var fmt = function (n) { return prefix + n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; };
    if (reduce) { el.textContent = fmt(target); return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }
  onEnter($$("[data-count]"), countUp, 0.4);

  /* --------------------------------------------- bars that fill */
  onEnter($$("[data-fill]"), function (el) { el.style.width = el.getAttribute("data-fill") + "%"; if (el.hasAttribute("data-fixed-fill")) el.style.setProperty("--fixed", el.getAttribute("data-fixed-fill") + "%"); }, 0.2);
  onEnter($$(".chart, .feed"), function (el) { el.classList.add("is-in"); }, 0.3);
  onEnter($$(".donut .d-seg"), function (el) { el.style.strokeDashoffset = el.getAttribute("data-offset"); }, 0.3);

  var hero = $(".hero");

  /* --------------------------------------- the hero HUD score animation */
  var hud = $(".hud");
  if (hud) {
    var ring = $(".ring .bar", hud);
    var num = $(".ring .num b", hud);
    var gates = $$(".gate", hud);
    var total = parseInt(hud.getAttribute("data-score") || "0", 10);
    function playHud() {
      if (ring) ring.style.strokeDashoffset = String(314 - (314 * total) / 100);
      if (num) { num.setAttribute("data-count", String(total)); countUp(num); }
      gates.forEach(function (g, i) {
        var bar = $(".bar i", g);
        setTimeout(function () {
          g.classList.add("is-in");
          if (bar) bar.style.width = (parseInt(bar.getAttribute("data-pts"), 10) / 20) * 100 + "%";
        }, reduce ? 0 : 300 + i * 220);
      });
    }
    setTimeout(playHud, reduce ? 0 : 900);
    // "See it fixed": the same card, after SurgeLab has done its job.
    var fixBtn = $(".fixbtn", hud);
    var verdict = $(".hud-verdict .display", hud);
    var verdictP = $(".hud-verdict p", hud);
    if (fixBtn) {
      var pop = document.createElement("span"); pop.className = "pop"; pop.textContent = "+33 points after fixing"; (verdictP ? verdictP.parentNode : hud).appendChild(pop);
      fixBtn.addEventListener("click", function () {
        var fixed = hud.classList.toggle("is-fixed");
        var score = fixed ? parseInt(fixBtn.getAttribute("data-fixed"), 10) : total;
        if (ring) ring.style.strokeDashoffset = String(314 - (314 * score) / 100);
        if (num) { num.setAttribute("data-count", String(score)); countUp(num); }
        gates.forEach(function (g, i) {
          var bar = $(".bar i", g); var pts = $(".pts", g);
          var v = fixed ? parseInt(bar.getAttribute("data-fixed"), 10) : parseInt(bar.getAttribute("data-pts"), 10);
          setTimeout(function () { bar.style.width = (v / 20) * 100 + "%"; pts.textContent = v + "/20"; }, reduce ? 0 : i * 120);
        });
        if (verdict) verdict.textContent = verdict.getAttribute(fixed ? "data-after" : "data-before");
        if (verdictP) verdictP.textContent = verdictP.getAttribute(fixed ? "data-after" : "data-before");
        fixBtn.innerHTML = (fixed ? "Back to before" : "See it fixed") + ' <span class="arrow" aria-hidden="true">&rarr;</span>';
      });
    }
    if (finePointer && !reduce && hero) {
      hero.addEventListener("pointermove", function (ev) {
        var r = hud.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
        hud.style.transform = "perspective(1200px) rotateY(" + (dx * 7).toFixed(2) + "deg) rotateX(" + (-dy * 7).toFixed(2) + "deg)";
      });
      hero.addEventListener("pointerleave", function () { hud.style.transform = ""; });
    }
  }

  /* ------------------------------------------------ scroll progress bar */
  var prog = $(".progress i");
  if (prog) {
    var pTick = false;
    function progress() { pTick = false; var h = document.documentElement.scrollHeight - window.innerHeight; prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%"; }
    window.addEventListener("scroll", function () { if (!pTick) { requestAnimationFrame(progress); pTick = true; } }, { passive: true });
    progress();
  }

  /* ---------------------------------------------- hero parallax layers */
  var layers = $$(".hero-layer[data-depth]");
  if (layers.length && !reduce) {
    var ticking = false;
    function parallax() {
      var y = window.scrollY || window.pageYOffset;
      layers.forEach(function (l) { l.style.transform = "translate3d(0," + (y * parseFloat(l.getAttribute("data-depth"))).toFixed(1) + "px,0)"; });
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(parallax); ticking = true; } }, { passive: true });
  }

  /* --------------------------------- spotlight on cards, magnetic buttons */
  if (finePointer && !reduce) {
    document.addEventListener("pointermove", function (ev) {
      var card = ev.target.closest && ev.target.closest(".card");
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((ev.clientY - r.top) / r.height) * 100 + "%");
      }
      var btn = ev.target.closest && ev.target.closest(".btn");
      if (btn) {
        var b = btn.getBoundingClientRect();
        btn.style.setProperty("--mx-btn", ((ev.clientX - (b.left + b.width / 2)) / b.width * 10).toFixed(1) + "px");
        btn.style.setProperty("--my-btn", ((ev.clientY - (b.top + b.height / 2)) / b.height * 8).toFixed(1) + "px");
      }
    }, { passive: true });
    document.addEventListener("pointerout", function (ev) {
      var btn = ev.target.closest && ev.target.closest(".btn");
      if (btn && !btn.contains(ev.relatedTarget)) { btn.style.setProperty("--mx-btn", "0px"); btn.style.setProperty("--my-btn", "0px"); }
    });
  }

  /* ---------------------------------- sticky horizontal "how it works" */
  var how = $(".how");
  var howTrack = $(".how-track");
  var howBar = $(".how-progress i");
  var wide = window.matchMedia("(min-width: 1024px)");
  if (how && howTrack && !reduce) {
    var hTick = false;
    function drive() {
      hTick = false;
      if (!wide.matches) { howTrack.style.transform = ""; if (howBar) howBar.style.width = ""; return; }
      var r = how.getBoundingClientRect();
      var range = how.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / range));
      var max = howTrack.scrollWidth - how.clientWidth + parseFloat(getComputedStyle(how).paddingLeft || 0);
      howTrack.style.transform = "translate3d(" + (-p * max).toFixed(1) + "px,0,0)";
      if (howBar) howBar.style.width = p * 100 + "%";
    }
    window.addEventListener("scroll", function () { if (!hTick) { requestAnimationFrame(drive); hTick = true; } }, { passive: true });
    window.addEventListener("resize", drive);
    drive();
  }

  /* --------------------------------------- staggered grids with anime */
  if (A && !reduce) {
    $$("[data-stagger]").forEach(function (group) {
      var kids = Array.prototype.slice.call(group.children);
      onEnter([group], function () {
        A.animate(kids, { opacity: { from: 0, to: 1 }, y: { from: 40, to: 0 }, scale: { from: 0.97, to: 1 }, duration: 1000, delay: A.stagger(90, { from: group.getAttribute("data-stagger") || "first" }), ease: "outExpo" });
        group.classList.add("is-in");
      }, 0.02, "0px 0px -40px 0px");
    });
    // The line chart draws itself in.
    var drawable = $$(".chart .line");
    if (drawable.length && A.svg && A.svg.createDrawable) {
      var d = A.svg.createDrawable(drawable);
      onEnter([$(".chart .line").closest(".panel")], function () {
        A.animate(d, { draw: "0 1", duration: 1800, ease: "inOutSine" });
      }, 0.3);
    }
  }

  /* --------------------------------------------- monthly / annual toggle */
  var toggle = $(".seg-billing");
  if (toggle) {
    var price = $(".plan .price");
    var amt = $(".plan .price .amt");
    var per = $(".plan .price small");
    var annualNote = $(".plan .annual-note");
    var buttons = $$("button", toggle);
    function setMode(mode) {
      toggle.setAttribute("data-mode", mode);
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
      var apply = function () {
        amt.textContent = mode === "annual" ? "2,149" : "199";
        per.textContent = mode === "annual" ? "a year" : "a month";
        if (annualNote) annualNote.hidden = mode !== "annual";
      };
      if (reduce) { apply(); return; }
      price.classList.add("is-flipping");
      setTimeout(function () { apply(); price.classList.remove("is-flipping"); }, 180);
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  }

  /* ------------------------------------------ customers / agencies switch */
  var who = $(".seg-who");
  if (who) {
    var panels = { customers: $("#panel-customers"), agencies: $("#panel-agencies") };
    var whoBtns = $$("button", who);
    function setWho(mode) {
      who.setAttribute("data-mode", mode);
      whoBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
      Object.keys(panels).forEach(function (k) {
        var p = panels[k]; if (!p) return;
        if (k === mode) {
          p.hidden = false;
          if (A && !reduce) { A.utils.set(p, { opacity: 0, y: 20 }); A.animate(p, { opacity: 1, y: 0, duration: 700, ease: "outExpo" }); }
        } else { p.hidden = true; }
      });
    }
    whoBtns.forEach(function (b) { b.addEventListener("click", function () { setWho(b.getAttribute("data-mode")); }); });
  }

  /* ------------------------------------------------- audit hand-off form */
  var auditForm = $("#audit-form");
  if (auditForm) {
    auditForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var input = $("input[name=site]", auditForm);
      var v = (input.value || "").trim();
      var base = "https://socialtool.surgelab.co/can-ai-book-you";
      if (v) { if (!/^https?:\/\//i.test(v)) v = "https://" + v; window.location.href = base + "?site=" + encodeURIComponent(v); }
      else { window.location.href = base; }
    });
  }

  /* ------------------------------------------- five doors and business type */
  onEnter($$(".doors"), function (el) { el.classList.add("is-in"); $$(".door", el).forEach(function (d, i) { d.style.setProperty("--dd", (500 + i * 600) + "ms"); }); }, 0.4);
  onEnter($$(".level"), function (el) { el.classList.add("is-in"); }, 0.3);
  var vseg = $(".seg-vertical");
  if (vseg) {
    $$("button", vseg).forEach(function (b) {
      b.addEventListener("click", function () {
        var mode = b.getAttribute("data-mode");
        vseg.setAttribute("data-mode", mode);
        $$("button", vseg).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        $$("[data-v]").forEach(function (el) {
          var txt = el.getAttribute("data-" + mode); if (!txt) return;
          if (A && !reduce) { A.animate(el, { opacity: [1, 0], duration: 160, ease: "linear", onComplete: function () { el.textContent = txt; A.animate(el, { opacity: [0, 1], duration: 300, ease: "outQuad" }); } }); }
          else { el.textContent = txt; }
        });
      });
    });
  }

  /* ---------------------------------------------- agency calculator */
  var cb = $("#c-brands"), cp = $("#c-price");
  if (cb && cp) {
    var tiles = $("#tiles");
    for (var ti = 0; ti < 30; ti++) { var t = document.createElement("i"); tiles.appendChild(t); }
    var tileEls = $$("i", tiles);
    function calc() {
      var n = parseInt(cb.value, 10), p = parseInt(cp.value, 10);
      var lvl = n >= 10 ? 3 : n >= 5 ? 2 : 1;
      $("#o-brands").textContent = n; $("#o-price").textContent = "£" + p;
      var lv = $("#o-level"); lv.textContent = "Level " + lvl; lv.className = "display lv" + lvl;
      $("#o-month").textContent = "£" + (n * p).toLocaleString("en-GB");
      $("#o-year").textContent = "£" + (n * p * 12).toLocaleString("en-GB");
      tileEls.forEach(function (t, i) { t.className = i < n ? "on l" + lvl : ""; });
    }
    cb.addEventListener("input", calc); cp.addEventListener("input", calc); calc();
  }

  /* ------------------------------------------------ text that lights up as you scroll */
  $$(".text-reveal").forEach(function (el) {
    var words = el.textContent.split(" ");
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var ws = $$(".w", el);
    if (reduce) { ws.forEach(function (w) { w.classList.add("on"); }); return; }
    var tick = false;
    function paint() {
      tick = false;
      var r = el.getBoundingClientRect(); var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      var n = Math.round(p * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    }
    window.addEventListener("scroll", function () { if (!tick) { requestAnimationFrame(paint); tick = true; } }, { passive: true });
    paint();
  });
  /* sparkles */
  $$(".cta-band").forEach(function (band) {
    if (reduce) return;
    for (var i = 0; i < 9; i++) { var s = document.createElement("i"); s.className = "spark"; s.style.setProperty("--x", (5 + Math.random() * 90) + "%"); s.style.setProperty("--y", (8 + Math.random() * 84) + "%"); s.style.setProperty("--d", (Math.random() * 5) + "s"); band.appendChild(s); }
  });

  /* ------------------------------------------- lazy video at the bottom */
  var vids = $$("video.lazy-video");
  if (vids.length && !reduce) {
    onEnter(vids, function (v) {
      $$("source[data-src]", v).forEach(function (s) { s.src = s.getAttribute("data-src"); });
      v.load(); v.play().catch(function () {});
    }, 0.1, "300px 0px");
  }

  /* ------------------------------------------------ achievement toasts */
  var toastBox = $("#toasts");
  function toast(title, sub, icon, href) {
    if (!toastBox || reduce) return;
    var t = document.createElement(href ? "a" : "div"); t.className = "toast";
    if (href) t.href = href;
    var ic = document.createElement("span"); ic.className = "t-ic"; ic.textContent = icon;
    var body = document.createElement("span"); var b = document.createElement("b"); b.textContent = title; var sm = document.createElement("small"); sm.textContent = sub;
    body.appendChild(b); body.appendChild(sm); t.appendChild(ic); t.appendChild(body);
    toastBox.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add("on"); }); });
    setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.remove(); }, 500); }, href ? 7000 : 3400);
  }
  var gateCards = $$(".gate-card"); var gatesSeen = 0;
  if (gateCards.length && !reduce) {
    onEnter(gateCards, function (g) {
      gatesSeen++;
      var name = ($("h3", g) || {}).textContent || "Level"; var badge = ($(".badge", g) || {}).textContent || String(gatesSeen);
      toast("Unlocked: " + name, "Level " + gatesSeen + " of " + gateCards.length + " seen", badge);
      if (gatesSeen === gateCards.length) setTimeout(function () { toast("All five levels seen", "Now try it on your own business. Free, two minutes.", "★", "/audit"); }, 1600);
    }, 0.6, "0px 0px -10% 0px");
  }

  /* ------------------------------------------ hire-your-team builder */
  var hireTeam = null;
  var team = $("#team");
  if (team) {
    var hired = [];
    var slots = $(".team-slots", team), teamCount = $(".team-count", team), chiefBox = $(".team-chief", team), teamCta = $(".team-cta", team);
    var renderTeam = function () {
      slots.innerHTML = "";
      hired.forEach(function (n) { var el = document.createElement("span"); el.className = "slot on"; el.textContent = n; slots.appendChild(el); });
      for (var i = hired.length; i < 3; i++) { var e = document.createElement("span"); e.className = "slot empty"; e.textContent = "Empty seat"; slots.appendChild(e); }
      teamCount.textContent = hired.length === 0 ? "Nobody hired yet" : hired.length === 1 ? "One hired. One more and someone turns up." : hired.length + " hired, plus a manager for free";
      var two = hired.length >= 2;
      if (two && chiefBox.hidden) {
        chiefBox.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { chiefBox.classList.add("on"); }); });
        toast("The Chief of Staff joined", "Free, because you hired two.", "★");
      } else if (!two) { chiefBox.hidden = true; chiefBox.classList.remove("on"); }
      teamCta.hidden = hired.length === 0;
      $$(".hire").forEach(function (b) { var on = hired.indexOf(b.getAttribute("data-agent")) > -1; b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Hired" : "Hire"; });
    };
    $$(".hire").forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-agent"); var i = hired.indexOf(name);
        if (i > -1) hired.splice(i, 1); else hired.push(name);
        renderTeam();
      });
    });
    hireTeam = function (names) { hired = names.slice(); renderTeam(); };
    renderTeam();
  }

  /* ------------------------------------------------- three-tap quiz */
  var quiz = $(".quiz");
  if (quiz) {
    var qs = $$(".q", quiz), qSteps = $$(".quiz-steps span", quiz), qResult = $(".q-result", quiz);
    var answers = {}, step = 0;
    var PICK = { found: "The Answer Machine", reviews: "Your Reputation", posting: "The Photographer", quiet: "The Emailer",
      walkins: "The Local Fixer", google: "The Local Opportunist", market: "The Mystery Shopper", referral: "The Press Agent",
      restaurant: "Nearby", shop: "The Mystery Shopper", salon: "Your Reputation", b2b: "The Press Agent" };
    var FALLBACK = ["The Answer Machine", "The Local Fixer", "The Photographer", "Your Reputation", "Nearby", "The Emailer", "The Press Agent", "The Mystery Shopper", "The Local Opportunist", "The Crisis Manager"];
    var TITLE = { found: "Get found, then get chosen.", reviews: "Own your reputation.", posting: "Never go quiet again.", quiet: "Bring them back." };
    var BIZ = { restaurant: "Your menu, hours and how to book, readable by every AI assistant.", shop: "Your best products described the way buyers actually ask for them.", salon: "Your services, prices and how to book, wherever AI looks.", b2b: "Your service pages answering the questions buyers ask before they call." };
    var FIX = {
      found: ["The questions AI could not answer about you get answered, and published.", "Every listing about you starts telling the same true story.", "A score out of 100 you can watch move each week."],
      reviews: ["Every open review gets a reply in your voice, today.", "New reviews get answered within minutes, day or night.", "What people keep praising becomes what you post about."],
      posting: ["A fortnight of posts drafted from photos you already have.", "One screen to approve, reject or redo. Then it posts itself.", "Your channels stay busy while you run the business."],
      quiet: ["Your past customers hear from you again, in your voice.", "An offer they actually take up, designed around what sold before.", "A count of who came back, not a guess."]
    };
    var agentLine = function (name) {
      var h = $$(".agents-scroller .agent h3").filter(function (h3) { return h3.textContent === name; })[0];
      var card = h ? h.closest(".agent") : null;
      return { role: card ? $(".role span", card).textContent : "Agent", line: card ? $("p", card).textContent : "", accent: card ? card.getAttribute("style") : "" };
    };
    var showStep = function (i) {
      step = i;
      qs.forEach(function (q, j) { q.hidden = j !== i; });
      qSteps.forEach(function (s, j) { s.classList.toggle("on", j <= Math.min(i, qSteps.length - 1)); });
      qResult.hidden = i < qs.length;
      if (i === qs.length) { buildResult(); qResult.focus({ preventScroll: true }); }
    };
    var buildResult = function () {
      var names = [];
      [PICK[answers.worry], PICK[answers.channel], PICK[answers.biz]].concat(FALLBACK).forEach(function (n) { if (n && names.length < 3 && names.indexOf(n) < 0) names.push(n); });
      $("#qr-title").textContent = TITLE[answers.worry] || "Your first week";
      var fixes = [BIZ[answers.biz]].concat(FIX[answers.worry] || []).slice(0, 3);
      var ul = $("#qr-fixes"); ul.innerHTML = "";
      fixes.forEach(function (f) { var li = document.createElement("li"); li.textContent = f; ul.appendChild(li); });
      var box = $("#qr-team"); box.innerHTML = "";
      names.forEach(function (n) {
        var info = agentLine(n); var c = document.createElement("article"); c.className = "card card-accent"; c.setAttribute("style", info.accent);
        var r = document.createElement("span"); r.className = "role"; r.textContent = info.role;
        var b = document.createElement("b"); b.textContent = n; var p = document.createElement("p"); p.textContent = info.line;
        c.appendChild(r); c.appendChild(b); c.appendChild(p); box.appendChild(c);
      });
      $("#qr-hire").onclick = function () {
        if (hireTeam) hireTeam(names);
        var t = $("#team"); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      };
    };
    qs.forEach(function (q, i) {
      $$("button", q).forEach(function (b) {
        b.addEventListener("click", function () {
          $$("button", q).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          answers[q.getAttribute("data-q")] = b.getAttribute("data-val");
          setTimeout(function () { showStep(i + 1); }, reduce ? 0 : 260);
        });
      });
    });
    $("#qr-again").addEventListener("click", function () {
      answers = {}; $$(".q button", quiz).forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); showStep(0);
    });
  }

  /* ---------------------------------------- current year in the footer */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
