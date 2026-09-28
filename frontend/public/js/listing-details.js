// listing-details.js
// FR-08: View Item Details Page
// Sprint 2 - Tanvi

const sampleListings = {
    "1": {
        title: "Intro to Algorithms (4th ed.)",
        category: "Textbooks",
        campus: "Burwood campus",
        price: 45,
        condition: "Like New",
        description:
            "Introduction to Algorithms textbook in good condition. " +
            "Suitable for university students studying computer science " +
            "and information technology.",
        seller: "Student seller"
    },

    "2": {
        title: "Mini fridge — barely used",
        category: "Electronics",
        campus: "Geelong campus",
        price: 60,
        condition: "Good",
        description:
            "Compact mini fridge that has been lightly used and is " +
            "suitable for a student room.",
        seller: "Student seller"
    },

    "3": {
        title: "Study desk lamp",
        category: "Furniture",
        campus: "Burwood campus",
        price: 8,
        condition: "Fair",
        description:
            "A simple desk lamp suitable for a university study area.",
        seller: "Student seller"
    },

    "4": {
        title: "Commuter bike, size M",
        category: "Bikes",
        campus: "Waurn Ponds campus",
        price: 120,
        condition: "Good",
        description:
            "Commuter bike suitable for travelling around campus " +
            "and nearby areas.",
        seller: "Student seller"
    }
};

function loadListingDetails() {
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get("id");

    const listing = sampleListings[listingId];

    const detailsContainer =
        document.getElementById("listing-details");

    const errorMessage =
        document.getElementById("listing-error");

    if (!listing) {
        detailsContainer.style.display = "none";
        errorMessage.style.display = "block";
        return;
    }

    document.getElementById("listing-title").textContent =
        listing.title;

    document.getElementById("listing-category").textContent =
        `${listing.category} · ${listing.campus}`;

    document.getElementById("listing-price").textContent =
        `$${listing.price}`;

    document.getElementById("listing-condition").textContent =
        listing.condition;

    document.getElementById("listing-description").textContent =
        listing.description;

    document.getElementById("listing-seller").textContent =
        listing.seller;

    const contactButton =
        document.getElementById("contact-seller-btn");

    contactButton.addEventListener("click", function () {
        alert("Seller contact functionality will be available soon.");
    });
}

document.addEventListener(
    "DOMContentLoaded",
    loadListingDetails
);