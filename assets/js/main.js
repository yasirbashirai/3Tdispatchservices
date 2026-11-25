/* 3T Dispatch Services — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Desktop dropdown ---------- */
  document.querySelectorAll(".nav__item--has-panel").forEach(function (item) {
    var trigger = item.querySelector(".nav__link");
    var panel = item.querySelector(".nav__panel");
    if (!trigger || !panel) return;
    var closeTimer;

    function open() {
      clearTimeout(closeTimer);
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", function () {
      closeTimer = setTimeout(close, 120);
    });
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      item.classList.contains("is-open") ? close() : open();
    });
    item.addEventListener("focusin", open);
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.classList.contains("is-open")) {
        close();
        trigger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) close();
    });
  });

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var navClose = document.querySelector(".mobile-nav__close");

  function setMobileNav(open) {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
    if (open) {
      var first = mobileNav.querySelector("a, button");
      if (first) setTimeout(function () { first.focus(); }, 60);
    } else {
      navToggle.focus();
    }
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      setMobileNav(!mobileNav.classList.contains("is-open"));
    });
    if (navClose) navClose.addEventListener("click", function () { setMobileNav(false); });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMobileNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        setMobileNav(false);
        return;
      }
      if (e.key !== "Tab") return;
      var focusables = mobileNav.querySelectorAll("a[href], button:not([disabled])");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Scroll-triggered enhancement ----------
     One positional sweeper drives reveals, process steps, and stat counters.
     Position-based (not intersection-based) so fast scrolling, anchor jumps,
     and restored scroll positions never leave content hidden. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var allRevealed = reduceMotion;

  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    steps.forEach(function (el) { el.classList.add("is-visible"); });
    counters.forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute("data-count")) + (el.getAttribute("data-suffix") || "");
    });
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var duration = 1400;
    var tick = function (now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(0) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(function () {
      el.textContent = target.toFixed(0) + suffix;
    }, duration + 200);
  }

  if (!reduceMotion && (revealEls.length || steps.length || counters.length)) {
    var pendingReveal = revealEls.slice();
    var pendingStep = steps.slice();
    var pendingCount = counters.slice();
    var sweep = function () {
      var viewportBottom = window.scrollY + window.innerHeight;
      pendingReveal = pendingReveal.filter(function (el) {
        if (el.getBoundingClientRect().top + window.scrollY < viewportBottom + window.innerHeight * 0.06) {
          el.classList.add("is-visible");
          return false;
        }
        return true;
      });
      pendingStep = pendingStep.filter(function (el) {
        if (el.getBoundingClientRect().top + window.scrollY < viewportBottom - window.innerHeight * 0.15) {
          el.classList.add("is-visible");
          return false;
        }
        return true;
      });
      pendingCount = pendingCount.filter(function (el) {
        if (el.getBoundingClientRect().top + window.scrollY < viewportBottom) {
          runCounter(el);
          return false;
        }
        return true;
      });
      if (!pendingReveal.length && !pendingStep.length && !pendingCount.length) {
        window.removeEventListener("scroll", sweep);
        window.removeEventListener("resize", sweep);
      }
    };
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep);
    window.addEventListener("load", sweep);
    document.addEventListener("visibilitychange", sweep);
  }

  /* ---------- Equipment tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll("[role='tab']"));
    var panels = Array.prototype.slice.call(group.querySelectorAll("[role='tabpanel']"));
    if (!tabs.length) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        if (selected && focus) tab.focus();
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.id === tabs[index].getAttribute("aria-controls"));
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  });

  /* ---------- Lane filters ---------- */
  document.querySelectorAll("[data-lane-filters]").forEach(function (filterGroup) {
    var buttons = filterGroup.querySelectorAll("[data-filter]");
    var lanes = document.querySelectorAll("[data-region]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        lanes.forEach(function (lane) {
          var show = value === "all" || lane.getAttribute("data-region") === value;
          lane.classList.toggle("is-hidden", !show);
        });
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var button = item.querySelector(".faq__q");
    var panel = item.querySelector(".faq__a");
    if (!button || !panel) return;
    if (button.getAttribute("aria-expanded") === "true") {
      panel.style.height = "auto";
      panel.setAttribute("aria-hidden", "false");
    } else {
      panel.style.height = "0px";
      panel.setAttribute("aria-hidden", "true");
    }
    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      panel.setAttribute("aria-hidden", String(open));
      if (open) {
        panel.style.height = panel.scrollHeight + "px";
        requestAnimationFrame(function () { panel.style.height = "0px"; });
      } else {
        panel.style.height = panel.scrollHeight + "px";
        panel.addEventListener("transitionend", function onEnd() {
          panel.style.height = "auto";
          panel.removeEventListener("transitionend", onEnd);
        });
      }
    });
  });

  /* ---------- Form helpers ---------- */
  function showError(field, message) {
    var wrapper = field.closest(".field") || field.closest(".consent") || field.parentElement;
    if (!wrapper) return;
    wrapper.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");
    var error = wrapper.querySelector(".field__error");
    if (error) {
      error.textContent = message;
      if (!error.id) error.id = "err-" + Math.random().toString(36).slice(2, 8);
      field.setAttribute("aria-describedby", error.id);
    }
  }

  function clearError(field) {
    var wrapper = field.closest(".field") || field.closest(".consent") || field.parentElement;
    if (!wrapper) return;
    wrapper.classList.remove("has-error");
    field.removeAttribute("aria-invalid");
    var describedBy = field.getAttribute("aria-describedby");
    if (describedBy && describedBy.startsWith("err-")) field.removeAttribute("aria-describedby");
  }

  function validateField(field) {
    if (!field.required) return true;
    var value = (field.value || "").trim();
    if (field.type === "checkbox") {
      if (!field.checked) {
        showError(field, "Please confirm this to continue.");
        return false;
      }
      clearError(field);
      return true;
    }
    if (!value) {
      showError(field, field.tagName === "SELECT" ? "Please choose an option." : "This field is required.");
      return false;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      showError(field, "Enter a valid email address.");
      return false;
    }
    if (field.type === "tel" && value.replace(/\D/g, "").length < 10) {
      showError(field, "Enter a 10-digit phone number.");
      return false;
    }
    clearError(field);
    return true;
  }

  function validateScope(scope) {
    var fields = Array.prototype.slice.call(scope.querySelectorAll("input, select, textarea"))
      .filter(function (f) { return f.type !== "hidden" && !f.disabled; });
    var valid = true;
    var firstInvalid = null;
    fields.forEach(function (field) {
      var ok = validateField(field);
      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    return valid;
  }

  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true") clearError(e.target);
    });
    form.addEventListener("change", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true") clearError(e.target);
    });
  });

  function setStatus(form, type, message, html) {
    var status = form.querySelector(".form__status");
    if (!status) return;
    status.className = "form__status form__status--" + type + " is-visible";
    status.innerHTML = html || message;
  }

  function setThanksRedirect(form) {
    var next = form.querySelector("input[name='_next']");
    if (!next) {
      next = document.createElement("input");
      next.type = "hidden";
      next.name = "_next";
      form.appendChild(next);
    }
    if (location.protocol === "http:" || location.protocol === "https:") {
      next.value = location.origin + "/thanks.html";
    }
  }

  function prepareSignatureFile(form) {
    var hidden = form.querySelector("input[name='signature']");
    if (!hidden || hidden.type === "file") return;
    if (typeof hidden.value !== "string" || hidden.value.indexOf("data:image") !== 0) return;
    try {
      var file = dataUrlToFile(hidden.value, "signature.png");
      var transfer = new DataTransfer();
      transfer.items.add(file);
      var input = document.createElement("input");
      input.type = "file";
      input.name = "signature";
      input.hidden = true;
      input.setAttribute("data-generated", "true");
      input.files = transfer.files;
      hidden.disabled = true;
      form.appendChild(input);
    } catch (err) {
      hidden.disabled = true;
    }
  }

  function finishSubmission(form, isCarrier, submitBtn, original) {
    var successHtml = isCarrier
      ? "<strong>Application received.</strong> Thank you. A dispatcher will review your authority and documents, then contact you to discuss your operation. If you need to add documents, email 3tdispatchservices@gmail.com."
      : "<strong>Request received.</strong> We will call you within one business day to talk through your operation. For anything urgent, call 404-429-0224.";
    setStatus(form, "ok", "", successHtml);
    Array.prototype.forEach.call(form.querySelectorAll("input[data-generated]"), function (input) {
      input.parentNode.removeChild(input);
    });
    form.querySelectorAll(".upload").forEach(function (u) {
      u.classList.remove("has-file");
      var label = u.querySelector(".upload__file");
      if (label) label.textContent = "";
    });
    form.reset();
    var signature = form.querySelector("input[name='signature']");
    if (signature) {
      signature.disabled = false;
      signature.value = "";
    }
    if (window.__clearSignature) window.__clearSignature();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }
    var status = form.querySelector(".form__status");
    if (status) {
      status.setAttribute("tabindex", "-1");
      status.focus({ preventScroll: true });
      status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
  }

  function dataUrlToFile(dataUrl, name) {
    var parts = dataUrl.split(",");
    var mimeMatch = parts[0].match(/:(.*?);/);
    var binary = atob(parts[1]);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], name, { type: mimeMatch ? mimeMatch[1] : "image/png" });
  }

  document.querySelectorAll("[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!validateScope(form)) {
        e.preventDefault();
        setStatus(form, "error", "Please check the highlighted fields and try again.");
        return;
      }
      var signatureInput = form.querySelector("input[name='signature']");
      var typedSignature = form.querySelector("input[name='typed-signature']");
      if (signatureInput && !signatureInput.value && !(typedSignature && typedSignature.value.trim())) {
        e.preventDefault();
        setStatus(form, "error", "Please add a signature, drawn or typed, before submitting.");
        var pad = form.querySelector("#signature-pad");
        if (pad) pad.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        return;
      }

      var isCarrier = form.getAttribute("data-form") === "carrier";
      var submitBtn = form.querySelector("[type='submit']");
      var original = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) submitBtn.innerHTML = "Sending…";

      if (isCarrier) prepareSignatureFile(form);

      /* Submit into a hidden iframe so the page stays put and shows an inline
         thank-you while FormSubmit still receives every field and attachment. */
      var sink = document.getElementById("form-sink");
      if (!sink) {
        setThanksRedirect(form);
        return;
      }

      e.preventDefault();
      form.target = "form-sink";
      HTMLFormElement.prototype.submit.call(form);
      window.setTimeout(function () {
        finishSubmission(form, isCarrier, submitBtn, original);
      }, 300);
    });
  });

  /* ---------- Quote form phone formatting ---------- */
  document.querySelectorAll("input[type='tel']").forEach(function (input) {
    input.addEventListener("input", function () {
      var digits = input.value.replace(/\D/g, "").slice(0, 10);
      if (!digits) { input.value = ""; return; }
      if (digits.length < 4) input.value = digits;
      else if (digits.length < 7) input.value = "(" + digits.slice(0, 3) + ") " + digits.slice(3);
      else input.value = "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
    });
  });

  /* ---------- File uploads ---------- */
  function formatSize(bytes) {
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  document.querySelectorAll(".upload").forEach(function (zone) {
    var input = zone.querySelector("input[type='file']");
    var fileLabel = zone.querySelector(".upload__file");
    if (!input) return;

    function handle() {
      var file = input.files && input.files[0];
      if (!file) {
        zone.classList.remove("has-file");
        if (fileLabel) fileLabel.textContent = "";
        return;
      }
      var allowed = /\.(pdf|jpe?g|png)$/i.test(file.name);
      var tooBig = file.size > 10 * 1024 * 1024;
      if (!allowed || tooBig) {
        input.value = "";
        zone.classList.remove("has-file");
        if (fileLabel) fileLabel.textContent = tooBig ? "File is larger than 10 MB. Choose a smaller file." : "Use a PDF, JPG, or PNG file.";
        if (fileLabel) fileLabel.style.color = "#b13124";
        return;
      }
      if (fileLabel) {
        fileLabel.style.color = "";
        fileLabel.textContent = file.name + " · " + formatSize(file.size);
      }
      zone.classList.add("has-file");
    }

    input.addEventListener("change", handle);
    ["dragenter", "dragover"].forEach(function (evt) {
      zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.add("is-drag"); });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.remove("is-drag"); });
    });
  });

  /* ---------- Carrier wizard ---------- */
  var wizard = document.querySelector("[data-wizard]");
  if (wizard) {
    var panels = Array.prototype.slice.call(wizard.querySelectorAll("[data-wpanel]"));
    var stepEls = Array.prototype.slice.call(wizard.querySelectorAll("[data-wstep]"));
    var progress = wizard.querySelector(".wizard__progress span");
    var backBtn = wizard.querySelector("[data-wizard-back]");
    var nextBtn = wizard.querySelector("[data-wizard-next]");
    var submitBtn = wizard.querySelector("[data-wizard-submit]");
    var current = 0;
    var resizeSignature;

    var stepNow = wizard.querySelector("[data-step-now]");

    function render(initial) {
      panels.forEach(function (panel, i) {
        panel.classList.toggle("is-active", i === current);
      });
      if (stepNow) stepNow.textContent = String(current + 1);
      if (current === panels.length - 1) syncSummary();
      stepEls.forEach(function (el, i) {
        el.classList.toggle("is-current", i === current);
        el.classList.toggle("is-done", i < current);
        var dot = el.querySelector(".wstep__dot");
        if (dot) dot.textContent = i < current ? "✓" : String(i + 1);
      });
      if (progress) progress.style.width = ((current + 1) / panels.length) * 100 + "%";
      if (backBtn) {
        backBtn.style.visibility = current === 0 ? "hidden" : "visible";
      }
      if (nextBtn) nextBtn.hidden = current === panels.length - 1;
      if (submitBtn) submitBtn.hidden = current !== panels.length - 1;
      if (typeof resizeSignature === "function") resizeSignature();
      var heading = panels[current] && panels[current].querySelector("h2");
      if (heading && !initial) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      if (!initial) {
        var top = wizard.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!validateScope(panels[current])) return;
        if (current < panels.length - 1) {
          current += 1;
          render();
        }
      });
    }
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (current > 0) {
          current -= 1;
          render();
        }
      });
    }

    function syncSummary() {
      var form = wizard;
      var set = function (id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value || "Not provided";
      };
      var val = function (name) {
        var field = form.querySelector("[name='" + name + "']");
        return field ? field.value : "";
      };
      set("sum-company", val("company"));
      set("sum-mc", val("mc"));
      set("sum-contact", val("contact-name"));
      set("sum-phone", val("phone"));
      set("sum-email", val("email"));
      set("sum-equipment", val("equipment"));
      set("sum-trucks", val("trucks"));
      set("sum-signer", val("signer-name"));
      var docs = [];
      form.querySelectorAll("input[type='file']").forEach(function (input) {
        if (input.files && input.files[0]) docs.push(input.files[0].name);
      });
      set("sum-docs", docs.length ? docs.join(", ") : "No files selected");
    }

    stepEls.forEach(function (el, i) {
      el.addEventListener("click", function () {
        if (i < current) {
          current = i;
          render();
        }
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", syncSummary);
    }

    /* Signature pad */
    var canvas = document.getElementById("signature-pad");
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext("2d");
      var drawing = false;
      var hasInk = false;
      var hidden = document.querySelector("input[name='signature']");
      var clearBtn = document.querySelector(".sig-clear");

      function paint() {
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
      }

      function exportSignature() {
        var copy = document.createElement("canvas");
        copy.width = canvas.width;
        copy.height = canvas.height;
        var out = copy.getContext("2d");
        out.fillStyle = "#ffffff";
        out.fillRect(0, 0, copy.width, copy.height);
        out.drawImage(canvas, 0, 0);
        return copy.toDataURL("image/png");
      }

      function resizeCanvas() {
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var ratio = window.devicePixelRatio || 1;
        var saved = hasInk && canvas.width ? canvas.toDataURL() : null;
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        paint();
        if (saved) {
          var img = new Image();
          img.onload = function () {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
          };
          img.src = saved;
        }
      }

      function pos(e) {
        var rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      canvas.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        drawing = true;
        hasInk = true;
        canvas.setPointerCapture(e.pointerId);
        var p = pos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      });
      canvas.addEventListener("pointermove", function (e) {
        if (!drawing) return;
        var p = pos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
        canvas.addEventListener(evt, function () {
          if (!drawing) return;
          drawing = false;
          if (hidden) hidden.value = exportSignature();
        });
      });

      resizeSignature = resizeCanvas;

      window.__clearSignature = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasInk = false;
        if (hidden) hidden.value = "";
      };
      if (clearBtn) clearBtn.addEventListener("click", window.__clearSignature);
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
    }

    render(true);
  }

  /* ---------- Blog filters ---------- */
  document.querySelectorAll("[data-post-filters]").forEach(function (group) {
    var buttons = group.querySelectorAll("[data-post-filter]");
    var posts = document.querySelectorAll("[data-post-cat]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-post-filter");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        posts.forEach(function (post) {
          var show = value === "all" || post.getAttribute("data-post-cat") === value;
          post.classList.toggle("is-hidden", !show);
        });
      });
    });
  });

  /* ---------- Article table of contents ---------- */
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var headings = Array.prototype.map.call(tocLinks, function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);
    var tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-120px 0px -65% 0px" });
    headings.forEach(function (h) { tocObserver.observe(h); });
  }

  /* ---------- Current nav link / footer year ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link[href], .mobile-nav a[href]").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    if (href.indexOf("http") === 0 || href.charAt(0) === "#") return;
    var target = href.split("#")[0];
    if (target && target === path && !link.hasAttribute("aria-current")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Scroll spy for landing-page anchors ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link[data-spy]"));
  var spySections = spyLinks
    .map(function (link) {
      var section = document.getElementById(link.getAttribute("data-spy"));
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  if (spyLinks.length === 1 && spySections.length) {
    spyLinks[0].classList.add("is-active");
  }

  if (spySections.length > 1) {
    var setActive = function (activeLink) {
      spySections.forEach(function (pair) {
        var on = pair.link === activeLink;
        pair.link.classList.toggle("is-active", on);
        if (on) pair.link.setAttribute("aria-current", "true");
        else pair.link.removeAttribute("aria-current");
      });
    };
    var spy = function () {
      var marker = window.scrollY + window.innerHeight * 0.32;
      var current = null;
      spySections.forEach(function (pair) {
        var top = pair.section.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = pair.link;
      });
      if (window.scrollY < 120) current = spySections[0].link;
      setActive(current);
    };
    spy();
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("resize", spy);
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
