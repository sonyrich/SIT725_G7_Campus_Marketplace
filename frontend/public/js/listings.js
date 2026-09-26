// listings.js — owned by Sony
// FR-05: fetches /api/listings and dynamically renders .listing-card elements
// FR-14: adds Report Listing access for each listing

const listingsGrid = document.getElementById('listings-grid');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

let currentController = null;


function buildCardEl(listing) {
  const article = document.createElement('article');
  article.className = 'listing-card';


  // Listing image
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


  // Listing body
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
  // FR-14 Report Listing
  // ------------------------------------------------

  const reportLink = document.createElement('a');

  reportLink.href =
    `report-listing.html?id=${encodeURIComponent(listing._id)}`;

  reportLink.textContent = 'Report listing';

  reportLink.style.display = 'inline-block';
  reportLink.style.marginTop = '8px';
  reportLink.style.fontSize = '13px';
  reportLink.style.color = '#A23B2E';
  reportLink.style.textDecoration = 'underline';
  reportLink.style.cursor = 'pointer';

  body.appendChild(reportLink);


  article.appendChild(body);

  return article;
}


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
          category: btn.dataset.category,

          search: searchInput
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
        category: activePill
          ? activePill.dataset.category
          : '',

        search: searchInput
          ? searchInput.value.trim()
          : ''
      });
    }
  );
}


// Search with Enter key
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


// Initial page load
document.addEventListener(
  'DOMContentLoaded',
  function () {
    fetchListings();
  }
);