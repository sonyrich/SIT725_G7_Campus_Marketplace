// myListings.js — FR-11 My Listings Dashboard (Krushal)
//
// Shows every listing the logged-in user owns (available and sold) using
// GET /api/listings/mine, with summary stats, status tabs, sorting and
// per-listing actions:
//   Edit         -> edit-listing.html (FR-09, Surya)
//   Mark as sold -> PATCH  /api/listings/:id/status (FR-13, Sony)
//   Delete       -> DELETE /api/listings/:id        (FR-10, Aditya)
//
// All content is built with createElement/textContent (never innerHTML with
// user data) so listing titles can't inject HTML/JS.

(function () {
  'use strict';

  const API = '/api/listings';
  const LOGIN_URL = 'login.html?next=my-listings.html';

  const listEl = document.getElementById('my-listings');
  const emptyEl = document.getElementById('my-empty');
  const emptyTextEl = document.getElementById('my-empty-text');
  const errorEl = document.getElementById('my-error');
  const errorTextEl = document.getElementById('my-error-text');
  const retryBtn = document.getElementById('retry-btn');
  const alertEl = document.getElementById('dashboard-alert');
  const tabs = document.querySelectorAll('#status-tabs button');
  const sortSelect = document.getElementById('sort-select');
  const dialog = document.getElementById('confirm-dialog');

  const priceFormat = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
  const dateFormat = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  const state = {
    listings: [],
    status: 'all',
    sort: 'newest'
  };

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------

  function getToken() {
    if (window.CampusAuth) {
      return window.CampusAuth.getToken();
    }
    return localStorage.getItem('token');
  }

  function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = LOGIN_URL;
  }

  // Not logged in -> go to login, then come back here afterwards
  if (!getToken()) {
    window.location.replace(LOGIN_URL);
    return;
  }

  // ------------------------------------------------------------------
  // API helper — consistent error handling for every request
  // ------------------------------------------------------------------

  async function apiRequest(url, options) {
    const response = await fetch(url, Object.assign({}, options, {
      headers: Object.assign({ Authorization: 'Bearer ' + getToken() }, (options && options.headers) || {})
    }));

    if (response.status === 401) {
      redirectToLogin();
      throw new Error('Your session has expired. Please log in again.');
    }

    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    }

    if (!response.ok || !body || !body.success) {
      const error = new Error((body && body.message) || 'Request failed (' + response.status + ')');
      error.status = response.status;
      error.routeMissing = response.status === 404 && (!body || /route not found/i.test(body.message || ''));
      throw error;
    }

    return body;
  }

  // ------------------------------------------------------------------
  // Feedback
  // ------------------------------------------------------------------

  let alertTimer = null;

  function notify(message, type) {
    // Uses the shared toast component when it's on the page, otherwise the
    // inline status banner.
    if (window.showToast) {
      window.showToast(message, type);
      return;
    }

    alertEl.textContent = message;
    alertEl.className = 'dashboard-alert ' + (type === 'error' ? 'is-error' : 'is-success');
    alertEl.hidden = false;

    clearTimeout(alertTimer);
    alertTimer = setTimeout(function () { alertEl.hidden = true; }, 5000);
  }

  // Promise-based confirm using <dialog>, with a window.confirm fallback
  function confirmAction(title, message, confirmLabel, danger) {
    if (!dialog || typeof dialog.showModal !== 'function') {
      return Promise.resolve(window.confirm(message));
    }

    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = confirmLabel;
    okBtn.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');

    return new Promise(function (resolve) {
      dialog.addEventListener('close', function onClose() {
        dialog.removeEventListener('close', onClose);
        resolve(dialog.returnValue === 'confirm');
      });
      dialog.returnValue = 'cancel';
      dialog.showModal();
    });
  }

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function capitalise(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function renderStats(stats) {
    document.getElementById('stat-available').textContent = stats.available;
    document.getElementById('stat-sold').textContent = stats.sold;
    document.getElementById('stat-available-value').textContent = priceFormat.format(stats.availableValue);
    document.getElementById('stat-sold-value').textContent = priceFormat.format(stats.soldValue);

    document.querySelectorAll('[data-count]').forEach(function (countEl) {
      countEl.textContent = stats[countEl.dataset.count];
    });
  }

  function sortListings(listings) {
    const sorted = listings.slice();
    const byDate = function (l) { return new Date(l.createdAt).getTime(); };

    switch (state.sort) {
      case 'oldest': return sorted.sort(function (a, b) { return byDate(a) - byDate(b); });
      case 'price-high': return sorted.sort(function (a, b) { return b.price - a.price; });
      case 'price-low': return sorted.sort(function (a, b) { return a.price - b.price; });
      default: return sorted.sort(function (a, b) { return byDate(b) - byDate(a); });
    }
  }

  function buildRow(listing) {
    const isSold = listing.status === 'sold';
    const row = el('article', 'my-listing' + (isSold ? ' is-sold' : ''));
    row.dataset.id = listing._id;

    // Thumbnail
    const thumb = el('div', 'my-listing-thumb');
    if (listing.imageUrl) {
      const img = el('img');
      img.src = listing.imageUrl;
      img.alt = '';
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.textContent = 'No photo';
    }
    row.appendChild(thumb);

    // Details
    const info = el('div', 'my-listing-info');
    const titleRow = el('div', 'my-listing-title-row');
    titleRow.appendChild(el('h2', 'my-listing-title', listing.title));
    titleRow.appendChild(el('span', 'status-badge ' + (isSold ? 'is-sold' : 'is-available'), isSold ? 'Sold' : 'Available'));
    info.appendChild(titleRow);

    info.appendChild(el('p', 'my-listing-meta', capitalise(listing.category) + ' · ' + listing.condition));
    info.appendChild(el('p', 'my-listing-price', priceFormat.format(listing.price)));

    const listed = listing.createdAt ? 'Listed ' + dateFormat.format(new Date(listing.createdAt)) : '';
    const updated = listing.updatedAt && listing.updatedAt !== listing.createdAt
      ? ' · Updated ' + dateFormat.format(new Date(listing.updatedAt))
      : '';
    info.appendChild(el('p', 'my-listing-date', listed + updated));
    row.appendChild(info);

    // Actions
    const actions = el('div', 'my-listing-actions');

    const editLink = el('a', 'btn btn-secondary btn-sm', 'Edit');
    editLink.href = 'edit-listing.html?id=' + encodeURIComponent(listing._id) + '&return=my-listings.html';
    editLink.setAttribute('aria-label', 'Edit ' + listing.title);
    actions.appendChild(editLink);

    if (!isSold) {
      const soldBtn = el('button', 'btn btn-secondary btn-sm', 'Mark as sold');
      soldBtn.type = 'button';
      soldBtn.dataset.action = 'sold';
      soldBtn.setAttribute('aria-label', 'Mark ' + listing.title + ' as sold');
      actions.appendChild(soldBtn);
    }

    const deleteBtn = el('button', 'btn btn-ghost btn-sm danger', 'Delete');
    deleteBtn.type = 'button';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.setAttribute('aria-label', 'Delete ' + listing.title);
    actions.appendChild(deleteBtn);

    row.appendChild(actions);
    return row;
  }

  function render() {
    const visible = sortListings(
      state.status === 'all'
        ? state.listings
        : state.listings.filter(function (l) { return l.status === state.status; })
    );

    listEl.replaceChildren();
    listEl.removeAttribute('aria-busy');
    errorEl.hidden = true;

    if (visible.length === 0) {
      emptyTextEl.textContent = state.listings.length === 0
        ? "You haven't listed anything yet."
        : state.status === 'sold'
          ? "You haven't sold anything yet."
          : 'You have no available listings right now.';
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    visible.forEach(function (listing) {
      listEl.appendChild(buildRow(listing));
    });
  }

  function showError(message) {
    listEl.replaceChildren();
    listEl.removeAttribute('aria-busy');
    emptyEl.hidden = true;
    errorTextEl.textContent = message || "We couldn't load your listings. Check your connection and try again.";
    errorEl.hidden = false;
  }

  // ------------------------------------------------------------------
  // Data
  // ------------------------------------------------------------------

  async function loadListings() {
    try {
      const result = await apiRequest(API + '/mine');
      state.listings = result.data;
      renderStats(result.stats);
      render();
    } catch (error) {
      console.error('Load my listings error:', error);
      showError();
    }
  }

  function findListing(id) {
    return state.listings.find(function (l) { return String(l._id) === String(id); });
  }

  async function markAsSold(listing, button) {
    const ok = await confirmAction(
      'Mark as sold?',
      '"' + listing.title + '" will be hidden from buyers on the marketplace.',
      'Mark as sold',
      false
    );
    if (!ok) return;

    button.disabled = true;
    try {
      await apiRequest(API + '/' + encodeURIComponent(listing._id) + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' })
      });
      notify('"' + listing.title + '" marked as sold.', 'success');
      await loadListings();
    } catch (error) {
      button.disabled = false;
      notify(error.routeMissing ? 'Marking items as sold isn\'t available yet.' : error.message, 'error');
    }
  }

  async function deleteListing(listing, button) {
    const ok = await confirmAction(
      'Delete this listing?',
      '"' + listing.title + '" will be permanently removed. This can\'t be undone.',
      'Delete listing',
      true
    );
    if (!ok) return;

    button.disabled = true;
    try {
      await apiRequest(API + '/' + encodeURIComponent(listing._id), { method: 'DELETE' });
      notify('"' + listing.title + '" deleted.', 'success');
      await loadListings();
    } catch (error) {
      button.disabled = false;
      notify(error.routeMissing ? 'Deleting listings isn\'t available yet.' : error.message, 'error');
    }
  }

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------

  // One delegated listener for every row's action buttons
  listEl.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const listing = findListing(button.closest('.my-listing').dataset.id);
    if (!listing) return;

    if (button.dataset.action === 'sold') markAsSold(listing, button);
    if (button.dataset.action === 'delete') deleteListing(listing, button);
  });

  function setStatus(status) {
    state.status = status;
    tabs.forEach(function (tab) {
      tab.setAttribute('aria-pressed', String(tab.dataset.status === status));
    });
    // Remember the tab in the URL so refresh / back keeps it
    history.replaceState(null, '', status === 'all' ? 'my-listings.html' : '#' + status);
    render();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { setStatus(tab.dataset.status); });
  });

  sortSelect.addEventListener('change', function () {
    state.sort = sortSelect.value;
    render();
  });

  retryBtn.addEventListener('click', function () {
    errorEl.hidden = true;
    listEl.setAttribute('aria-busy', 'true');
    loadListings();
  });

  const initialStatus = window.location.hash.replace('#', '');
  if (initialStatus === 'available' || initialStatus === 'sold') {
    state.status = initialStatus;
    tabs.forEach(function (tab) {
      tab.setAttribute('aria-pressed', String(tab.dataset.status === initialStatus));
    });
  }

  loadListings();
})();
