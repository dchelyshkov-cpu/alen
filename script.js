/* ALEN 10B — Current release candidate runtime */

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

  // Placeholder CTAs are intentionally inert until their final actions are connected.
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-placeholder-cta]");
    if (target) event.preventDefault();
  });

  // HERO CAROUSEL
  // The carousel is isolated so pages/components without #slides do not throw.
  const track = document.getElementById("slides");
  const originals = [...document.querySelectorAll(".slide")];
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  if (track && originals.length > 0) {
    const count = originals.length;
    let index = 1;
    let locked = false;
    let startX = null;

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


    track.addEventListener("pointerdown", (event) => {
      if(event.pointerType === "mouse" && event.button !== 0) return;
      startX = event.clientX;
      track.setPointerCapture?.(event.pointerId);
    });


    track.addEventListener("pointerup", (event) => {
      if(startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if(Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
    });

    track.addEventListener("pointercancel", () => {
      startX = null;
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
      const shouldShow = window.scrollY > 500;
      backToTop.classList.toggle("is-visible", shouldShow);
      if(!shouldShow) backToTop.classList.remove("is-resetting");
    };
    const clearBackToTopReset = () => {
      backToTop.classList.remove("is-resetting");
    };

    backToTop.addEventListener("click", event => {
      // Suppress hover/focus styling immediately after activation.
      // Mouse hover remains suppressed until the pointer actually leaves;
      // keyboard/touch activation clears the temporary state immediately.
      backToTop.classList.add("is-resetting");
      window.scrollTo({top:0, behavior:"smooth"});
      backToTop.blur();

      if(event.detail === 0 || !window.matchMedia("(hover: hover)").matches){
        requestAnimationFrame(clearBackToTopReset);
      }
    });

    backToTop.addEventListener("pointerleave", clearBackToTopReset);
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
    const card=button.closest('.case-card');
    if(card) card.classList.toggle('is-expanded',willOpen);
  });
})();
// ALEN 5.0_14 — mobile cases carousel + expanded-card height normalization.
(function(){
  const root=document.querySelector('.case-grid');
  const ui=document.querySelector('.cases-carousel-ui');
  if(!root || !ui) return;
  const cards=[...root.querySelectorAll('.case-card')];
  const count=document.getElementById('casesCarouselCount');
  const hint=document.getElementById('casesSwipeHint');
  const dots=[...ui.querySelectorAll('[data-case-slide]')];
  if(!cards.length || !count || !hint || dots.length!==cards.length) return;
  let lastIndex=0;
  const isMobileCaseCarousel=()=>window.matchMedia('(max-width:760px)').matches;

  const closeOtherCases=(currentIndex)=>{
    cards.forEach((card,i)=>{
      if(i===currentIndex) return;
      const button=card.querySelector('[data-case-toggle]');
      const content=card.querySelector('.case-included');
      card.classList.remove('is-expanded');
      if(!button || !content) return;
      button.setAttribute('aria-expanded','false');
      content.hidden=true;
    });
  };


  const update=()=>{
    const styles=getComputedStyle(root);
    const gap=parseFloat(styles.columnGap || styles.gap || '16') || 16;
    const firstWidth=cards[0].getBoundingClientRect().width;
    const step=firstWidth+gap;
    const index=Math.max(0,Math.min(cards.length-1,Math.round(root.scrollLeft/step)));
    if(index!==lastIndex && isMobileCaseCarousel()) closeOtherCases(index);
    lastIndex=index;
    count.textContent=`${index+1} / ${cards.length}`;
    if(index===0){
      hint.textContent='Свайпните влево, чтобы посмотреть следующие проекты';
    }else if(index===cards.length-1){
      hint.textContent='Свайпните вправо, чтобы вернуться к предыдущим проектам';
    }else{
      hint.textContent='Свайпните влево или вправо, чтобы переключать проекты';
    }
    hint.hidden=false;
    dots.forEach((dot,i)=>{
      const active=i===index;
      dot.classList.toggle('is-active',active);
      dot.setAttribute('aria-selected',String(active));
    });
  };

  root.addEventListener('scroll',()=>{
    requestAnimationFrame(update);
  },{passive:true});

  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-case-toggle]');
    if(!button) return;
    const card=button.closest('.case-card');
    if(!card) return;
  });

  dots.forEach(dot=>{
    dot.addEventListener('click',()=>{
      const i=Number(dot.dataset.caseSlide);
      const card=cards[i];
      if(!card) return;
      card.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
    });
  });

  update();
  window.addEventListener('resize',()=>{
    requestAnimationFrame(update);
  },{passive:true});
})();

