// document.addEventListener("DOMContentLoaded", function () {

//     const isSubpage = window.location.pathname.includes('/pages/');
//     const navbarPath = isSubpage ? '../components/navbar.html' : 'components/navbar.html';

//     fetch(navbarPath)
//         .then(response => response.text())
//         .then(data => {
        
//             const placeholder = document.getElementById("navbar-placeholder");
        
//             if (!placeholder) return;
        
//             placeholder.innerHTML = data;



//         const hamburger = document.getElementById("hamburger");
//         const navbar = document.getElementById("navbar");

//         if (hamburger) {
//             hamburger.addEventListener("click", function () {
//                 navbar.classList.toggle("active");
//             });
//         }


//         /* -------------------------------
//            CHECK LOGIN STATE
//         -------------------------------- */

//         const loggedIn = localStorage.getItem("pte_user_logged_in");

//         const authButtons = document.getElementById("auth-buttons");
//         const userProfile = document.getElementById("user-profile");

//         if (loggedIn && authButtons && userProfile) {

//             authButtons.style.display = "none";
//             userProfile.style.display = "flex";

//             const userName = localStorage.getItem("pte_user_name");
//             const userPhoto = localStorage.getItem("pte_user_photo");

//             const nameElement = document.getElementById("user-name");
//             const photoElement = document.getElementById("user-photo");

//             if (userName && nameElement) {
//                 nameElement.textContent = userName;
//             }

//             if (userPhoto && photoElement) {
//                 photoElement.src = userPhoto;
//             }

//         }


//         /* -------------------------------
//            PROFILE DROPDOWN
//         -------------------------------- */

//         if (userProfile) {

//             userProfile.addEventListener("click", function (e) {

//                 userProfile.classList.toggle("active");

//                 e.stopPropagation();

//             });

//         }

//         // Close dropdown when clicking outside
//         document.addEventListener("click", function () {

//             if (userProfile) {
//                 userProfile.classList.remove("active");
//             }

//         });


//         /* -------------------------------
//            LOGOUT FUNCTION
//         -------------------------------- */

//         const logoutBtn = document.getElementById("logout-btn");

//         if (logoutBtn) {

//             logoutBtn.addEventListener("click", function () {

//                 if (typeof firebaseLogout === "function") {

//                     firebaseLogout();

//                 } else {

//                     // fallback logout

//                     localStorage.removeItem("pte_user_logged_in");
//                     localStorage.removeItem("pte_user_name");
//                     localStorage.removeItem("pte_user_email");
//                     localStorage.removeItem("pte_user_photo");

//                     window.location.href = "/index.html";

//                 }

//             });

//         }

//     });

// });

document.addEventListener("DOMContentLoaded", function () {

    const isSubpage = window.location.pathname.includes('/pages/');
    const navbarPath = isSubpage ? '../components/navbar.html' : 'components/navbar.html';

    fetch(navbarPath)
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById("navbar-placeholder");
            if (!placeholder) return;
            placeholder.innerHTML = data;

            // ============================
            // ✅ FIX 1: HAMBURGER MENU
            // ============================
            const hamburger = document.getElementById("hamburger");
            const navbar = document.getElementById("navbar");

            if (hamburger && navbar) {
                hamburger.addEventListener("click", function (e) {
                    e.stopPropagation();
                    navbar.classList.toggle("active");
                    
                    // Toggle icon: bars ↔ times
                    const icon = hamburger.querySelector("i");
                    if (navbar.classList.contains("active")) {
                        icon.classList.replace("fa-bars", "fa-times");
                    } else {
                        icon.classList.replace("fa-times", "fa-bars");
                    }
                });
            }

            // ============================
            // ✅ FIX 2: CLOSE MENU ON LINK CLICK
            // ============================
            if (navbar) {
                const navLinks = navbar.querySelectorAll("a:not(.dropdown-toggle)");
                navLinks.forEach(link => {
                    link.addEventListener("click", function () {
                        if (window.innerWidth <= 768) {
                            navbar.classList.remove("active");
                            // Reset hamburger icon
                            if (hamburger) {
                                const icon = hamburger.querySelector("i");
                                if (icon && icon.classList.contains("fa-times")) {
                                    icon.classList.replace("fa-times", "fa-bars");
                                }
                            }
                        }
                    });
                });
            }

            // ============================
            // ✅ FIX 3: MOBILE DROPDOWN (Click-based Accordion)
            // ============================
            if (window.innerWidth <= 768) {
                const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
                dropdownToggles.forEach(toggle => {
                    toggle.addEventListener("click", function (e) {
                        e.preventDefault();
                        const parent = this.closest(".dropdown");
                        const menu = parent.querySelector(".dropdown-menu");
                        
                        // Close other open dropdowns
                        document.querySelectorAll(".dropdown.active").forEach(d => {
                            if (d !== parent) {
                                d.classList.remove("active");
                            }
                        });
                        
                        parent.classList.toggle("active");
                        
                        // Toggle chevron rotation
                        const chevron = this.querySelector(".fa-chevron-down");
                        if (chevron) {
                            chevron.style.transform = parent.classList.contains("active") 
                                ? "rotate(180deg)" 
                                : "rotate(0deg)";
                        }
                    });
                });
            }

            // ============================
            // CHECK LOGIN STATE
            // ============================
            const loggedIn = localStorage.getItem("pte_user_logged_in");
            const authButtons = document.getElementById("auth-buttons");
            const userProfile = document.getElementById("user-profile");

            if (loggedIn && authButtons && userProfile) {
                authButtons.style.display = "none";
                userProfile.style.display = "flex";

                const userName = localStorage.getItem("pte_user_name");
                const userPhoto = localStorage.getItem("pte_user_photo");
                const nameElement = document.getElementById("user-name");
                const photoElement = document.getElementById("user-photo");

                if (userName && nameElement) {
                    nameElement.textContent = userName;
                }
                if (userPhoto && photoElement) {
                    photoElement.src = userPhoto;
                }
            }

            // ============================
            // PROFILE DROPDOWN
            // ============================
            if (userProfile) {
                userProfile.addEventListener("click", function (e) {
                    this.classList.toggle("active");
                    e.stopPropagation();
                });
            }

            document.addEventListener("click", function () {
                if (userProfile) {
                    userProfile.classList.remove("active");
                }
            });

            // ============================
            // LOGOUT FUNCTION
            // ============================
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function () {
                    if (typeof firebaseLogout === "function") {
                        firebaseLogout();
                    } else {
                        localStorage.removeItem("pte_user_logged_in");
                        localStorage.removeItem("pte_user_name");
                        localStorage.removeItem("pte_user_email");
                        localStorage.removeItem("pte_user_photo");
                        window.location.href = "/index.html";
                    }
                });
            }

        });
});