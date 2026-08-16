/* ==========================================================================
   ItsHerious — portfolio engine
   Reads everything from info.json and renders the page from it.
   ========================================================================== */

(function () {
    "use strict";

    const DATA_PATH = "info.json";
    const THEME_KEY = "itsherious-theme";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const els = {
        menuTrigger: document.getElementById("menuTrigger"),
        nav: document.getElementById("nav"),
        navInner: document.getElementById("navInner"),
        themeTrigger: document.getElementById("themeTrigger"),
        themeIcon: document.getElementById("themeIcon"),
        favicon: document.getElementById("favicon"),
        canonicalLink: document.getElementById("canonicalLink"),
        ogTitle: document.getElementById("ogTitle"),
        ogDescription: document.getElementById("ogDescription"),
        ogImage: document.getElementById("ogImage"),
        ogUrl: document.getElementById("ogUrl"),
        twitterTitle: document.getElementById("twitterTitle"),
        twitterDescription: document.getElementById("twitterDescription"),
        twitterImage: document.getElementById("twitterImage"),
        ldJson: document.getElementById("ldJson"),
        profileImg: document.getElementById("profileImg"),
        displayName: document.getElementById("displayName"),
        displayBioText: document.getElementById("displayBioText"),
        bioCursor: document.getElementById("bioCursor"),
        metaRole: document.getElementById("metaRole"),
        metaLocation: document.getElementById("metaLocation"),
        metaStatus: document.getElementById("metaStatus"),
        aboutContent: document.getElementById("aboutContent"),
        skillsContent: document.getElementById("skillsContent"),
        projectsContent: document.getElementById("projectsContent"),
        contactContent: document.getElementById("contactContent"),
        footerName: document.getElementById("footerName"),
        footerYear: document.getElementById("footerYear"),
        toast: document.getElementById("toast"),
    };

    const panelsByKey = {
        about: els.aboutContent,
        skills: els.skillsContent,
        projects: els.projectsContent,
        contact: els.contactContent,
    };

    /* ---------------------------------------------------------------------
       Small helpers
       --------------------------------------------------------------------- */

    function getPanelKeyFromHash() {
        const key = window.location.hash.replace(/^#/, "");
        return Object.prototype.hasOwnProperty.call(panelsByKey, key) ? key : null;
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = String(str == null ? "" : str);
        return div.innerHTML;
    }

    // Supports **bold** only — everything else is escaped first.
    function formatInline(str) {
        const escaped = escapeHtml(str);
        return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }

    function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.add("show");
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(function () {
            els.toast.classList.remove("show");
        }, 1800);
    }

    /* ---------------------------------------------------------------------
       Theme
       --------------------------------------------------------------------- */

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        els.themeIcon.className = theme === "light" ? "ri-sun-line" : "ri-moon-line";
        if (!prefersReducedMotion) {
            els.themeIcon.style.animation = "none";
            // eslint-disable-next-line no-unused-expressions
            els.themeIcon.offsetHeight; // force reflow to restart the pop-in
            els.themeIcon.style.animation = "";
        }
        els.themeTrigger.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }

    function initTheme() {
        let stored = null;
        try {
            stored = window.localStorage.getItem(THEME_KEY);
        } catch (e) {
            /* storage unavailable — fall through to system preference */
        }
        const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        const theme = stored || (systemPrefersLight ? "light" : "dark");
        applyTheme(theme);

        els.themeTrigger.addEventListener("click", function () {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "light" ? "dark" : "light";
            applyTheme(next);
            try {
                window.localStorage.setItem(THEME_KEY, next);
            } catch (e) {
                /* ignore */
            }
        });
    }

    /* ---------------------------------------------------------------------
       Menu / panel navigation
       --------------------------------------------------------------------- */

    function closeMenu() {
        els.nav.classList.remove("open");
        els.nav.setAttribute("aria-hidden", "true");
        els.menuTrigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        els.nav.classList.add("open");
        els.nav.setAttribute("aria-hidden", "false");
        els.menuTrigger.setAttribute("aria-expanded", "true");
    }

    function initMenu() {
        els.menuTrigger.addEventListener("click", function () {
            const isOpen = els.nav.classList.contains("open");
            isOpen ? closeMenu() : openMenu();
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeMenu();
        });

        document.addEventListener("click", function (e) {
            if (
                els.nav.classList.contains("open") &&
                !els.nav.contains(e.target) &&
                !els.menuTrigger.contains(e.target)
            ) {
                closeMenu();
            }
        });

        els.navInner.addEventListener("click", function (e) {
            const btn = e.target.closest(".nav-category");
            if (!btn) return;
            showPanel(btn.getAttribute("data-menu"));
            closeMenu();
        });
    }

    // Pure DOM update — no history side effects. Used for the initial
    // render and by the hashchange listener (which already reflects the URL).
    function renderPanel(key) {
        Object.keys(panelsByKey).forEach(function (k) {
            const panel = panelsByKey[k];
            if (!panel) return;
            if (k === key) {
                panel.classList.remove("is-hidden");
                if (!prefersReducedMotion) {
                    const staggered = panel.querySelectorAll(".skill-chip, .project-btn, .link-row");
                    panel.style.animation = "none";
                    staggered.forEach(function (el) { el.style.animation = "none"; });
                    // eslint-disable-next-line no-unused-expressions
                    panel.offsetHeight; // force reflow to restart the animation
                    panel.style.animation = "";
                    staggered.forEach(function (el) { el.style.animation = ""; });
                }
            } else {
                panel.classList.add("is-hidden");
            }
        });

        els.navInner.querySelectorAll(".nav-category").forEach(function (btn) {
            const isCurrent = btn.getAttribute("data-menu") === key;
            btn.setAttribute("aria-current", isCurrent ? "true" : "false");
        });

        document.dispatchEvent(new CustomEvent("site:panelshown", { detail: { key: key } }));
    }

    // Navigation entry point for clicks: updates the URL hash so panels are
    // deep-linkable and the back/forward buttons step through panel history.
    // The actual render happens in the hashchange listener (see initRouting),
    // except when the target is already the current hash — hashchange won't
    // fire in that case, so render directly.
    function showPanel(key) {
        if (!Object.prototype.hasOwnProperty.call(panelsByKey, key)) return;
        if (getPanelKeyFromHash() === key) {
            renderPanel(key);
        } else {
            window.location.hash = key;
        }
    }

    function initRouting() {
        window.addEventListener("hashchange", function () {
            closeMenu();
            renderPanel(getPanelKeyFromHash() || "about");
        });
    }

    /* ---------------------------------------------------------------------
       Rendering
       --------------------------------------------------------------------- */

    function renderMeta(data) {
        const meta = data.meta || {};
        const profile = data.profile || {};
        const title = meta.siteTitle || profile.name || "Portfolio";
        const description = meta.siteDescription || profile.tagline || "";
        const image = profile.avatar || "";
        const url = meta.siteUrl || "";

        document.title = title;
        document.documentElement.lang = meta.language || "vi";
        setMetaContent('meta[name="description"]', description);
        setMetaContent('meta[name="keywords"]', (meta.keywords || []).join(", "));
        setMetaContent('meta[name="author"]', profile.name || "");
        setMetaContent('meta[name="theme-color"]', meta.themeColor || "#4f8dff");

        if (els.favicon && image) els.favicon.setAttribute("href", image);
        if (els.canonicalLink && url) els.canonicalLink.setAttribute("href", url);

        if (els.ogTitle) els.ogTitle.setAttribute("content", title);
        if (els.ogDescription) els.ogDescription.setAttribute("content", description);
        if (els.ogImage && image) els.ogImage.setAttribute("content", image);
        if (els.ogUrl && url) els.ogUrl.setAttribute("content", url);

        if (els.twitterTitle) els.twitterTitle.setAttribute("content", title);
        if (els.twitterDescription) els.twitterDescription.setAttribute("content", description);
        if (els.twitterImage && image) els.twitterImage.setAttribute("content", image);

        if (els.ldJson) {
            const sameAs = (data.social || []).map(function (s) { return s.url; }).filter(Boolean);
            const ld = {
                "@context": "https://schema.org",
                "@type": "Person",
                name: profile.name || "",
                alternateName: profile.alternateName || undefined,
                url: url || undefined,
                image: image || undefined,
                jobTitle: profile.role || undefined,
                description: description || undefined,
                sameAs: sameAs.length ? sameAs : undefined,
            };
            els.ldJson.textContent = JSON.stringify(ld);
        }
    }

    function setMetaContent(selector, value) {
        const node = document.querySelector(selector);
        if (node && value) node.setAttribute("content", value);
    }

    function renderProfile(profile) {
        profile = profile || {};
        if (profile.avatar) els.profileImg.setAttribute("src", profile.avatar);
        els.profileImg.setAttribute("alt", profile.name ? profile.name + "'s avatar" : "profile");
        els.displayName.textContent = profile.name || "";
        els.metaRole.textContent = profile.role || "—";
        els.metaLocation.textContent = profile.location || "—";
        els.metaStatus.textContent = profile.status || "—";
        els.footerName.textContent = profile.name || "";

        typeBio(profile.tagline || "");
    }

    function typeBio(text) {
        if (!text) {
            els.displayBioText.textContent = "";
            els.bioCursor.classList.add("is-done");
            return;
        }
        if (prefersReducedMotion) {
            els.displayBioText.textContent = text;
            return;
        }
        els.displayBioText.textContent = "";
        let i = 0;
        const speed = 28;
        (function tick() {
            if (i <= text.length) {
                els.displayBioText.textContent = text.slice(0, i);
                i += 1;
                window.setTimeout(tick, speed);
            }
        })();
    }

    function renderAbout(about) {
        const paragraphs = Array.isArray(about) ? about : [];
        if (!paragraphs.length) {
            els.aboutContent.innerHTML = '<div class="empty-state">Add a few lines to the "about" array in info.json to introduce yourself here.</div>';
            return;
        }
        els.aboutContent.innerHTML = paragraphs.map(function (p) {
            return "<p>" + formatInline(p) + "</p>";
        }).join("");
    }

    function renderSkills(skills) {
        const list = Array.isArray(skills) ? skills : [];
        const navBtn = els.navInner.querySelector('[data-menu="skills"]');
        if (!list.length) {
            if (navBtn) navBtn.classList.add("is-hidden");
            els.skillsContent.innerHTML = '<div class="empty-state">Add entries to "skills" in info.json to list your tech stack here.</div>';
            return;
        }
        if (navBtn) navBtn.classList.remove("is-hidden");
        els.skillsContent.innerHTML = list.map(function (skill, idx) {
            const icon = skill.icon || "ri-code-line";
            return (
                '<span class="skill-chip" style="--i:' + Math.min(idx, 14) + '"><i class="' + escapeHtml(icon) + '" aria-hidden="true"></i>' +
                "<span>" + escapeHtml(skill.name || "") + "</span></span>"
            );
        }).join("");
    }

    function renderProjects(projects) {
        const list = Array.isArray(projects) ? projects : [];
        if (!list.length) {
            els.projectsContent.innerHTML = '<div class="empty-state">Add entries to "projects" in info.json to showcase your work here.</div>';
            return;
        }
        els.projectsContent.innerHTML = list.map(function (project, idx) {
            const icon = project.icon || "ri-code-box-line";
            const tags = Array.isArray(project.tags) ? project.tags : [];
            const tagsHtml = tags.length
                ? '<div class="project-tags">' + tags.map(function (t) {
                      return '<span class="project-tag">' + escapeHtml(t) + "</span>";
                  }).join("") + "</div>"
                : "";
            const descHtml = project.description ? '<span class="project-desc">' + escapeHtml(project.description) + "</span>" : "";
            return (
                '<a class="project-btn" style="--i:' + Math.min(idx, 14) + '" href="' + escapeHtml(project.url || "#") + '" target="_blank" rel="noopener noreferrer">' +
                '<i class="proj-icon ' + escapeHtml(icon) + '" aria-hidden="true"></i>' +
                '<span class="project-body">' +
                '<span class="project-name">' + escapeHtml(project.name || "Untitled project") + "</span>" +
                descHtml +
                tagsHtml +
                "</span>" +
                "</a>"
            );
        }).join("");
    }

    function renderLinkGroup(title, iconClass, items, options) {
        options = options || {};
        if (!items || !items.length) return "";
        const rows = items.map(function (item, idx) {
            const icon = item.icon || "ri-links-line";
            const extraClass = options.highlight ? " donation-highlight" : "";
            const copyBtn = item.copyValue
                ? '<button type="button" class="copy-btn" data-copy="' + escapeHtml(item.copyValue) + '" aria-label="Copy ' + escapeHtml(item.platform || "value") + '"><i class="ri-file-copy-line" aria-hidden="true"></i></button>'
                : "";
            return (
                '<div class="link-row" style="--i:' + Math.min(idx, 14) + '">' +
                '<a class="link' + extraClass + '" href="' + escapeHtml(item.url || "#") + '" target="_blank" rel="noopener noreferrer">' +
                '<i class="' + escapeHtml(icon) + '" aria-hidden="true"></i>' +
                "<span>" + escapeHtml(item.platform || "") + "</span>" +
                "</a>" +
                copyBtn +
                "</div>"
            );
        }).join("");

        return (
            '<div class="contact-group">' +
            '<h2 class="group-title"><i class="' + iconClass + '" aria-hidden="true"></i>' + escapeHtml(title) + "</h2>" +
            '<div class="links-stack">' + rows + "</div>" +
            "</div>"
        );
    }

    function renderContact(data) {
        const groups = [
            renderLinkGroup("Social", "ri-share-line", data.social),
            renderLinkGroup("Support", "ri-hand-heart-line", data.donations, { highlight: true }),
            renderLinkGroup("Contact", "ri-chat-3-line", data.contact),
        ].filter(Boolean);

        els.contactContent.innerHTML = groups.length
            ? groups.join("")
            : '<div class="empty-state">Add "social", "donations", or "contact" entries in info.json to fill this section.</div>';

        els.contactContent.querySelectorAll(".copy-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const value = btn.getAttribute("data-copy");
                copyToClipboard(value, btn);
            });
        });
    }

    function flashCopySuccess(btn) {
        if (!btn) return;
        const icon = btn.querySelector("i");
        if (!icon) return;
        const original = icon.className;
        icon.className = "ri-check-line";
        btn.classList.add("copy-btn-success");
        window.clearTimeout(btn._copyResetT);
        btn._copyResetT = window.setTimeout(function () {
            icon.className = original;
            btn.classList.remove("copy-btn-success");
        }, 1500);
    }

    function copyToClipboard(value, btn) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value).then(function () {
                showToast("Copied to clipboard");
                flashCopySuccess(btn);
            }).catch(function () {
                showToast("Couldn't copy — copy manually");
            });
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = value;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                showToast("Copied to clipboard");
                flashCopySuccess(btn);
            } catch (e) {
                showToast("Couldn't copy — copy manually");
            }
            document.body.removeChild(textarea);
        }
    }

    function renderFooterYear() {
        els.footerYear.textContent = "© " + new Date().getFullYear();
    }

    function renderAll(data) {
        renderMeta(data);
        renderProfile(data.profile);
        renderAbout(data.about);
        renderSkills(data.skills);
        renderProjects(data.projects);
        renderContact(data);
        renderFooterYear();
        renderPanel(getPanelKeyFromHash() || "about");
        document.dispatchEvent(new CustomEvent("site:rendered"));
    }

    function renderLoadError() {
        els.aboutContent.innerHTML =
            '<div class="empty-state">Couldn\'t load <code>info.json</code>. If you opened this file directly from disk, ' +
            "browsers block that for security reasons — run a local server instead, e.g. <code>npx serve</code> or " +
            "<code>python3 -m http.server</code>, then open the page from <code>http://localhost</code>.</div>";
        renderFooterYear();
        renderPanel("about");
    }

    /* ---------------------------------------------------------------------
       Init
       --------------------------------------------------------------------- */

    function init() {
        initTheme();
        initMenu();
        initRouting();

        fetch(DATA_PATH, { cache: "no-store" })
            .then(function (res) {
                if (!res.ok) throw new Error("Failed to load " + DATA_PATH);
                return res.json();
            })
            .then(renderAll)
            .catch(function (err) {
                console.error(err);
                renderLoadError();
            });
    }

    document.addEventListener("DOMContentLoaded", init);
})();
