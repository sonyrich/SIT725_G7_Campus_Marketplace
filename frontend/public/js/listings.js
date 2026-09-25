// listings.js — owned by Sony
// FR-05: Browse/search/filter listings
// FR-09: Show Edit Listing option for the listing owner

const listingsGrid = document.getElementById('listings-grid');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

let currentController = null;


// Get logged-in user from localStorage
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


// Get logged-in user's ID
function getCurrentUserId() {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  return user._id || user.id || user.userId || null;
}


// Get seller ID from a listing
function getSellerId(listing) {
  if (!listing || !listing.seller) {
    return null;
  }

  if (typeof listing.seller === 'string') {
    return listing.seller;
  }

  return listing.seller._id || listing.seller.id || null;
}


// Build listing card
function buildCardEl(listing) {

  const article = document.createElement('article');
  article.className = 'listing-card';


  // Image / placeholder
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


  // Condition tag
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = listing.condition || '';

  article.appendChild(tag);


  // Card body
  const body = document.createElement('div');
  body.className = 'body';


  // Title
  const title = document.createElement('p');
  title.className = 'title';
  title.textContent = listing.title || '';

  body.appendChild(title);


  // Category
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = listing.category || '';

  body.appendChild(meta);


  // Price
  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = `$${Number(listing.price).toFixed(2)}`;

  body.appendChild(price);


  // ------------------------------------------------
  // FR-09 — Edit Listing
  // Only show Edit option to the listing owner
  // ------------------------------------------------

  const currentUserId = getCurrentUserId();
  const sellerId = getSellerId(listing);

  console.log('FR09 owner check:', {
    currentUserId,
    sellerId,
    matches:
      currentUserId &&
      sellerId &&
      String(currentUserId) === String(sellerId)
  });


  if (
    currentUserId &&
    sellerId &&
    String(currentUserId) === String(sellerId)
  ) {

    const editLink = document.createElement('a');

    editLink.href =
      `edit-listing.html?id=${encodeURIComponent(listing._id)}`;

    editLink.textContent = 'Edit listing';

    editLink.style.display = 'inline-block';
    editLink.style.marginTop = '10px';
    editLink.style.fontWeight = '600';
    editLink.style.color = '#2F6B4F';
    editLink.style.textDecoration = 'underline';
    editLink.style.cursor = 'pointer';

    body.appendChild(editLink);
  }


  article.appendChild(body);

  return article;
}


// Empty state
function showEmptyState() {

  if (listingsGrid) {
    listingsGrid.innerHTML = '';
  }

  if (emptyState) {
    emptyState.style.display = 'block';
  }

  if (errorState) {
    errorState.style.display = 'none';
  }
}


// Error state
function showErrorState() {

  if (listingsGrid) {
    listingsGrid.innerHTML = '';
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }

  if (errorState) {
    errorState.style.display = 'block';
  }
}


// Render listings
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

  listings.forEach((listing) => {

    listingsGrid.appendChild(
      buildCardEl(listing)
    );
  });
}


// Fetch listings
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


    const res = await fetch(
      `/api/listings?${params.toString()}`,
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


// Category filters
document
  .querySelectorAll('#category-filters button')
  .forEach(function (btn) {

    btn.addEventListener(
      'click',
      function () {

        document
          .querySelectorAll('#category-filters button')
          .forEach(function (b) {

            b.classList.remove('active');
          });


        btn.classList.add('active');


        fetchListings({

          category:
            btn.dataset.category,

          search:
            searchInput
              ? searchInput.value.trim()
              : ''
        });
      }
    );
  });


// Search button
if (searchBtn) {

  searchBtn.addEventListener(
    'click',
    function () {

      const activePill =
        document.querySelector(
          '#category-filters button.active'
        );


      fetchListings({

        category:
          activePill
            ? activePill.dataset.category
            : '',

        search:
          searchInput
            ? searchInput.value.trim()
            : ''
      });
    }
  );
}


// Search using Enter key
if (searchInput) {

  searchInput.addEventListener(
    'keydown',
    function (e) {

      if (e.key === 'Enter') {

        searchBtn.click();
      }
    }
  );
}


// Load listings when page opens
document.addEventListener(
  'DOMContentLoaded',
  function () {

    fetchListings();
  }
);