// ======================================================
// CAMPUS MARKETPLACE - LISTINGS
// Sprint 2 - Search and Category Filtering
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-btn");
    const categoryFilters = document.getElementById("category-filters");
    const listingsGrid = document.getElementById("listings-grid");
    const emptyState = document.getElementById("empty-state");

    if (!listingsGrid) {
        return;
    }

    const listingCards = Array.from(
        listingsGrid.querySelectorAll(".listing-card-link")
    );

    let selectedCategory = "all";

    function filterListings() {

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        let visibleCount = 0;

        listingCards.forEach(function (card) {

            const titleElement = card.querySelector(".title");
            const metaElement = card.querySelector(".meta");

            const title = titleElement
                ? titleElement.textContent.toLowerCase()
                : "";

            const meta = metaElement
                ? metaElement.textContent.toLowerCase()
                : "";

            const category =
                card.dataset.category
                    ? card.dataset.category.toLowerCase()
                    : "";

            const matchesSearch =
                searchTerm === "" ||
                title.includes(searchTerm) ||
                meta.includes(searchTerm);

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (emptyState) {
            emptyState.style.display =
                visibleCount === 0 ? "block" : "none";
        }
    }


    // ======================================================
    // SEARCH BUTTON
    // ======================================================

    if (searchButton) {
        searchButton.addEventListener("click", function () {
            filterListings();
        });
    }


    // ======================================================
    // SEARCH WHILE TYPING
    // ======================================================

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterListings();
        });

        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                filterListings();
            }
        });
    }


    // ======================================================
    // CATEGORY FILTERS
    // ======================================================

    if (categoryFilters) {

        const categoryButtons =
            categoryFilters.querySelectorAll("button");

        categoryButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                categoryButtons.forEach(function (btn) {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                selectedCategory =
                    button.dataset.category || "all";

                filterListings();
            });
        });
    }


    // Show all listings when page first loads
    filterListings();
});