
(function initSitePhone(){
  const phone = window.ALENINDAHOUSE_CONFIG?.phone;
  if (!phone) return;
  document.querySelectorAll('[data-site-phone]').forEach(el=>{
    el.textContent = phone.display;
    el.setAttribute('href', phone.href);
  });
  document.querySelectorAll('[data-site-phone-mobile]').forEach(el=>{
    const span = el.querySelector('span');
    el.firstChild && (el.firstChild.nodeValue = phone.mobileLabel + ' ');
    el.setAttribute('href', phone.href);
    if (span) el.appendChild(span);
  });
})();

(() => {
  "use strict";

  // HERO CAROUSEL
  // The carousel is isolated so pages/components without #slides do not throw.
  const track = document.getElementById("slides");
  const originals = [...document.querySelectorAll(".slide")];
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const dots = [...document.querySelectorAll(".carousel-dot")];

  if (track && originals.length > 0) {
    const count = originals.length;
    let index = 1;
    let locked = false;
    let startX = null;
    let swipeMoved = false;

    // Seamless loop: one clone at each end.
    track.insertBefore(originals[count - 1].cloneNode(true), track.firstChild);
    track.appendChild(originals[0].cloneNode(true));
    const slides = [...track.querySelectorAll(".slide")];

    function logicalIndex(){
      return ((index - 1) % count + count) % count;
    }

    function updateCounter(){
      const logical = logicalIndex();
      const label = `${String(logical + 1).padStart(2,"0")} / ${String(count).padStart(2,"0")}`;
      slides.forEach((slide, i) => {
        const counter = slide.querySelector(".slide-counter");
        if(counter) counter.textContent = label;
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        const active = i === logical;
        dot.classList.toggle("is-active", active);
        if(active) dot.setAttribute("aria-current","true");
        else dot.removeAttribute("aria-current");
      });
    }

    function paint(animate = true){
      track.style.transition = animate ? "transform .55s cubic-bezier(.22,.61,.36,1)" : "none";
      track.style.transform = `translate3d(-${index * 100}%,0,0)`;
      updateCounter();
    }

    function move(step){
      if(locked || count < 2) return;
      locked = true;
      index += step;
      paint(true);
    }

    function normalize(){
      if(index === 0){
        index = count;
        paint(false);
      } else if(index === count + 1){
        index = 1;
        paint(false);
      }
      locked = false;
    }

    track.addEventListener("transitionend", (event) => {
      if(event.propertyName === "transform") normalize();
    });

    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = Number(dot.dataset.slide);
        if(!Number.isInteger(target) || target < 0 || target >= count) return;
        const current = logicalIndex();
        if(target === current || locked) return;
        const forward = (target - current + count) % count;
        const backward = (current - target + count) % count;
        move(forward <= backward ? forward : -backward);
      });
    });

    track.addEventListener("pointerdown", (event) => {
      if(event.pointerType === "mouse" && event.button !== 0) return;
      startX = event.clientX;
      swipeMoved = false;
      track.setPointerCapture?.(event.pointerId);
    });

    track.addEventListener("pointermove", (event) => {
      if(startX !== null && Math.abs(event.clientX - startX) > 10) swipeMoved = true;
    });

    track.addEventListener("pointerup", (event) => {
      if(startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if(Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
    });

    track.addEventListener("pointercancel", () => {
      startX = null;
      swipeMoved = false;
    });

    paint(false);
  }

  // MOBILE / COMPACT NAVIGATION
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const menuBackdrop = document.getElementById("menuBackdrop");
  const menuClose = document.getElementById("menuClose");

  let scrollLockY = 0;
  let scrollLockApplied = false;
  let previousBodyStyle = null;

  function lockPageScroll(){
    if(scrollLockApplied) return;
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    previousBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.classList.add("menu-open");
    scrollLockApplied = true;
  }

  function unlockPageScroll(){
    if(!scrollLockApplied) return;
    document.body.classList.remove("menu-open");
    document.body.style.position = previousBodyStyle?.position || "";
    document.body.style.top = previousBodyStyle?.top || "";
    document.body.style.left = previousBodyStyle?.left || "";
    document.body.style.right = previousBodyStyle?.right || "";
    document.body.style.width = previousBodyStyle?.width || "";
    previousBodyStyle = null;
    window.scrollTo(0, scrollLockY);
    scrollLockApplied = false;
  }

  function closeMenu(){
    if(!menuToggle || !mainNav) return;
    mainNav.classList.remove("open");
    menuBackdrop?.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
    unlockPageScroll();
  }

  function openMenu(){
    if(!menuToggle || !mainNav) return;
    lockPageScroll();
    mainNav.classList.add("open");
    menuBackdrop?.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Закрыть меню");
  }

  if(menuToggle && mainNav){
    menuToggle.addEventListener("click", () => {
      mainNav.classList.contains("open") ? closeMenu() : openMenu();
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", event => {
        const href = link.getAttribute("href");
        if(!href || href === "#") {
          closeMenu();
          return;
        }
        if(!href.startsWith("#")) {
          closeMenu();
          return;
        }
        const target = document.querySelector(href);
        if(!target) return;
        event.preventDefault();
        const header = document.querySelector(".site-header");
        const offset = (header?.getBoundingClientRect().height || 0) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        closeMenu();
        window.setTimeout(() => window.scrollTo({top, behavior:"smooth"}), 20);
      });
    });

    menuClose?.addEventListener("click", closeMenu);

    menuBackdrop?.addEventListener("click", closeMenu);

    document.addEventListener("keydown", event => {
      if(event.key === "Escape") closeMenu();
    });
  }

  // CSS switches from drawer to desktop nav at 1440px.
  const desktopNavMQ = window.matchMedia("(min-width: 1440px)");
  const syncDesktopNav = () => {
    if(desktopNavMQ.matches) closeMenu();
  };
  desktopNavMQ.addEventListener?.("change", syncDesktopNav);
  syncDesktopNav();

  // DESKTOP BACK-TO-TOP
  const backToTop = document.getElementById("backToTop");
  if(backToTop){
    const syncBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 500);
    };
    backToTop.addEventListener("click", () => {
      window.scrollTo({top:0, behavior:"smooth"});
    });
    window.addEventListener("scroll", syncBackToTop, {passive:true});
    syncBackToTop();
  }
})();

