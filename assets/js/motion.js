/*
 * Optional enhancement layer on top of script.js.
 *
 * script.js renders the site and works completely on its own with pure CSS
 * animation (see style.css). This file adds a second, richer layer on top
 * using GSAP core (no paid plugins — see DESIGN.md for why) when it's
 * available: a cursor follower, magnetic buttons, a character-split name
 * reveal, grid-aware staggered entrances, and 3D tilt cards.
 *
 * It hooks into script.js only through two DOM CustomEvents — "site:rendered"
 * (fired once after the initial data render) and "site:panelshown" (fired
 * every time a nav panel is shown) — so script.js never needs to know this
 * file exists. If GSAP fails to load (network, ad-blocker, offline), or the
 * visitor prefers reduced motion, this file quietly does nothing and the
 * CSS-only experience stands on its own.
 */
(function () {
    "use strict";

    if (typeof window.gsap === "undefined") {
        return;
    }

    var prefersReducedMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    var hasFinePointer =
        window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    document.documentElement.classList.add("gsap-ready");

    /* ---------------------------------------------------------------------
       Cursor follower — a small dot (tight follow) plus a trailing ring
       (looser follow), fine-pointer devices only.
       --------------------------------------------------------------------- */
    function initCursor() {
        if (!hasFinePointer) return;
        var fx = document.getElementById("cursorFx");
        var dot = document.getElementById("cursorDot");
        var ring = document.getElementById("cursorRing");
        if (!fx || !dot || !ring) return;

        gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

        var dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
        var dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
        var ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
        var ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

        var shown = false;
        window.addEventListener("mousemove", function (e) {
            if (!shown) {
                fx.classList.add("active");
                shown = true;
            }
            dotX(e.clientX);
            dotY(e.clientY);
            ringX(e.clientX);
            ringY(e.clientY);
        });

        document.documentElement.addEventListener("mouseleave", function () {
            fx.classList.remove("active");
        });

        var hoverSelector = "a, button, .skill-chip, .nav-category, .copy-btn";
        document.addEventListener("mouseover", function (e) {
            if (e.target.closest && e.target.closest(hoverSelector)) {
                fx.classList.add("hover");
                gsap.to(ring, { scale: 1.7, duration: 0.3, ease: "power2.out" });
            }
        });
        document.addEventListener("mouseout", function (e) {
            if (e.target.closest && e.target.closest(hoverSelector)) {
                fx.classList.remove("hover");
                gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.out" });
            }
        });
    }

    /* ---------------------------------------------------------------------
       Magnetic pull — reserved for the two header buttons only. Applying
       this everywhere reads as noisy rather than delightful.
       --------------------------------------------------------------------- */
    function applyMagnetic(el, strength) {
        if (!el || !hasFinePointer) return;
        strength = strength || 0.3;
        var xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "elastic.out(1, 0.4)" });
        var yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "elastic.out(1, 0.4)" });
        el.addEventListener("mousemove", function (e) {
            var r = el.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * strength);
            yTo((e.clientY - r.top - r.height / 2) * strength);
        });
        el.addEventListener("mouseleave", function () {
            xTo(0);
            yTo(0);
        });
    }

    /* ---------------------------------------------------------------------
       3D tilt — project cards only, clamped and reset on mouseleave.
       --------------------------------------------------------------------- */
    function applyTilt(el) {
        if (!el || el._tiltApplied || !hasFinePointer) return;
        el._tiltApplied = true;
        el.style.transformPerspective = "700px";
        var rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
        var ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
        var ty = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        el.addEventListener("mousemove", function (e) {
            var r = el.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - 0.5;
            var py = (e.clientY - r.top) / r.height - 0.5;
            rx(-py * 9);
            ry(px * 11);
            ty(-4);
        });
        el.addEventListener("mouseleave", function () {
            rx(0);
            ry(0);
            ty(0);
        });
    }

    function enhanceProjectTilt() {
        document.querySelectorAll(".project-btn").forEach(applyTilt);
    }

    /* ---------------------------------------------------------------------
       Character split — a small free stand-in for GSAP's paid SplitText
       plugin. Keeps the full string in an aria-label on the parent so
       screen readers get the real text instead of one span per letter.
       --------------------------------------------------------------------- */
    function splitChars(el) {
        var text = el.textContent;
        el.setAttribute("aria-label", text);
        el.innerHTML = "";
        var frag = document.createDocumentFragment();
        Array.prototype.forEach.call(text, function (ch) {
            var span = document.createElement("span");
            span.textContent = ch === " " ? "\u00A0" : ch;
            span.style.display = "inline-block";
            span.setAttribute("aria-hidden", "true");
            frag.appendChild(span);
        });
        el.appendChild(frag);
        return el.querySelectorAll("span");
    }

    /* ---------------------------------------------------------------------
       Intro timeline — plays once, after the first real render.
       --------------------------------------------------------------------- */
    var introPlayed = false;
    function playIntro() {
        if (introPlayed) return;
        introPlayed = true;

        var nameEl = document.getElementById("displayName");
        var chars = nameEl ? splitChars(nameEl) : [];

        var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".logo", { opacity: 0, y: -10, duration: 0.4 })
            .from("#menuTrigger", { opacity: 0, x: -12, duration: 0.4 }, "<")
            .from("#themeTrigger", { opacity: 0, x: 12, duration: 0.4 }, "<")
            .from(".profile-frame", { opacity: 0, scale: 0.75, duration: 0.55, ease: "back.out(1.6)" }, "-=0.15");

        if (chars.length) {
            tl.from(chars, { opacity: 0, y: 18, rotateX: -50, duration: 0.5, stagger: 0.02, ease: "expo.out" }, "-=0.2");
        }

        tl.from("#displayBio", { opacity: 0, y: 8, duration: 0.4 }, "-=0.2")
            .from(".meta-chip", { opacity: 0, y: 8, duration: 0.3, stagger: 0.06 }, "-=0.15");
    }

    /* ---------------------------------------------------------------------
       Panel entrance — grid-aware stagger for skills, simpler list stagger
       for projects/contact. Re-runs every time a panel is (re-)shown.
       --------------------------------------------------------------------- */
    function animatePanelChildren(key) {
        var selectors = {
            skills: "#skillsContent .skill-chip",
            projects: "#projectsContent .project-btn",
            contact: "#contactContent .link-row",
        };
        var sel = selectors[key];
        if (!sel) return;
        var items = document.querySelectorAll(sel);
        if (!items.length) return;

        gsap.killTweensOf(items);

        if (key === "skills") {
            gsap.from(items, {
                opacity: 0,
                y: 16,
                scale: 0.88,
                duration: 0.45,
                stagger: { each: 0.04, from: "start", grid: "auto" },
                ease: "back.out(1.5)",
            });
        } else if (key === "projects") {
            gsap.from(items, { opacity: 0, y: 20, duration: 0.4, stagger: 0.08, ease: "power2.out" });
            enhanceProjectTilt();
        } else {
            gsap.from(items, { opacity: 0, x: -16, duration: 0.35, stagger: 0.06, ease: "power2.out" });
        }
    }

    initCursor();
    applyMagnetic(document.getElementById("menuTrigger"), 0.25);
    applyMagnetic(document.getElementById("themeTrigger"), 0.3);

    document.addEventListener("site:rendered", function () {
        playIntro();
        enhanceProjectTilt();
    });

    document.addEventListener("site:panelshown", function (e) {
        animatePanelChildren(e.detail && e.detail.key);
    });
})();
