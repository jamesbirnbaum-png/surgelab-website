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
      var max = howTrack.scrollWidth - how.clientWidth;
      if (max <= 0) { howTrack.style.transform = ""; if (howBar) howBar.style.width = "100%"; return; }
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
        var monthlyNote = $(".plan .monthly-note"); if (monthlyNote) monthlyNote.hidden = mode === "annual";
        var sub = $("#subscribe-btn"); if (sub) sub.href = sub.href.replace(/interval=\w+/, "interval=" + mode);
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

  /* ------------------------------------------ the free audit, run in-page
     Calls the tool's public, CORS-allowed endpoints from surgelab.co. If the
     call cannot be made (an origin the tool does not allow, or no network),
     it falls back to the old hand-off to the tool's own page. */
  var auditForm = $("#audit-form");
  if (auditForm) {
    var API = auditForm.getAttribute("data-api") || "https://socialtool.surgelab.co/api/public";
    var HANDOFF = "https://socialtool.surgelab.co/can-ai-book-you";
    var siteInput = $("input[name=site]", auditForm);
    var goBtn = $("#audit-go"), goLabel = $(".go-label", auditForm);
    var run = $("#audit-run"), prog = $(".ar-progress", run), progLine = $(".ar-line", run), errBox = $(".ar-error", run), resBox = $(".ar-result", run);
    var LINES = ["Reading your website the way AI would...", "Working out what a customer would book or buy...", "Asking an AI assistant to do it, live...", "Asking a second assistant the same thing...", "Reading back exactly what they found...", "Scoring whether a real customer could have finished..."];
    var lineTimer = null, running = false, current = null, currentSite = "";
    function cleanSite(v) { v = (v || "").trim(); return v; }
    function handoff(v) { window.location.href = v ? HANDOFF + "?site=" + encodeURIComponent(/^https?:\/\//i.test(v) ? v : "https://" + v) : HANDOFF; }
    function setBusy(on) {
      running = on; goBtn.disabled = on; if (goLabel) goLabel.textContent = on ? "Watching AI try..." : "Run my audit";
      prog.hidden = !on;
      if (on) { var i = 0; progLine.textContent = LINES[0]; lineTimer = setInterval(function () { i = Math.min(i + 1, LINES.length - 1); progLine.textContent = LINES[i]; }, 2200); }
      else if (lineTimer) { clearInterval(lineTimer); lineTimer = null; }
    }
    function showError(msg) { errBox.textContent = msg; errBox.hidden = false; }
    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function taskCopy(t) { return { purchase: "buy something from you", quote: "get a quote from you", pricing: "find out what you charge", contact: "find a working way to get in touch with you", booking: "book with you" }[t] || "find and understand what you offer"; }
    function ring(score) {
      var size = 148, stroke = 10, r = (size - stroke) / 2, c = 2 * Math.PI * r;
      var wrap = el("div", "ar-ring");
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "0 0 " + size + " " + size); svg.setAttribute("aria-hidden", "true");
      var bg = document.createElementNS("http://www.w3.org/2000/svg", "circle"); bg.setAttribute("cx", size / 2); bg.setAttribute("cy", size / 2); bg.setAttribute("r", r); bg.setAttribute("class", "bg"); svg.appendChild(bg);
      if (score !== null) {
        var fg = document.createElementNS("http://www.w3.org/2000/svg", "circle"); fg.setAttribute("cx", size / 2); fg.setAttribute("cy", size / 2); fg.setAttribute("r", r); fg.setAttribute("class", "fg");
        fg.style.strokeDasharray = c; fg.style.strokeDashoffset = c; svg.appendChild(fg);
        requestAnimationFrame(function () { requestAnimationFrame(function () { fg.style.strokeDashoffset = c - (score / 100) * c; }); });
      }
      wrap.appendChild(svg);
      var mid = el("div", "mid"); var big = el("b", null, score !== null ? "0" : "?"); mid.appendChild(big); mid.appendChild(el("span", null, "out of 100")); wrap.appendChild(mid);
      if (score !== null) { var t0 = null; var step = function (ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1100); big.textContent = String(Math.round(score * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
      return wrap;
    }
    function gateClass(passed, total) { if (!total) return "pill"; if (passed === total) return "pill pill-ok"; if (passed === 0) return "pill pill-bad"; return "pill pill-warn"; }
    function renderLocked(res) {
      resBox.innerHTML = "";
      var head = el("div", "ar-head"); head.appendChild(ring(null));
      var txt = el("div"); txt.appendChild(el("h2", "display h3", res.businessName ? "Your free AI audit for " + res.businessName + " is ready" : "Your free AI audit is ready"));
      txt.appendChild(el("p", "muted", "We asked live AI assistants to " + taskCopy(res.taskType) + ". Enter your email to see exactly what they found. No spam, one email.")); head.appendChild(txt); resBox.appendChild(head);
      var f = el("form", "ar-lead"); f.setAttribute("novalidate", "");
      var row = el("div", "row");
      var f1 = el("div", "field"); var l1 = el("label", null, "Your email"); l1.htmlFor = "lead-email"; var i1 = el("input"); i1.id = "lead-email"; i1.type = "email"; i1.name = "email"; i1.required = true; i1.autocomplete = "email"; i1.placeholder = "you@yourbusiness.co.uk"; f1.appendChild(l1); f1.appendChild(i1);
      var f2 = el("div", "field"); var l2 = el("label", null, "Phone (optional)"); l2.htmlFor = "lead-phone"; var i2 = el("input"); i2.id = "lead-phone"; i2.type = "tel"; i2.name = "phone"; i2.autocomplete = "tel"; i2.placeholder = "07..."; f2.appendChild(l2); f2.appendChild(i2);
      row.appendChild(f1); row.appendChild(f2); f.appendChild(row);
      var b = el("button", "btn btn-lg", "Show my results"); b.type = "submit"; f.appendChild(b);
      f.addEventListener("submit", function (ev) {
        ev.preventDefault(); if (b.disabled) return;
        var email = i1.value.trim(); if (email.length < 3 || email.indexOf("@") < 1) { showError("That email does not look right."); return; }
        errBox.hidden = true; b.disabled = true; b.textContent = "One moment...";
        fetch(API + "/bookability-lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email, phone: i2.value.trim() || undefined, checkId: res.checkId }) })
          .then(function (r) { return r.json(); })
          .then(function (body) { if (body.ok) { renderFull(body.result, true); } else { showError(body.message || "Could not save that just now. Try again in a moment."); b.disabled = false; b.textContent = "Show my results"; } })
          .catch(function () { showError("Could not send that just now. Try again in a moment."); b.disabled = false; b.textContent = "Show my results"; });
      });
      resBox.appendChild(f); resBox.hidden = false;
    }
    function renderFull(res, sent) {
      resBox.innerHTML = "";
      var sum = res.summary;
      var head = el("div", "ar-head"); head.appendChild(ring(sum.scoreOutOf100));
      var txt = el("div"); txt.appendChild(el("h2", "display h3", res.businessName ? "Here is what AI found for " + res.businessName : "Here is what AI found"));
      txt.appendChild(el("p", "muted", "Asked to " + taskCopy(res.taskType) + ", checked against " + sum.scoredPairs + (sum.scoredPairs === 1 ? " AI answer" : " AI answers") + (sum.engineErrorPairs > 0 ? " (" + sum.engineErrorPairs + " more could not be reached this time and are not counted either way)" : "") + "."));
      head.appendChild(txt); resBox.appendChild(head);
      if (sent) { var ok = el("p", "ar-sent"); ok.textContent = "Thanks, we have your details. Every gate below is something SurgeLab fixes for you, in the background."; resBox.appendChild(ok); }
      var gates = el("div", "ar-gates");
      sum.gates.forEach(function (g, i) {
        var row = el("div", "ar-gate"); row.style.setProperty("--d", (i * 90) + "ms");
        var top = el("div", "top"); var name = el("span"); name.appendChild(el("b", null, g.label)); name.appendChild(document.createTextNode(" " + g.question)); top.appendChild(name);
        top.appendChild(el("span", gateClass(g.passedCount, g.totalScored), g.totalScored ? "passed " + g.passedCount + " of " + g.totalScored : "not checked")); row.appendChild(top);
        if (g.failureNotes && g.failureNotes.length) { var ul = el("ul"); g.failureNotes.forEach(function (n) { ul.appendChild(el("li", null, "“" + n + "”")); }); row.appendChild(ul); }
        gates.appendChild(row);
      });
      resBox.appendChild(gates);
      var tbl = el("div", "ar-table"); tbl.appendChild(el("p", "mono muted", "What each assistant actually said"));
      var table = el("table"); var thead = el("thead"); var tr = el("tr"); tr.appendChild(el("th", null, "Assistant"));
      var order = ["found", "right", "clear", "bookable"]; var labels = {}; sum.gates.forEach(function (g) { labels[g.key] = g.label; });
      order.forEach(function (k) { tr.appendChild(el("th", null, labels[k] || k)); }); thead.appendChild(tr); table.appendChild(thead);
      var tb = el("tbody"); var engineName = { openai: "ChatGPT", perplexity: "Perplexity", gemini: "Gemini", claude: "Claude" };
      sum.pairs.forEach(function (pr) {
        var r = el("tr"); r.appendChild(el("td", null, engineName[pr.engine] || pr.engine));
        if (pr.ok) { order.forEach(function (k) { var td = el("td", pr.steps[k] ? "yes" : "no", pr.steps[k] ? "✓" : "✗"); r.appendChild(td); }); }
        else { var td = el("td", "muted", "Could not be reached this time, not counted"); td.colSpan = 4; r.appendChild(td); }
        tb.appendChild(r);
      });
      table.appendChild(tb); tbl.appendChild(table); resBox.appendChild(tbl);
      resBox.appendChild(el("p", "mono muted small", "We asked live AI assistants to complete this the way a customer using ChatGPT or Perplexity might, and scored exactly what came back. No real booking or purchase went through."));
      var cta = el("div", "ar-cta");
      var fix = el("a", "btn btn-lg", "Fix it for me"); fix.href = HANDOFF + "?site=" + encodeURIComponent(currentSite); cta.appendChild(fix);
      var call = el("a", "btn btn-ghost btn-lg", "Book a call"); call.href = "https://cal.com/james-birnbaum-zgzeth/30min"; call.rel = "noopener"; cta.appendChild(call);
      resBox.appendChild(cta);
      resBox.appendChild(el("p", "mono muted small", "Fix it for me opens the tool, where the plan starts. Your result is saved for twelve hours, so it appears there straight away."));
      resBox.hidden = false;
      if (sent) resBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    function renderResult(res) {
      if (res.cached) { var c = el("p", "ar-cached mono muted small", "Showing a result from earlier today for this website. We re-check each site at most every twelve hours."); run.insertBefore(c, resBox); }
      if (res.unreachable) { resBox.innerHTML = ""; resBox.appendChild(el("h2", "display h3", "We could not load your website just now.")); resBox.appendChild(el("p", "muted", "It may be down, or blocking automated visitors. Try again in a moment, or double-check the address.")); resBox.hidden = false; return; }
      if (res.locked) { renderLocked(res); return; }
      if (res.summary && res.summary.scoredPairs > 0) { renderFull(res, false); return; }
      resBox.innerHTML = ""; resBox.appendChild(el("h2", "display h3", "We could not finish a live check just now.")); resBox.appendChild(el("p", "muted", "Try again in a moment. This is usually a busy patch on our end, not a problem with your site.")); resBox.hidden = false;
    }
    function runAudit(v) {
      if (running) return; v = cleanSite(v); if (!v) { siteInput.focus(); return; }
      currentSite = v; current = null;
      run.hidden = false; errBox.hidden = true; resBox.hidden = true; resBox.innerHTML = ""; $$(".ar-cached", run).forEach(function (n) { n.remove(); });
      setBusy(true);
      var ctl = ("AbortController" in window) ? new AbortController() : null; var timer = ctl ? setTimeout(function () { ctl.abort(); }, 90000) : null;
      fetch(API + "/bookability-check?site=" + encodeURIComponent(v), { signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().then(function (body) { return body; }, function () { throw { kind: "broken" }; }); })
        .then(function (body) { setBusy(false); if (body.ok) { current = body; renderResult(body); } else { showError(body.message || "That address cannot be checked. Try your public website address."); } })
        .catch(function (e) {
          setBusy(false);
          if (e && e.kind === "broken") { showError("Something broke on our end running that check. Try again in a moment."); return; }
          if (e && e.name === "AbortError") { showError("That took longer than expected. Try again in a moment."); return; }
          // Could not call the tool from this page (network, or an origin the tool does not allow). Hand over to the tool's own page.
          handoff(v);
        })
        .then(function () { if (timer) clearTimeout(timer); });
    }
    auditForm.addEventListener("submit", function (ev) { ev.preventDefault(); runAudit(siteInput.value); });
    $$("[data-scroll-form]").forEach(function (a) { a.addEventListener("click", function (ev) { ev.preventDefault(); siteInput.focus(); auditForm.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }); });
    var qs = new URLSearchParams(window.location.search).get("site");
    if (qs) { siteInput.value = qs.replace(/^https?:\/\//i, ""); runAudit(siteInput.value); }
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
