// listings.js — owned by Sony
// Static phase: only handles the category filter pill styling.
// TODO (once GET /api/listings is merged):
//   - fetch(`/api/listings?category=...&search=...`) and replace the
//     hard-coded .listing-card elements in #listings-grid with real data
//   - show #empty-state when the response array is empty
//   - wire #search-input + #search-btn to re-fetch with the query

document.querySelectorAll('#category-filters button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#category-filters button').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    // Real filtering happens here once the API is wired.
  });
});
