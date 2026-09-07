// createListing.js — owned by Krushal
// Static phase: basic client-side handling only.
// TODO (once Jayadhwaj's POST /api/listings is merged):
//   - build a FormData from the form (title, description, price, category, condition, image)
//   - send with fetch, Authorization: Bearer <token> from localStorage
//   - redirect to index.html (or the new listing's detail page) on success
//   - show field-level errors from the API response on failure

document.getElementById('create-listing-form').addEventListener('submit', function (e) {
  e.preventDefault();
  // Placeholder until the Create Listing API exists.
  alert('Listing form looks good — hooking this up to the API is next once it\'s ready.');
});
