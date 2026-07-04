// context/AuthContext.js
export const AuthManager = {
    // Helper to update the state and localStorage simultaneously
    updateState(user) {
        if (user) {
            localStorage.setItem("pte_user_data", JSON.stringify(user));
        } else {
            localStorage.removeItem("pte_user_data");
        }
        this.notify(user);
    },

    listeners: [],
    subscribe(callback) {
        this.listeners.push(callback);
    },
    notify(user) {
        this.listeners.forEach(callback => callback(user));
    }
};

// Add this line to expose AuthManager to the browser's global scope
window.AuthManager = AuthManager;