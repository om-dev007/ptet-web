import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPasCzGfOA9pLMovpLxnQuqtfuVhXPti8",
  authDomain: "pte-hub-e94df.firebaseapp.com",
  projectId: "pte-hub-e94df",
  storageBucket: "pte-hub-e94df.appspot.com",
  messagingSenderId: "555571204435",
  appId: "1:555571204435:web:d9b972c2cdc3caf25f91a6",
  measurementId: "G-HX2PK85GGT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* -----------------------------
   DETECT LOGIN STATE
----------------------------- */

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("User logged in:", user.email);

        localStorage.setItem("pte_user_logged_in", "true");
        localStorage.setItem("pte_user_name", user.displayName || "User");
        localStorage.setItem("pte_user_email", user.email || "");
        localStorage.setItem("pte_user_photo", user.photoURL || "");

        /* update navbar immediately if it exists */

        const authButtons = document.getElementById("auth-buttons");
        const userProfile = document.getElementById("user-profile");

        if (authButtons && userProfile) {

            authButtons.style.display = "none";
            userProfile.style.display = "flex";

            const name = document.getElementById("user-name");
            const photo = document.getElementById("user-photo");

            if (name) name.textContent = user.displayName || "User";
            if (photo) photo.src = user.photoURL || "";

        }

    } else {

        console.log("User logged out");

        localStorage.removeItem("pte_user_logged_in");
        localStorage.removeItem("pte_user_name");
        localStorage.removeItem("pte_user_email");
        localStorage.removeItem("pte_user_photo");

    }

});


/* -----------------------------
   LOGIN PROVIDERS
----------------------------- */

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();


/* GOOGLE LOGIN */

const googleBtn = document.querySelector(".google-login");

if (googleBtn) {

    googleBtn.addEventListener("click", () => {

        signInWithPopup(auth, googleProvider)
            .then(() => {

                window.location.href = "../index.html";

            })
            .catch((error) => {
                console.error("Google login error:", error);
            });

    });

}


/* GITHUB LOGIN */

const githubBtn = document.querySelector(".github-login");

if (githubBtn) {

    githubBtn.addEventListener("click", () => {

        signInWithPopup(auth, githubProvider)
            .then(() => {

                window.location.href = "../index.html";

            })
            .catch((error) => {
                console.error("GitHub login error:", error);
            });

    });

}


/* -----------------------------
   FIREBASE LOGOUT
----------------------------- */

window.firebaseLogout = function () {

    signOut(auth)
        .then(() => {

            console.log("User signed out");

            localStorage.removeItem("pte_user_logged_in");
            localStorage.removeItem("pte_user_name");
            localStorage.removeItem("pte_user_email");
            localStorage.removeItem("pte_user_photo");

            window.location.href = "/index.html";

        })
        .catch((error) => {
            console.error("Logout error:", error);
        });

};


/* -----------------------------
   EMAIL/PASSWORD AUTHENTICATION
----------------------------- */

function handleAuthError(error) {
    console.error("Auth error:", error);
    let message = "An authentication error occurred. Please try again.";
    
    switch (error.code) {
        case "auth/invalid-email":
            message = "The email address is invalid.";
            break;
        case "auth/user-disabled":
            message = "This user account has been disabled.";
            break;
        case "auth/user-not-found":
            message = "No user found with this email.";
            break;
        case "auth/wrong-password":
            message = "Incorrect password. Please try again.";
            break;
        case "auth/email-already-in-use":
            message = "An account with this email already exists.";
            break;
        case "auth/weak-password":
            message = "The password is too weak. Must be at least 6 characters.";
            break;
        case "auth/network-request-failed":
            message = "Network error. Please check your connection.";
            break;
    }
    alert(message);
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;
        const confirm = document.getElementById("regConfirm").value;

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            alert("Passwords do not match.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return updateProfile(user, {
                    displayName: name
                }).then(() => {
                    localStorage.setItem("pte_user_logged_in", "true");
                    localStorage.setItem("pte_user_name", name);
                    localStorage.setItem("pte_user_email", email);
                    window.location.href = "../index.html";
                });
            })
            .catch(handleAuthError);
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem("pte_user_logged_in", "true");
                localStorage.setItem("pte_user_name", user.displayName || "User");
                localStorage.setItem("pte_user_email", user.email);
                window.location.href = "../index.html";
            })
            .catch(handleAuthError);
    });
}

// FORGOT PASSWORD
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById("loginEmail");
        const email = emailInput ? emailInput.value.trim() : "";
        
        if (!email) {
            alert("Please enter your email address first to reset your password.");
            return;
        }
        
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Password reset email sent! Please check your inbox.");
            })
            .catch(handleAuthError);
    });
}

// TOGGLE PASSWORD FIELDS
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", function () {
    const input = this.previousElementSibling;

    if (input.type === "password") {
      input.type = "text";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
    }
  });
});