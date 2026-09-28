// editListing.js
// FR-09 Edit Listings
// Loads an existing listing and allows the owner to update it.

const LISTINGS_API = '/api/listings';

const form = document.getElementById('edit-listing-form');

const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const conditionInput = document.getElementById('condition');
const categoryInput = document.getElementById('category');
const imageInput = document.getElementById('image');


// Get listing ID from URL
const params = new URLSearchParams(window.location.search);

const listingId = params.get('id');

// FR-11: when opened from My Listings (?return=my-listings.html), go back
// there after saving/cancelling. Only local page names are accepted.
const returnParam = params.get('return');
const returnTo = returnParam && /^[\w-]+\.html$/.test(returnParam)
    ? returnParam
    : 'index.html';

const cancelLink = document.querySelector('.form-actions a');

if (cancelLink) {
    cancelLink.href = returnTo;
}


// Check login
const token = localStorage.getItem('token');

if (!token) {

    alert('Please log in before editing a listing.');

    window.location.href = 'login.html';
}


// Check listing ID
if (!listingId) {

    alert('Listing ID is missing.');

    window.location.href = 'index.html';
}


// Load existing listing
async function loadListing() {

    try {

        const response = await fetch(
            `${LISTINGS_API}/${listingId}`
        );

        const result = await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                'Could not load the listing.'
            );

            window.location.href = 'index.html';

            return;
        }


        const listing = result.data;


        titleInput.value = listing.title || '';

        descriptionInput.value =
            listing.description || '';

        priceInput.value =
            listing.price !== undefined
                ? listing.price
                : '';

        conditionInput.value =
            listing.condition || '';

        categoryInput.value =
            listing.category || '';

    } catch (error) {

        console.error(
            'Load listing error:',
            error
        );

        alert(
            'Something went wrong while loading the listing.'
        );
    }
}


// Update listing
form.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const formData = new FormData();


        formData.append(
            'title',
            titleInput.value.trim()
        );

        formData.append(
            'description',
            descriptionInput.value.trim()
        );

        formData.append(
            'price',
            priceInput.value
        );

        formData.append(
            'condition',
            conditionInput.value
        );

        formData.append(
            'category',
            categoryInput.value
        );


        const imageFile =
            imageInput.files[0];


        if (imageFile) {

            formData.append(
                'image',
                imageFile
            );
        }


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        const originalButtonText =
            submitButton.textContent;


        submitButton.disabled = true;

        submitButton.textContent =
            'Saving...';


        try {

            const response = await fetch(
                `${LISTINGS_API}/${listingId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    'Could not update the listing.'
                );

                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;

                return;
            }


            alert(
                'Listing updated successfully!'
            );


            window.location.href =
                returnTo;


        } catch (error) {

            console.error(
                'Update listing error:',
                error
            );


            alert(
                'Something went wrong while updating the listing.'
            );


            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;
        }
    }
);


// Load listing when page opens
document.addEventListener(
    'DOMContentLoaded',
    loadListing
);