// Screen 04 calculator — moved from index.html without logic changes.
(function(){
  'use strict';
  /* Screen 04 calculator — scoped to avoid conflicts with screens 01–03. */
  const CALC04_RATES={
    flat:{cosmetic:12000,capital:22000,designer:32000,turnkey:42000},
    house:{cosmetic:14000,capital:25000,designer:36000,turnkey:48000},
    townhouse:{cosmetic:15000,capital:27000,designer:38000,turnkey:50000}
  };
  /* Commercial baseline is intentionally unchanged: 44,000 ₽/m².
     Repair-format selection is now collected for scope transparency; commercial
     format-specific coefficients are NOT applied until the tariff audit is approved. */
  const CALC04_COMMERCIAL_RATE=22000*2;
  const CALC04_RANGE=0.12;
  const CALC04_AREA_LIMITS={
    flat:{min:20,max:120},
    house:{min:60,max:200},
    townhouse:{min:70,max:300},
    commercial:{min:10,max:100}
  };
  const CALC04_STATE={
    region:'moscow',object:'flat',apartmentType:'new',rooms:null,bathrooms:'1',commercialType:null,area:60,repair:'capital',step:1
  };
  const CALC04_QUESTIONS={
    region:{title:'Выберите регион, где находится Ваш объект',options:[['moscow','Москва'],['mo','Московская область (до 50 км от МКАД)']]},
    object:{title:'Что будем ремонтировать?',options:[['flat','Квартира'],['house','Частный дом'],['townhouse','Таунхаус'],['commercial','Коммерция']]},
    apartmentType:{title:'Где находится квартира?',options:[['new','Новостройка'],['secondary','Вторичное жильё']]},
    rooms:{title:'Сколько комнат в квартире?',options:[['1','1'],['2','2'],['3','3'],['4plus','4+']]},
    bathrooms:{title:'Сколько санузлов?',options:[['1','1'],['2','2'],['3plus','3+']]},
    commercialType:{title:'Какой тип коммерческого помещения?',options:[['office','Офис'],['retail','Магазин / шоурум'],['service','Сфера услуг'],['horeca','Кафе / ресторан'],['other','Другое']]},
    area:{title:'Какая площадь объекта?',range:true},
    repair:{title:'Какой формат ремонта планируется?',options:[['cosmetic','Косметический'],['capital','Капитальный'],['designer','Дизайнерский'],['turnkey','Под ключ']]}
  };
  const CALC04_REPAIR_DETAILS={
    cosmetic:{title:'Косметический',short:'Обновление отделки без полного цикла капитальных работ.',items:['подготовка и обновление поверхностей','покраска, обои и локальная отделка','обновление напольного покрытия по задаче','финальные монтажные работы без масштабной инженерии']},
    capital:{title:'Капитальный',short:'Полный комплекс черновых и инженерных работ с последующей отделкой.',items:['демонтаж и подготовка объекта','электрика и сантехнические коммуникации','выравнивание стен, пола и потолка','перепланировка и замена отдельных элементов по необходимости','чистовая отделка']},
    designer:{title:'Дизайнерский',short:'Ремонт с привязкой к дизайн-проекту и согласованным решениям.',items:['реализация работ по дизайн-проекту','точная подготовка и реализация отделочных решений','координация инженерных и чистовых работ','финальные монтажные работы согласно проекту']},
    turnkey:{title:'Под ключ',short:'Полный цикл до готового объекта, включая организацию закупок и финальный монтаж.',items:['полный демонтаж и инженерные работы','выравнивание и черновая подготовка','чистовая отделка и финальные работы','закупка и организация поставок материалов','установка кухни и мебели по согласованной задаче']}
  };

  const CALC04_OBJECT_NAMES={flat:'Квартира',house:'Частный дом',townhouse:'Таунхаус',commercial:'Коммерция'};
  const CALC04_COMMERCIAL_NAMES={office:'Офис',retail:'Магазин / шоурум',service:'Сфера услуг',horeca:'Кафе / ресторан',other:'Другое'};
  const CALC04_BATHROOM_NAMES={1:'1',2:'2','3plus':'3+'};
  const CALC04_ROOM_NAMES={1:'1',2:'2',3:'3','4plus':'4+'};

  const calc04El={
    step:document.getElementById('step'),
    pct:document.getElementById('pct'),
    qb:document.getElementById('qb'),
    result:document.getElementById('result'),
    price:document.getElementById('price'),
    meta:document.getElementById('meta'),
    progress:document.querySelector('.s04 .progress'),
    calc:document.querySelector('.s04 .calc'),
    included:document.getElementById('included')
  };

  function calc04Limits(){ return CALC04_AREA_LIMITS[CALC04_STATE.object] || CALC04_AREA_LIMITS.flat; }
  function calc04FormatRange(value){
    const low=Math.round((value*(1-CALC04_RANGE))/10000)*10000;
    const high=Math.round((value*(1+CALC04_RANGE))/10000)*10000;
    return 'от '+low.toLocaleString('ru-RU')+' до '+high.toLocaleString('ru-RU')+' ₽';
  }
  function calc04GetTerm(){
    if(CALC04_STATE.object==='commercial'){
      const base=60;
      const extra=Math.max(0,Math.ceil((CALC04_STATE.area-10)/15))*5;
      return Math.min(base+extra,180);
    }
    const base={cosmetic:45,capital:75,designer:95,turnkey:110}[CALC04_STATE.repair];
    const extra=Math.max(0,Math.ceil((CALC04_STATE.area-60)/20))*7;
    return Math.min(base+extra,180);
  }
  function calc04CurrentRate(){
    return CALC04_STATE.object==='commercial'
      ? CALC04_COMMERCIAL_RATE
      : CALC04_RATES[CALC04_STATE.object][CALC04_STATE.repair];
  }
  function calc04Path(){
    const path=['region','object'];
    if(CALC04_STATE.object==='flat'){
      path.push('apartmentType');
      if(CALC04_STATE.apartmentType==='secondary') path.push('rooms');
      path.push('bathrooms');
    } else if(CALC04_STATE.object==='house' || CALC04_STATE.object==='townhouse') {
      path.push('bathrooms');
    } else if(CALC04_STATE.object==='commercial') {
      path.push('commercialType');
    }
    path.push('area');
    path.push('repair');
    return path;
  }
  function calc04Render(){
    const path=calc04Path();
    const key=path[CALC04_STATE.step-1] || 'region';
    const q=CALC04_QUESTIONS[key];
    const total=path.length;
    calc04El.step.textContent=String(CALC04_STATE.step).padStart(2,'0')+' / '+String(total).padStart(2,'0');
    calc04El.pct.textContent=Math.round(CALC04_STATE.step/total*100)+'%';

    if(q.range){
      const lim=calc04Limits();
      CALC04_STATE.area=Math.min(Math.max(CALC04_STATE.area,lim.min),lim.max);
      calc04El.qb.innerHTML=
        '<div class="q-label">'+String(CALC04_STATE.step).padStart(2,'0')+'</div><div class="q">'+q.title+'</div>'+ 
        '<div class="slider"><div class="value">'+CALC04_STATE.area+' м²</div>'+ 
        '<input id="area" type="range" min="'+lim.min+'" max="'+lim.max+'" value="'+CALC04_STATE.area+'">'+
        '<div class="ranges"><span>'+lim.min+' м²</span><span>'+lim.max+' м²</span></div></div>'+ 
        '<div class="controls">'+
        (CALC04_STATE.step>1?'<button class="back" type="button" data-calc-action="prev">Назад</button>':'')+
        '<button class="next" type="button" data-calc-action="next">Далее</button>'+ 
        '</div>';
      const area=document.getElementById('area');
      area.addEventListener('input',function(e){
        CALC04_STATE.area=Number(e.target.value);
        const value=calc04El.qb.querySelector('.value');
        if(value) value.textContent=CALC04_STATE.area+' м²';
      });
    } else {
      const stateKey={region:'region',object:'object',apartmentType:'apartmentType',rooms:'rooms',bathrooms:'bathrooms',commercialType:'commercialType',repair:'repair'}[key];
      calc04El.qb.innerHTML=
        '<div class="q-label">'+String(CALC04_STATE.step).padStart(2,'0')+'</div>'+ 
        '<div class="q">'+q.title+'</div>'+ 
        '<div class="opts">'+q.options.map(function(x){
          return '<button class="opt '+(CALC04_STATE[stateKey]===x[0]?'active':'')+'" type="button" data-calc-value="'+x[0]+'">'+x[1]+'</button>';
        }).join('')+'</div>'+ 
        '<div class="controls">'+
        (CALC04_STATE.step>1?'<button class="back" type="button" data-calc-action="prev">Назад</button>':'')+
        '<button class="next" type="button" data-calc-action="next">Далее</button>'+ 
        '</div>';
    }
  }

  function calc04Advance(){
    const path=calc04Path();
    if(CALC04_STATE.step < path.length){ CALC04_STATE.step++; calc04Render(); }
    else { calc04Result(); }
  }
  function calc04Pick(value){
    const path=calc04Path();
    const key=path[CALC04_STATE.step-1];
    if(key==='region') CALC04_STATE.region=value;
    if(key==='object'){
      CALC04_STATE.object=value;
      CALC04_STATE.apartmentType=value==='flat' ? (CALC04_STATE.apartmentType || 'new') : null;
      CALC04_STATE.rooms=null;
      CALC04_STATE.bathrooms=(value==='commercial' ? null : (CALC04_STATE.bathrooms || '1'));
      CALC04_STATE.commercialType=value==='commercial' ? (CALC04_STATE.commercialType || 'office') : null;
      const lim=calc04Limits();
      CALC04_STATE.area=Math.min(Math.max(CALC04_STATE.area,lim.min),lim.max);
    }
    if(key==='apartmentType'){
      CALC04_STATE.apartmentType=value;
      if(value==='new') CALC04_STATE.rooms=null;
    }
    if(key==='rooms') CALC04_STATE.rooms=value;
    if(key==='bathrooms') CALC04_STATE.bathrooms=value;
    if(key==='commercialType') CALC04_STATE.commercialType=value;
    if(key==='repair') CALC04_STATE.repair=value;
    calc04Render();
  }
  function calc04Prev(){ if(CALC04_STATE.step>1){ CALC04_STATE.step--; calc04Render(); } }
  function calc04Result(){
    const rate=calc04CurrentRate();
    const total=Math.round(CALC04_STATE.area*rate/10000)*10000;
    const avgLow=Math.round((rate*(1-CALC04_RANGE))/100)*100;
    const avgHigh=Math.round((rate*(1+CALC04_RANGE))/100)*100;
    const term=calc04GetTerm();
    const repair=CALC04_REPAIR_DETAILS[CALC04_STATE.repair];
    calc04El.price.textContent=calc04FormatRange(total);
    let summary='<div class="calc-summary"><div><span>Вид объекта</span><strong>'+CALC04_OBJECT_NAMES[CALC04_STATE.object]+'</strong></div>';
    if(CALC04_STATE.object==='flat'){
      summary+='<div><span>Тип квартиры</span><strong>'+(CALC04_STATE.apartmentType==='secondary'?'Вторичное жильё':'Новостройка')+'</strong></div>';
      if(CALC04_STATE.rooms) summary+='<div><span>Комнаты</span><strong>'+CALC04_ROOM_NAMES[CALC04_STATE.rooms]+'</strong></div>';
      summary+='<div><span>Санузлы</span><strong>'+CALC04_BATHROOM_NAMES[CALC04_STATE.bathrooms]+'</strong></div>';
    } else if(CALC04_STATE.object==='house' || CALC04_STATE.object==='townhouse'){
      summary+='<div><span>Санузлы</span><strong>'+CALC04_BATHROOM_NAMES[CALC04_STATE.bathrooms]+'</strong></div>';
    } else if(CALC04_STATE.object==='commercial'){
      summary+='<div><span>Тип коммерции</span><strong>'+CALC04_COMMERCIAL_NAMES[CALC04_STATE.commercialType]+'</strong></div>';
    }
    summary+='<div><span>Площадь</span><strong>'+CALC04_STATE.area+' м²</strong></div>';
    if(repair) summary+='<div><span>Формат ремонта</span><strong>'+repair.title+'</strong></div>';
    summary+='<div><span>Ориентировочный срок ремонта</span><strong>'+term+'–'+(term+15)+' дней</strong></div>'+ 
      '<div><span>Ориентировочная цена за м²</span><strong>'+avgLow.toLocaleString('ru-RU')+'–'+avgHigh.toLocaleString('ru-RU')+' ₽/м²</strong></div></div>';
    if(CALC04_STATE.object==='commercial'){
      summary+='<p class="calc-note">Для коммерции формат ремонта уже учитывается в составе работ, но текущий расчёт цены сохраняет единый базовый коэффициент. Коэффициенты по форматам будут уточнены отдельно.</p>';
    }
    calc04El.meta.innerHTML=summary;
    const includedTitle=calc04El.included?.querySelector('strong');
    const includedList=calc04El.included?.querySelector('ul');
    const includedNote=calc04El.included?.querySelector('p');
    if(repair && includedTitle && includedList){
      includedTitle.textContent='В расчёт заложен формат «'+repair.title+'»: ';
      includedList.innerHTML=repair.items.map(item=>'<li>'+item+'</li>').join('');
      if(includedNote) includedNote.textContent=repair.short+' Точная смета формируется после уточнения состояния объекта, состава работ и выбранных материалов.';
    }
    calc04El.step.textContent=String(calc04Path().length).padStart(2,'0')+' / '+String(calc04Path().length).padStart(2,'0');
    calc04El.pct.textContent='100%';
    calc04El.result.classList.add('show');
    calc04El.qb.style.display='none';
    calc04El.progress.style.display='none';
  }
  function calc04Reset(){
    CALC04_STATE.region='moscow';
    CALC04_STATE.object='flat';
    CALC04_STATE.apartmentType='new';
    CALC04_STATE.rooms=null;
    CALC04_STATE.bathrooms='1';
    CALC04_STATE.commercialType=null;
    CALC04_STATE.area=60;
    CALC04_STATE.repair='capital';
    CALC04_STATE.step=1;
    calc04El.result.classList.remove('show');
    calc04El.qb.style.display='';
    calc04El.progress.style.display='flex';
    calc04Render();
  }
  function calc04ToggleIncluded(){ calc04El.included.hidden=!calc04El.included.hidden; }

  calc04El.qb.addEventListener('click',function(event){
    const action=event.target.closest('[data-calc-action]');
    if(action){
      if(action.dataset.calcAction==='prev') calc04Prev();
      if(action.dataset.calcAction==='next') calc04Advance();
      return;
    }
    const option=event.target.closest('[data-calc-value]');
    if(option) calc04Pick(option.dataset.calcValue);
  });
  document.querySelector('.s04 .result-actions')?.addEventListener('click',function(event){
    const button=event.target.closest('[data-calc-reset]');
    if(button) calc04Reset();
  });
  document.querySelector('.s04 .included-link')?.addEventListener('click',calc04ToggleIncluded);
  calc04Render();
})();

// Knowledge accordion — moved from index.html without logic changes.
(function () {
  const root = document.querySelector('[data-accordion="knowledge"]');
  if (!root) return;

  root.addEventListener('click', function (event) {
    const button = event.target.closest('.knowledge-question');
    if (!button) return;

    const item = button.closest('.knowledge-item');
    const answer = item && item.querySelector('.knowledge-answer');
    if (!answer) return;

    const willOpen = button.getAttribute('aria-expanded') !== 'true';

    root.querySelectorAll('.knowledge-question[aria-expanded="true"]').forEach(function (other) {
      if (other === button) return;
      const otherItem = other.closest('.knowledge-item');
      const otherAnswer = otherItem && otherItem.querySelector('.knowledge-answer');

      other.setAttribute('aria-expanded', 'false');
      if (otherAnswer) otherAnswer.hidden = true;
      if (otherItem) otherItem.classList.remove('is-open');
    });

    button.setAttribute('aria-expanded', String(willOpen));
    answer.hidden = !willOpen;
    item.classList.toggle('is-open', willOpen);
  });
})();
