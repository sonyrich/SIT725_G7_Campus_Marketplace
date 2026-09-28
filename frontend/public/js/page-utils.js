// page-utils.js
// Sprint 2 - Tanvi
// Dynamic page titles for Campus Marketplace.

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    const pageTitles = {
        home: "Campus Marketplace | Home",
        login: "Campus Marketplace | Login",
        register: "Campus Marketplace | Sign Up",
        create: "Campus Marketplace | Create Listing",
        details: "Campus Marketplace | Listing Details"
    };

    if (page && pageTitles[page]) {
        document.title = pageTitles[page];
    }
});