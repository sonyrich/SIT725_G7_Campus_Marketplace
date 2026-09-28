// createListing.js — owned by Krushal
// Wired up to POST /api/listings (multipart/form-data + JWT auth)

const LISTINGS_API = '/api/listings';

// Toast when available (js/toast.js), plain alert otherwise
function notify(message, type) {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

const form = document.getElementById('create-listing-form');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
        if (window.showToast) {
            window.showToast.flash('Please log in to list an item.', 'error');
        }
        window.location.href = 'login.html?next=create-listing.html';
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const condition = document.getElementById('condition').value;
    const category = document.getElementById('category').value;
    const imageFile = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('condition', condition);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    try {
        const res = await fetch(LISTINGS_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // NOTE: do NOT set Content-Type manually here — the browser
                // sets the correct multipart/form-data boundary automatically
                // when the body is a FormData object.
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            notify(data.message || 'Could not create the listing. Please check your details.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            return;
        }

        if (window.showToast) {
            window.showToast.flash('Listing published! It is now live on the marketplace.');
        }
        // FR-11: take the seller to their dashboard to see the new listing
        window.location.href = 'my-listings.html';

    } catch (err) {
        console.error('Create listing error:', err);
        notify('Something went wrong. Is the backend server running?', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});