/* Kesiswaan Settings Drawer — floating gear + liquid glass panel */
(() => {
    if (window.__kesiswaanSettingsReady) return;
    window.__kesiswaanSettingsReady = true;

    function init() {
        if (document.getElementById("settingsTrigger")) return;

        const root = document.createElement("div");
        root.innerHTML = `
            <button class="settings-trigger" id="settingsTrigger" type="button"
                aria-label="Buka panel pengaturan" aria-haspopup="dialog" aria-expanded="false">
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
                </svg>
            </button>
            <div class="settings-drawer-overlay" id="settingsOverlay"></div>
            <aside class="settings-drawer" id="settingsDrawer" role="dialog" aria-modal="true"
                aria-label="Panel pengaturan" aria-hidden="true">
                <div class="settings-drawer-head">
                    <div><strong>Pengaturan</strong><small>Gerakan Disiplin Sekolah · SMAN 1 Sooko</small></div>
                    <button class="settings-close" id="settingsClose" type="button" aria-label="Tutup panel">&times;</button>
                </div>
                <div class="settings-drawer-body">
                    <div class="settings-row">
                        <div class="settings-row-text">
                            <span class="settings-row-title">Mode tampilan</span>
                            <span class="settings-row-desc">Ikuti preferensi terang atau gelap</span>
                        </div>
                        <button class="theme-toggle" id="settingsThemeToggle" type="button"
                            aria-label="Ganti tema gelap atau terang" aria-pressed="false">
                            <span class="theme-toggle-track"><span>☀️</span><span>🌙</span></span>
                            <span class="theme-toggle-thumb"></span>
                        </button>
                    </div>
                    <p class="settings-note">Preferensi tema disimpan pada perangkat ini.</p>
                    <a class="settings-shortcut" href="/kesiswaan/pages/about.html">Tentang portal <span>→</span></a>
                </div>
            </aside>`;
        while (root.firstElementChild) document.body.appendChild(root.firstElementChild);

        const trigger = document.getElementById("settingsTrigger");
        const overlay = document.getElementById("settingsOverlay");
        const drawer = document.getElementById("settingsDrawer");
        const closeButton = document.getElementById("settingsClose");
        const themeButton = document.getElementById("settingsThemeToggle");

        const currentTheme = () => document.documentElement.getAttribute("data-theme") === "dark";
        const syncTheme = () => {
            themeButton.setAttribute("aria-pressed", String(currentTheme()));
            themeButton.classList.toggle("is-dark", currentTheme());
        };
        const close = () => {
            drawer.classList.remove("open");
            overlay.classList.remove("open");
            drawer.setAttribute("aria-hidden", "true");
            trigger.setAttribute("aria-expanded", "false");
        };
        const open = () => {
            drawer.classList.add("open");
            overlay.classList.add("open");
            drawer.setAttribute("aria-hidden", "false");
            trigger.setAttribute("aria-expanded", "true");
        };

        trigger.addEventListener("click", () => drawer.classList.contains("open") ? close() : open());
        overlay.addEventListener("click", close);
        closeButton.addEventListener("click", close);
        themeButton.addEventListener("click", () => {
            if (window.Theme && typeof window.Theme.toggle === "function") window.Theme.toggle();
            else {
                const next = currentTheme() ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", next);
                try { localStorage.setItem("kesiswaan-theme", next); } catch (_) {}
            }
            syncTheme();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && drawer.classList.contains("open")) close();
        });
        syncTheme();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();