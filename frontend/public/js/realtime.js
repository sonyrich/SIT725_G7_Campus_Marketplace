// realtime.js — live updates with Socket.IO (Krushal)
//
// Needs <script src="/socket.io/socket.io.js"></script> before this file
// (served automatically by the backend). If Socket.IO can't connect, the site
// keeps working normally, just without live updates.
//
// - Shows "N students online" in the footer ([data-online-count])
// - Shows a "Live" badge ([data-live-indicator]) while connected
// - Re-dispatches server events as a browser event, so any page script can do:
//     window.addEventListener('listing:changed', (e) => { ... e.detail ... })
// - Homepage: refreshes the listing grid (keeping the active search/filter)
//   and shows a toast when someone posts or sells an item

(function () {
  'use strict';

  if (typeof window.io !== 'function') {
    return; // Socket.IO client not loaded — live updates simply stay off
  }

  const socket = window.io({ transports: ['websocket', 'polling'] });

  function setLive(connected) {
    document.querySelectorAll('[data-live-indicator]').forEach(function (el) {
      el.hidden = !connected;
    });
    if (!connected) {
      document.querySelectorAll('[data-online-count]').forEach(function (el) { el.hidden = true; });
    }
  }

  socket.on('connect', function () { setLive(true); });
  socket.on('disconnect', function () { setLive(false); });

  socket.on('presence:count', function (count) {
    document.querySelectorAll('[data-online-count]').forEach(function (el) {
      el.textContent = count + (count === 1 ? ' student online' : ' students online');
      el.hidden = false;
    });
  });

  // Several changes can arrive together (e.g. seeding) — refresh once
  let refreshTimer = null;

  function refreshHomepageGrid() {
    const searchBtn = document.getElementById('search-btn');
    if (!searchBtn || !document.getElementById('listings-grid')) {
      return;
    }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      searchBtn.click(); // re-runs GET /api/listings with the current search + category
    }, 300);
  }

  const toastText = {
    created: 'A new listing was just posted.',
    sold: 'An item was just sold.'
  };

  socket.on('listing:changed', function (change) {
    window.dispatchEvent(new CustomEvent('listing:changed', { detail: change }));

    if (document.getElementById('listings-grid')) {
      refreshHomepageGrid();
      if (toastText[change.action] && window.showToast) {
        window.showToast(toastText[change.action]);
      }
    }
  });

  window.CampusRealtime = { socket: socket };
})();
