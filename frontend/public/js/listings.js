// listings.js — owned by Sony
// FR-05: fetches /api/listings and dynamically renders .listing-card elements
// Cards are built with DOM APIs (not innerHTML) so listing data from the
// database can never be interpreted as markup, regardless of content.

const listingsGrid = document.getElementById('listings-grid');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

function buildCardEl(listing) {
    const article = document.createElement('article');
    article.className = 'listing-card';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (listing.imageUrl) {
        const img = document.createElement('img');
        img.src = listing.imageUrl;
        img.alt = listing.title || '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        thumb.appendChild(img);
    } else {
        thumb.textContent = 'Photo';
    }
    article.appendChild(thumb);

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = listing.condition || '';
    article.appendChild(tag);

    const body = document.createElement('div');
    body.className = 'body';

    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = listing.title || '';
    body.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = listing.category || '';
    body.appendChild(meta);

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${Number(listing.price).toFixed(2)}`;
    body.appendChild(price);

    article.appendChild(body);
    return article;
}

function showEmptyState() {
    if (listingsGrid) listingsGrid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
}

function showErrorState() {
    if (listingsGrid) listingsGrid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'none';
    if (errorState) errorState.style.display = 'block';
}

function renderListings(listings) {
    if (!listingsGrid) return;

    if (!listings || listings.length === 0) {
        showEmptyState();
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    listingsGrid.innerHTML = '';
    listings.forEach((listing) => listingsGrid.appendChild(buildCardEl(listing)));
}

async function fetchListings({ category = '', search = '' } = {}) {
    try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);

        // Relative URL — frontend and backend are served from the same
        // Express app (see server.js static serving), so no host/port needed.
        const res = await fetch(`/api/listings?${params.toString()}`);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const result = await res.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch listings');
        }

        renderListings(result.data);
    } catch (err) {
        console.error('Error fetching listings:', err);
        showErrorState();
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
