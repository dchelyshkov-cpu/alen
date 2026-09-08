
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
        const id = link.getAttribute("href");
        if(!id || id === "#") {
          closeMenu();
          return;
        }
        const target = document.querySelector(id);
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
