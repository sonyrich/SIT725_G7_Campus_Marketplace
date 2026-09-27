// reportListing.js
// FR-14 Report Listing
// Loads the selected listing and submits a report linked to
// the listing and currently authenticated user.

const REPORTS_API = '/api/reports';
const LISTINGS_API = '/api/listings';

const form = document.getElementById('report-listing-form');
const listingName = document.getElementById('listing-name');
const reasonInput = document.getElementById('reason');
const detailsInput = document.getElementById('details');


// --------------------------------------------------
// Get listing ID from URL
// Example:
// report-listing.html?id=123456
// --------------------------------------------------

const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');


// --------------------------------------------------
// Check authentication
// --------------------------------------------------

const token = localStorage.getItem('token');

if (!token) {
    alert('Please log in before reporting a listing.');
    window.location.href = 'login.html';
}


// --------------------------------------------------
// Check listing ID
// --------------------------------------------------

if (!listingId) {
    alert('Listing ID is missing.');
    window.location.href = 'index.html';
}


// --------------------------------------------------
// Load listing information
// --------------------------------------------------

async function loadListing() {
    try {
        const response = await fetch(LISTINGS_API);

        const result = await response.json();

        if (!response.ok || !result.success) {
            alert(
                result.message ||
                'Could not load listing information.'
            );

            window.location.href = 'index.html';
            return;
        }

        const listing = result.data.find(
            (item) => String(item._id) === String(listingId)
        );

        if (!listing) {
            alert('Listing not found.');

            window.location.href = 'index.html';
            return;
        }

        listingName.textContent =
            `${listing.title} — $${Number(listing.price).toFixed(2)}`;

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


// --------------------------------------------------
// Submit report
// --------------------------------------------------

form.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();

        const reason = reasonInput.value;
        const details = detailsInput.value.trim();


        if (!reason) {
            alert('Please select a report reason.');
            return;
        }


        if (details.length > 500) {
            alert(
                'Report details cannot exceed 500 characters.'
            );
            return;
        }


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        const originalButtonText =
            submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';


        try {
            const response = await fetch(
                REPORTS_API,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        listingId,
                        reason,
                        details
                    })
                }
            );


            const result = await response.json();


            if (
                !response.ok ||
                !result.success
            ) {
                alert(
                    result.message ||
                    'Could not submit the report.'
                );

                submitButton.disabled = false;
                submitButton.textContent =
                    originalButtonText;

                return;
            }


            alert(
                'Listing reported successfully.'
            );


            window.location.href =
                'index.html';


        } catch (error) {
            console.error(
                'Report listing error:',
                error
            );

            alert(
                'Something went wrong while submitting the report.'
            );

            submitButton.disabled = false;
            submitButton.textContent =
                originalButtonText;
        }
    }
);


// --------------------------------------------------
// Initial page load
// --------------------------------------------------

document.addEventListener(
    'DOMContentLoaded',
    loadListing
);