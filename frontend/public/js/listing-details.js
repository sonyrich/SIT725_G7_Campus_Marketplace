const loading = document.getElementById('listing-loading');
const error = document.getElementById('listing-error');
const details = document.getElementById('listing-details');

const image = document.getElementById('listing-image');
const condition = document.getElementById('listing-condition');
const title = document.getElementById('listing-title');
const price = document.getElementById('listing-price');
const category = document.getElementById('listing-category');
const description = document.getElementById('listing-description');
const seller = document.getElementById('listing-seller');
const contactButton = document.getElementById('contact-seller-btn');

const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

async function loadListing() {
  if (!listingId) {
    showError();
    return;
  }

  try {
    const response = await fetch(
      `/api/listings/${encodeURIComponent(listingId)}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || 'Unable to load listing.'
      );
    }

    renderListing(result.data);

  } catch (err) {
    console.error('Error loading listing:', err);
    showError();
  }
}

function renderListing(listing) {
  loading.style.display = 'none';
  error.style.display = 'none';
  details.style.display = 'grid';

  title.textContent = listing.title || '';
  condition.textContent = listing.condition || '';
  category.textContent = listing.category || '';
  description.textContent = listing.description || '';

  price.textContent =
    `$${Number(listing.price).toFixed(2)}`;

  if (listing.imageUrl) {
    image.src = listing.imageUrl;
    image.alt = listing.title || 'Listing image';
    image.style.display = 'block';
  } else {
    image.style.display = 'none';
  }

  seller.textContent = listing.seller || 'Student seller';

  contactButton.addEventListener('click', function () {
    alert('Seller contact details will be available here.');
  });
}

function showError() {
  loading.style.display = 'none';
  details.style.display = 'none';
  error.style.display = 'block';
}

document.addEventListener(
  'DOMContentLoaded',
  loadListing
);