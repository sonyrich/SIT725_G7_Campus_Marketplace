// createListing.js — owned by Krushal
// Wired up to POST /api/listings (multipart/form-data + JWT auth)

const LISTINGS_API = 'http://localhost:3000/api/listings';

const form = document.getElementById('create-listing-form');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please log in before creating a listing.');
        window.location.href = 'login.html';
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
            alert(data.message || 'Could not create the listing. Please check your details.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            return;
        }

        alert('Listing published!');
        window.location.href = 'index.html';

    } catch (err) {
        console.error('Create listing error:', err);
        alert('Something went wrong. Is the backend server running?');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});