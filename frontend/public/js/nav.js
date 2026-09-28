// nav.js — shared navigation behaviour for every page (Krushal)
//
// Load it in <head> WITHOUT defer:  <script src="js/nav.js"></script>
// so the logged-in / logged-out state is applied before the page paints
// (no flash of the wrong links).
//
// 1. Sets <html data-auth="in|out"> — CSS hides [data-auth="in"] links when
//    logged out and [data-auth="out"] links when logged in.
// 2. Clears an expired JWT so the UI never shows "logged in" with a dead token.
// 3. Highlights the current page link (aria-current="page").
// 4. Mobile hamburger menu toggle (closes on Escape / link click).
// 5. Wires every [data-action="logout"] link to logoutUser() from logout.js.
// 6. Fills [data-user-name] with the logged-in user's first name.

(function () {
  'use strict';

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  // Returns true when the JWT's exp claim is in the past.
  function isTokenExpired(token) {
    try {
      const payloadPart = token.split('.')[1];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch (error) {
      return true; // unreadable token = treat as logged out
    }
  }

  function getAuthState() {
    let token = null;
    try {
      token = localStorage.getItem('token');
    } catch (error) {
      token = null;
    }

    if (token && isTokenExpired(token)) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) { /* storage unavailable */ }
      token = null;
    }

    return token ? 'in' : 'out';
  }

  // Runs immediately (script is in <head>) so CSS can hide the right links
  document.documentElement.setAttribute('data-auth', getAuthState());

  // Public helpers other scripts can reuse
  window.CampusAuth = {
    isLoggedIn: function () { return getAuthState() === 'in'; },
    getToken: function () {
      return getAuthState() === 'in' ? localStorage.getItem('token') : null;
    },
    getUser: function () { return readJson('user'); }
  };

  function markCurrentPage(nav) {
    const current = window.location.pathname.split('/').pop() || 'index.html';

    nav.querySelectorAll('a[href]').forEach(function (link) {
      const target = link.getAttribute('href').split('?')[0];
      if (target === current) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function setupMenuToggle(nav) {
    const toggle = document.querySelector('.nav-toggle');
    if (!toggle) {
      return;
    }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });
  }

  function setupLogout() {
    document.querySelectorAll('[data-action="logout"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();

        if (typeof window.logoutUser === 'function') {
          window.logoutUser();             // FR-03 (Surya) — js/logout.js
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
        }
      });
    });
  }

  function showUserName() {
    const user = readJson('user');
    const firstName = user && user.fullName ? user.fullName.trim().split(/\s+/)[0] : '';

    document.querySelectorAll('[data-user-name]').forEach(function (el) {
      el.textContent = firstName ? 'Hi, ' + firstName : '';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const nav = document.getElementById('primary-nav');

    if (nav) {
      markCurrentPage(nav);
      setupMenuToggle(nav);
    }

    setupLogout();
    showUserName();
  });
})();
