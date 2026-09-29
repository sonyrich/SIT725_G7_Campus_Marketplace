// FR-03 - Logout Functionality

function logoutUser() {
    // Remove authentication data from browser storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Send the user back to the login page
    window.location.href = "login.html";
}

// Make logoutUser available to HTML buttons/links
window.logoutUser = logoutUser;