// FORM REQUEST MODALS — shared transport and success/error states.
(() => {
  "use strict";

  const config = window.ALENINDAHOUSE_CONFIG?.forms || {};
  const endpoint = config.submitEndpoint || "submit.php";
  const maxFileBytes = Number(config.maxFileBytes || 10 * 1024 * 1024);

  let modalScrollLockY = 0;
  let modalScrollLockApplied = false;
  let previousModalBodyStyle = null;

  function lockModalPageScroll(){
    if(modalScrollLockApplied) return;
    modalScrollLockY = window.scrollY || window.pageYOffset || 0;
    previousModalBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${modalScrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    modalScrollLockApplied = true;
  }

  function unlockModalPageScroll(){
    if(!modalScrollLockApplied) return;
    document.body.style.position = previousModalBodyStyle?.position || "";
    document.body.style.top = previousModalBodyStyle?.top || "";
    document.body.style.left = previousModalBodyStyle?.left || "";
    document.body.style.right = previousModalBodyStyle?.right || "";
    document.body.style.width = previousModalBodyStyle?.width || "";
    previousModalBodyStyle = null;
    const html = document.documentElement;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, modalScrollLockY);
    html.style.scrollBehavior = previousHtmlScrollBehavior;
    modalScrollLockApplied = false;
  }

  function setStatus(status, message, isError = false){
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
    status.classList.toggle("is-error", isError);
  }

  async function sendForm(form){
    const body = new FormData(form);
    const response = await fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Accept": "application/json" },
      credentials: "same-origin"
    });
    let payload = null;
    try { payload = await response.json(); } catch (_) {}
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.message || "Не удалось отправить заявку. Попробуйте ещё раз.");
    }
    return payload;
  }

  function setupCallbackModal(){
    const modal = document.getElementById("callbackModal");
    const form = document.getElementById("callbackForm");
    const status = document.getElementById("callbackStatus");
    const success = document.getElementById("callbackSuccess");
    const successClose = document.getElementById("callbackSuccessClose");
    const closeButton = document.getElementById("callbackModalClose");
    if (!modal || !form) return;

    const nameField = form.elements.namedItem("name");
    const phoneField = form.elements.namedItem("phone");
    const consentField = form.elements.namedItem("consent");

    function resetView(){
      form.reset();
      form.querySelectorAll(".callback-field,.callback-consent,.callback-submit").forEach(el => { el.hidden = false; });
      status?.setAttribute("hidden", "");
      if (status) status.textContent = "";
      success?.setAttribute("hidden", "");
    }

    function openModal(){
      if (document.querySelector(".main-nav.open")) document.getElementById("menuToggle")?.click();
      document.querySelector(".estimate-modal.open")?._closeForSharedForms?.();
      resetView();
      modal.classList.add("open");
      document.body.classList.add("callback-modal-open");
      lockModalPageScroll();
      window.setTimeout(() => nameField?.focus(), 30);
    }

    function closeModal(){
      modal.classList.remove("open");
      document.body.classList.remove("callback-modal-open");
      unlockModalPageScroll();
      resetView();
    }

    document.querySelectorAll("[data-callback-open]").forEach(trigger => {
      trigger.addEventListener("click", event => {
        event.preventDefault();
        openModal();
      });
    });
    closeButton?.addEventListener("click", closeModal);
    successClose?.addEventListener("click", closeModal);
    modal.addEventListener("click", event => {
      if (event.target === event.currentTarget) closeModal();
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      setStatus(status, "Отправляем заявку…");
      const submit = form.querySelector(".callback-submit");
      if (submit) { submit.disabled = true; submit.setAttribute("aria-busy", "true"); }
      try {
        await sendForm(form);
        setStatus(status, "");
        form.querySelectorAll(".callback-field,.callback-consent,.callback-submit").forEach(el => { el.hidden = true; });
        success?.removeAttribute("hidden");
        successClose?.focus();
      } catch (error) {
        setStatus(status, error.message, true);
      } finally {
        if (submit) { submit.disabled = false; submit.removeAttribute("aria-busy"); }
      }
    });

    [nameField, phoneField, consentField].forEach(field => {
      field?.addEventListener("input", () => { if (status) setStatus(status, ""); });
      field?.addEventListener("change", () => { if (status) setStatus(status, ""); });
    });

    modal._closeForSharedForms = closeModal;
  }

  function setupEstimateModal(){
    const modal = document.getElementById("estimateModal");
    const form = document.getElementById("estimateForm");
    const status = document.getElementById("estimateStatus");
    const success = document.getElementById("estimateSuccess");
    const successClose = document.getElementById("estimateSuccessClose");
    const closeButton = document.getElementById("estimateModalClose");
    if (!modal || !form) return;

    const nameField = form.elements.namedItem("name");
    const phoneField = form.elements.namedItem("phone");
    const fileField = form.elements.namedItem("file");
    const fileButton = document.getElementById("estimateFileButton");
    const fileName = document.getElementById("estimateFileName");
    const consentField = form.elements.namedItem("consent");

    function resetView(){
      form.reset();
      form.querySelectorAll(".estimate-field,.estimate-consent,.estimate-submit").forEach(el => { el.hidden = false; });
      status?.setAttribute("hidden", "");
      if (status) status.textContent = "";
      success?.setAttribute("hidden", "");
      if (fileName) fileName.textContent = "Файл не выбран";
    }

    function openModal(){
      if (document.querySelector(".main-nav.open")) document.getElementById("menuToggle")?.click();
      document.querySelector(".callback-modal.open")?._closeForSharedForms?.();
      resetView();
      modal.classList.add("open");
      document.body.classList.add("estimate-modal-open");
      lockModalPageScroll();
      window.setTimeout(() => nameField?.focus(), 30);
    }

    function closeModal(){
      modal.classList.remove("open");
      document.body.classList.remove("estimate-modal-open");
      unlockModalPageScroll();
      resetView();
    }

    document.querySelectorAll("[data-estimate-open]").forEach(trigger => {
      trigger.addEventListener("click", event => {
        event.preventDefault();
        openModal();
      });
    });
    closeButton?.addEventListener("click", closeModal);
    successClose?.addEventListener("click", closeModal);
    modal.addEventListener("click", event => {
      if (event.target === event.currentTarget) closeModal();
    });

    fileButton?.addEventListener("click", () => {
      fileField?.click();
    });

    fileField?.addEventListener("change", () => {
      const file = fileField.files?.[0];
      if (file && file.size > maxFileBytes) {
        setStatus(status, "Файл слишком большой. Максимальный размер — 10 МБ.", true);
        fileField.value = "";
        if (fileName) fileName.textContent = "Файл не выбран";
        return;
      }
      if (fileName) fileName.textContent = file ? file.name : "Файл не выбран";
      setStatus(status, "");
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const file = fileField?.files?.[0];
      if (!file) {
        setStatus(status, "Прикрепите файл сметы.", true);
        fileField?.focus();
        return;
      }
      if (file.size > maxFileBytes) {
        setStatus(status, "Файл слишком большой. Максимальный размер — 10 МБ.", true);
        return;
      }
      setStatus(status, "Отправляем заявку…");
      const submit = form.querySelector(".estimate-submit");
      if (submit) { submit.disabled = true; submit.setAttribute("aria-busy", "true"); }
      try {
        await sendForm(form);
        setStatus(status, "");
        form.querySelectorAll(".estimate-field,.estimate-consent,.estimate-submit").forEach(el => { el.hidden = true; });
        success?.removeAttribute("hidden");
        successClose?.focus();
      } catch (error) {
        setStatus(status, error.message, true);
      } finally {
        if (submit) { submit.disabled = false; submit.removeAttribute("aria-busy"); }
      }
    });

    [nameField, phoneField, consentField].forEach(field => {
      field?.addEventListener("input", () => { if (status) setStatus(status, ""); });
      field?.addEventListener("change", () => { if (status) setStatus(status, ""); });
    });

    modal._closeForSharedForms = closeModal;
  }

  setupCallbackModal();
  setupEstimateModal();

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    document.querySelector(".callback-modal.open")?._closeForSharedForms?.();
    document.querySelector(".estimate-modal.open")?._closeForSharedForms?.();
  });
})();


