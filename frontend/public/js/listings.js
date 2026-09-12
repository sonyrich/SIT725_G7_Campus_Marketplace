// listings.js — owned by Sony
// FR-05: fetches /api/listings and dynamically renders .listing-card elements
// TODO (once GET /api/listings is merged):
//   - fetch(`/api/listings?category=...&search=...`) and replace the
//     hard-coded .listing-card elements in #listings-grid with real data
//   - show #empty-state when the response array is empty
//   - wire #search-input + #search-btn to re-fetch with the query
const listingsGrid = document.getElementById('listings-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

function buildCardHTML(listing) {
    const imageSrc = listing.imageUrl || '';
    return `
        <article class="listing-card">
            <div class="thumb">
                ${imageSrc ? `<img src="${imageSrc}" alt="${listing.title}" style="width:100%;height:100%;object-fit:cover;" />` : 'Photo'}
            </div>
            <h3 class="listing-title">${listing.title}</h3>
            <p class="listing-price">$${Number(listing.price).toFixed(2)}</p>
            <p class="listing-category">${listing.category}</p>
        </article>
    `;
}

function renderListings(listings) {
    if (!listingsGrid) return;

    if (!listings || listings.length === 0) {
        listingsGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    listingsGrid.innerHTML = listings.map(buildCardHTML).join('');
}

async function fetchListings({ category = '', search = '' } = {}) {
    try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);

        const res = await fetch(`/api/listings?${params.toString()}`);
        const result = await res.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch listings');
        }

        renderListings(result.data);
    } catch (err) {
        console.error('Error fetching listings:', err);
        if (listingsGrid) listingsGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }
}

// Existing category pill styling, extended to trigger a real fetch
document.querySelectorAll('#category-filters button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#category-filters button').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    fetchListings({ category: btn.dataset.category, search: searchInput ? searchInput.value.trim() : '' });
  });
});

if (searchBtn) {
    searchBtn.addEventListener('click', function () {
        const activePill = document.querySelector('#category-filters button.active');
        fetchListings({
            category: activePill ? activePill.dataset.category : '',
            search: searchInput ? searchInput.value.trim() : ''
        });
    });
}

if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') searchBtn.click();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchListings();
});
