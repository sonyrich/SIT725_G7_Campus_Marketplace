// listings.js
// FR-05: Browse/search/filter listings
// FR-08: View Item Details
// FR-09: Show Edit Listing option for the listing owner
// FR-13: Mark Item as Sold
// FR-14: Show Report Listing option for listings

const listingsGrid = document.getElementById('listings-grid');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Backend API
const API_BASE = 'http://localhost:3000';

let currentController = null;


// ======================================================
// GET CURRENT USER
// ======================================================

function getCurrentUser() {
    try {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser);

    } catch (error) {
        console.error('Could not read logged-in user:', error);
        return null;
    }
}


// ======================================================
// GET CURRENT USER ID
// ======================================================

function getCurrentUserId() {
    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return user._id || user.id || user.userId || null;
}


// ======================================================
// GET SELLER ID
// ======================================================

function getSellerId(listing) {
    if (!listing || !listing.seller) {
        return null;
    }

    if (typeof listing.seller === 'string') {
        return listing.seller;
    }

    return listing.seller._id || listing.seller.id || null;
}


// ======================================================
// BUILD LISTING CARD
// ======================================================

function buildCardEl(listing) {

    const article = document.createElement('article');
    article.className = 'listing-card';

    // FR-08 — Clicking the listing opens the details page.
    article.setAttribute('role', 'link');
    article.setAttribute('tabindex', '0');

    article.setAttribute(
        'aria-label',
        `View details for ${listing.title || 'listing'}`
    );

    const detailsUrl =
        `listing-details.html?id=${encodeURIComponent(listing._id)}`;


    // ==================================================
    // FR-08 — OPEN LISTING DETAILS
    // ==================================================

    article.addEventListener('click', function (event) {

        // Do not navigate when clicking an action button/link.
        if (event.target.closest('.card-actions')) {
            return;
        }

        window.location.href = detailsUrl;
    });


    article.addEventListener('keydown', function (event) {

        if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {

            if (event.target.closest('.card-actions')) {
                return;
            }

            event.preventDefault();

            window.location.href = detailsUrl;
        }
    });


    // ==================================================
    // IMAGE / PLACEHOLDER
    // ==================================================

    const thumb = document.createElement('div');
    thumb.className = 'thumb';

    if (listing.imageUrl) {

        const img = document.createElement('img');

        // Support both absolute and backend-relative image URLs.
        if (
            listing.imageUrl.startsWith('http://') ||
            listing.imageUrl.startsWith('https://')
        ) {
            img.src = listing.imageUrl;
        } else {
            img.src = `${API_BASE}${listing.imageUrl}`;
        }

        img.alt = listing.title || 'Listing image';

        // If an image cannot load, show a simple placeholder.
        img.onerror = function () {
            img.remove();
            thumb.textContent = 'Photo';
        };

        thumb.appendChild(img);

    } else {

        thumb.textContent = 'Photo';
    }

    article.appendChild(thumb);


    // ==================================================
    // CONDITION
    // ==================================================

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = listing.condition || '';

    article.appendChild(tag);


    // ==================================================
    // CARD BODY
    // ==================================================

    const body = document.createElement('div');
    body.className = 'body';


    // ==================================================
    // TITLE
    // ==================================================

    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = listing.title || '';

    body.appendChild(title);


    // ==================================================
    // CATEGORY
    // ==================================================

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = listing.category || '';

    body.appendChild(meta);


    // ==================================================
    // PRICE
    // ==================================================

    const price = document.createElement('p');
    price.className = 'price';

    const numericPrice = Number(listing.price);

    price.textContent = Number.isFinite(numericPrice)
        ? `$${numericPrice.toFixed(2)}`
        : '$0.00';

    body.appendChild(price);


    // ==================================================
    // ACTION BUTTONS
    // ==================================================

    const actions = document.createElement('div');
    actions.className = 'card-actions';


    // ==================================================
    // FR-09 — EDIT LISTING
    // ==================================================

    const currentUserId = getCurrentUserId();
    const sellerId = getSellerId(listing);

    if (
        currentUserId &&
        sellerId &&
        String(currentUserId) === String(sellerId)
    ) {

        const editLink = document.createElement('a');

        editLink.href =
            `edit-listing.html?id=${encodeURIComponent(listing._id)}`;

        editLink.textContent = 'Edit listing';
        editLink.className = 'btn btn-secondary btn-sm';

        editLink.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        actions.appendChild(editLink);


        // ==================================================
        // FR-13 — MARK ITEM AS SOLD
        // ==================================================

        if (listing.status !== 'sold') {

            const soldBtn = document.createElement('button');

            soldBtn.textContent = 'Mark as Sold';
            soldBtn.type = 'button';
            soldBtn.className = 'btn btn-danger btn-sm';

            soldBtn.addEventListener('click', async function (event) {

                event.stopPropagation();

                const confirmed = window.confirm(
                    'Mark this listing as sold? It will no longer be visible to buyers.'
                );

                if (!confirmed) {
                    return;
                }

                const token = localStorage.getItem('token');

                try {

                    const res = await fetch(
                        `${API_BASE}/api/listings/${listing._id}/status`,
                        {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    const data = await res.json();

                    if (!res.ok || !data.success) {
                        throw new Error(
                            data.message ||
                            'Failed to mark listing as sold.'
                        );
                    }

                    fetchListings({
                        category: getActiveCategory(),
                        search: getCurrentSearch()
                    });

                } catch (error) {

                    console.error(
                        'Mark as sold error:',
                        error
                    );

                    alert(error.message);
                }
            });

            actions.appendChild(soldBtn);

        } else {

            const soldBadge = document.createElement('span');

            soldBadge.textContent = 'SOLD';
            soldBadge.className = 'sold-badge';

            actions.appendChild(soldBadge);
        }
    }


    // ==================================================
    // FR-14 — REPORT LISTING
    // ==================================================

    const reportLink = document.createElement('a');

    reportLink.href =
        `report-listing.html?id=${encodeURIComponent(listing._id)}`;

    reportLink.textContent = 'Report listing';
    reportLink.className = 'btn-link danger';

    reportLink.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    actions.appendChild(reportLink);

    body.appendChild(actions);

    article.appendChild(body);

    return article;
}


// ======================================================
// ACTIVE SEARCH / CATEGORY
// ======================================================

function getCurrentSearch() {

    return searchInput
        ? searchInput.value.trim()
        : '';
}


function getActiveCategory() {

    const activeButton = document.querySelector(
        '#category-filters button.active'
    );

    return activeButton
        ? activeButton.dataset.category
        : 'all';
}


// ======================================================
// EMPTY STATE
// ======================================================

function showEmptyState() {

    if (listingsGrid) {
        listingsGrid.removeAttribute('aria-busy');
        listingsGrid.innerHTML = '';
    }

    if (emptyState) {
        emptyState.style.display = 'block';
    }

    if (errorState) {
        errorState.style.display = 'none';
    }
}


// ======================================================
// ERROR STATE
// ======================================================

function showErrorState() {

    if (listingsGrid) {
        listingsGrid.removeAttribute('aria-busy');
        listingsGrid.innerHTML = '';
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    if (errorState) {
        errorState.style.display = 'block';
    }
}


// ======================================================
// RENDER LISTINGS
// ======================================================

function renderListings(listings) {

    if (!listingsGrid) {
        return;
    }

    if (!listings || listings.length === 0) {
        showEmptyState();
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    if (errorState) {
        errorState.style.display = 'none';
    }

    listingsGrid.innerHTML = '';
    listingsGrid.removeAttribute('aria-busy');

    listings.forEach(function (listing) {

        listingsGrid.appendChild(
            buildCardEl(listing)
        );
    });
}


// ======================================================
// FETCH LISTINGS
// ======================================================

async function fetchListings({
    category = '',
    search = ''
} = {}) {

    if (currentController) {
        currentController.abort();
    }

    currentController = new AbortController();

    const { signal } = currentController;

    try {

        const params = new URLSearchParams();

        if (
            category &&
            category !== 'all'
        ) {
            params.append(
                'category',
                category
            );
        }

        if (search) {
            params.append(
                'search',
                search
            );
        }

        const queryString = params.toString();


        // IMPORTANT:
        // Frontend runs on port 5501.
        // Backend runs on port 3000.
        const url = queryString
            ? `${API_BASE}/api/listings?${queryString}`
            : `${API_BASE}/api/listings`;


        console.log('Fetching listings from:', url);


        const res = await fetch(
            url,
            {
                signal
            }
        );


        if (!res.ok) {
            throw new Error(
                `Request failed with status ${res.status}`
            );
        }


        const result = await res.json();


        console.log('Listings API response:', result);


        if (!result.success) {
            throw new Error(
                result.message ||
                'Failed to fetch listings'
            );
        }


        renderListings(result.data);

    } catch (err) {

        if (err.name === 'AbortError') {
            return;
        }

        console.error(
            'Error fetching listings:',
            err
        );

        showErrorState();
    }
}


// ======================================================
// CATEGORY FILTERS
// ======================================================

document
    .querySelectorAll('#category-filters button')
    .forEach(function (btn) {

        btn.addEventListener(
            'click',
            function () {

                document
                    .querySelectorAll('#category-filters button')
                    .forEach(function (button) {

                        button.classList.remove('active');
                    });


                btn.classList.add('active');


                fetchListings({
                    category: btn.dataset.category || 'all',
                    search: getCurrentSearch()
                });
            }
        );
    });


// ======================================================
// SEARCH BUTTON
// ======================================================

if (searchBtn) {

    searchBtn.addEventListener(
        'click',
        function () {

            fetchListings({
                category: getActiveCategory(),
                search: getCurrentSearch()
            });
        }
    );
}


// ======================================================
// SEARCH WHILE TYPING
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        'input',
        function () {

            fetchListings({
                category: getActiveCategory(),
                search: getCurrentSearch()
            });
        }
    );


    searchInput.addEventListener(
        'keydown',
        function (event) {

            if (event.key === 'Enter') {

                event.preventDefault();

                fetchListings({
                    category: getActiveCategory(),
                    search: getCurrentSearch()
                });
            }
        }
    );
}


// ======================================================
// LOAD LISTINGS WHEN PAGE OPENS
// ======================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        fetchListings();
    }
);