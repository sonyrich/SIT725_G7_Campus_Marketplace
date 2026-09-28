// toast.js — small, accessible toast notifications (Krushal)
//
//   showToast('Listing published!');            // success (default)
//   showToast('Could not save', 'error');       // error
//   showToast.flash('Saved!');                  // show on the NEXT page load
//
// Replaces blocking alert() pop-ups. Messages are announced to screen
// readers through an aria-live region and disappear after a few seconds.

(function () {
  'use strict';

  const FLASH_KEY = 'campusToastFlash';
  const DURATION_MS = 4500;
  let region = null;

  function getRegion() {
    if (region && document.body.contains(region)) {
      return region;
    }
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
    return region;
  }

  function dismiss(toast) {
    if (!toast.isConnected || toast.classList.contains('is-leaving')) {
      return;
    }
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', function () { toast.remove(); }, { once: true });
    // Fallback if animations are disabled (reduced motion)
    setTimeout(function () { toast.remove(); }, 400);
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' is-error' : '');

    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = message;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.textContent = '×';
    close.addEventListener('click', function () { dismiss(toast); });

    toast.appendChild(text);
    toast.appendChild(close);
    getRegion().appendChild(toast);

    // Errors stay a little longer so they can be read
    setTimeout(function () { dismiss(toast); }, type === 'error' ? DURATION_MS * 1.5 : DURATION_MS);
    return toast;
  }

  // Queue a toast for the next page (e.g. "Listing published" after redirect)
  showToast.flash = function (message, type) {
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message: message, type: type || 'success' }));
    } catch (error) { /* storage unavailable — skip the flash message */ }
  };

  function showPendingFlash() {
    try {
      const raw = sessionStorage.getItem(FLASH_KEY);
      if (!raw) return;
      sessionStorage.removeItem(FLASH_KEY);
      const flash = JSON.parse(raw);
      showToast(flash.message, flash.type);
    } catch (error) { /* ignore malformed flash data */ }
  }

  window.showToast = showToast;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showPendingFlash);
  } else {
    showPendingFlash();
  }
})();
