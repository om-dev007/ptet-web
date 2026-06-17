(function () {
    var saved = localStorage.getItem("pte_theme");
    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

function initThemeToggle() {
    var toggle = document.getElementById("theme-toggle");
    if (!toggle || toggle.dataset.themeReady) return;
    toggle.dataset.themeReady = "1";

    toggle.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        if (current === "dark") {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("pte_theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("pte_theme", "dark");
        }
    });
}

var observer = new MutationObserver(function () {
    if (document.getElementById("theme-toggle")) {
        initThemeToggle();
        observer.disconnect();
    }
});

observer.observe(document.documentElement, { childList: true, subtree: true });