// V4.0 / cookie consent manager.
const initCookieConsent = () => {
  "use strict";

  const consentKey = "alen_cookie_consent_v1";
  const banner = document.getElementById("cookieConsent");
  const settings = document.getElementById("cookieSettings");
  const backdrop = document.getElementById("cookieBackdrop");
  const trigger = document.getElementById("cookieSettingsTrigger");
  if(!banner || !settings || !backdrop || !trigger) return;

  const defaults = {necessary:true, analytics:false, advertising:false};
  const readConsent = () => {
    try {
      const raw = localStorage.getItem(consentKey);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return {necessary:true,analytics:!!parsed.analytics,advertising:!!parsed.advertising,version:1};
    } catch {
      return null;
    }
  };
  const writeConsent = (value) => {
    try {
      localStorage.setItem(consentKey, JSON.stringify({...defaults,...value,version:1,savedAt:new Date().toISOString()}));
      return true;
    } catch {
      return false;
    }
  };
  const dispatchConsent = (value) => {
    window.dispatchEvent(new CustomEvent("alen:cookie-consent", {detail:value}));
  };
  const setSettingsValues = (value) => {
    const analytics = settings.querySelector('[data-cookie-category="analytics"]');
    const advertising = settings.querySelector('[data-cookie-category="advertising"]');
    if(analytics) analytics.checked = !!value.analytics;
    if(advertising) advertising.checked = !!value.advertising;
  };
  const showBanner = () => {
    banner.removeAttribute("hidden");
    trigger.setAttribute("hidden", "");
  };
  const hideBanner = () => banner.setAttribute("hidden", "");
  const showSettings = () => {
    setSettingsValues(readConsent() || defaults);
    hideBanner();
    settings.removeAttribute("hidden");
    backdrop.removeAttribute("hidden");
    document.body.classList.add("cookie-settings-open");
  };
  const closeSettings = () => {
    settings.setAttribute("hidden", "");
    backdrop.setAttribute("hidden", "");
    document.body.classList.remove("cookie-settings-open");
    if(!readConsent()) showBanner();
  };
  const revealTrigger = () => trigger.removeAttribute("hidden");
  const save = (value) => {
    const normalized = {necessary:true,analytics:!!value.analytics,advertising:!!value.advertising};
    if(!writeConsent(normalized)) return;
    dispatchConsent(normalized);
    closeSettings();
    hideBanner();
    revealTrigger();
  };

  banner.querySelectorAll("[data-cookie-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.cookieAction;
      if(action === "accept") save({analytics:true,advertising:true});
      if(action === "reject") save({analytics:false,advertising:false});
      if(action === "settings") showSettings();
    });
  });
  settings.querySelectorAll("[data-cookie-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.cookieAction;
      if(action === "close-settings") closeSettings();
      if(action === "reject") save({analytics:false,advertising:false});
      if(action === "save-settings") save({
        analytics:!!settings.querySelector('[data-cookie-category="analytics"]')?.checked,
        advertising:!!settings.querySelector('[data-cookie-category="advertising"]')?.checked
      });
    });
  });
  trigger.addEventListener("click", showSettings);
  backdrop.addEventListener("click", closeSettings);
  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && !settings.hidden) closeSettings();
  });

  const existing = readConsent();
  if(existing){
    dispatchConsent(existing);
    revealTrigger();
  } else {
    window.setTimeout(showBanner, 250);
  }
};

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCookieConsent, {once:true});
else initCookieConsent();

// V4.0 / Cases: expandable list of completed works.
(function(){
  const root=document.querySelector('.case-grid');
  if(!root) return;
  const syncTaskHeights=()=>{
    root.style.removeProperty('--case-task-min-height');
    if(window.matchMedia('(max-width:760px)').matches) return;
    const tasks=[...root.querySelectorAll('.case-task')];
    if(!tasks.length) return;
    const maxHeight=Math.max(...tasks.map(task=>task.getBoundingClientRect().height));
    root.style.setProperty('--case-task-min-height',`${Math.ceil(maxHeight)}px`);
  };
  const syncAfterLayout=()=>requestAnimationFrame(()=>requestAnimationFrame(syncTaskHeights));
  syncAfterLayout();
  window.addEventListener('resize',syncAfterLayout,{passive:true});
  if(document.fonts?.ready) document.fonts.ready.then(syncAfterLayout);
  root.addEventListener('click',function(event){
    const button=event.target.closest('[data-case-toggle]');
    if(!button) return;
    const content=button.nextElementSibling;
    if(!content || !content.classList.contains('case-included')) return;
    const willOpen=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(willOpen));
    content.hidden=!willOpen;
  });
})();
