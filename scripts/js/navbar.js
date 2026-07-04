import { AuthManager } from '../../context/AuthContext.js';

document.addEventListener("DOMContentLoaded", function () {
    fetch("../components/navbar.html")
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("navbar-placeholder");
            if (!placeholder) return;
            placeholder.innerHTML = data;

            // Existing toggle logic
            const hamburger = document.getElementById("hamburger");
            const navbar = document.getElementById("navbar");
            if (hamburger) {
                hamburger.addEventListener("click", () => navbar.classList.toggle("active"));
            }

            /* -------------------------------
               INTEGRATE AUTH MANAGER
            -------------------------------- */
            
            const authButtons = document.getElementById("auth-buttons");
            const userProfile = document.getElementById("user-profile");
            const nameElement = document.getElementById("user-name");
            const photoElement = document.getElementById("user-photo");

            function updateNavbarUI(user) {
                if (user && authButtons && userProfile) {
                    authButtons.style.display = "none";
                    userProfile.style.display = "flex";
                    if (nameElement) nameElement.textContent = user.name;
                    if (photoElement) photoElement.src = user.photo || "";
                } else if (authButtons && userProfile) {
                    authButtons.style.display = "flex";
                    userProfile.style.display = "none";
                }
            }

            // Subscribe to AuthManager changes
            AuthManager.subscribe(updateNavbarUI);

            // Initial UI state
            updateNavbarUI(AuthManager.user);

            /* -------------------------------
               PROFILE DROPDOWN & LOGOUT
            -------------------------------- */

            if (userProfile) {
                userProfile.addEventListener("click", function (e) {
                    userProfile.classList.toggle("active");
                    e.stopPropagation();
                });
            }

            document.addEventListener("click", () => {
                if (userProfile) userProfile.classList.remove("active");
            });

            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function () {
                    // Just call the logout method from AuthManager
                    AuthManager.logout();
                    if (typeof firebaseLogout === "function") {
                        firebaseLogout();
                    } else {
                        window.location.href = "/index.html";
                    }
                });
            }
        });
});