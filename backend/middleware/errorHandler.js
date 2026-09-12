const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        let message = 'File upload error';

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large. Maximum allowed size is 5MB.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected field name. Use "image" as the field name for uploads.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded at once.';
                break;
            default:
                message = err.message;
        }

        console.error(`Multer error [${err.code}]: ${message}`);
        return res.status(400).json({ success: false, message });
    }

    // Custom fileFilter errors from upload.js (e.g. "Only image files... are allowed")
    // are still genuinely client-input errors, so keep these as 400.
    if (err.message && err.message.includes('Only image files')) {
        console.error('Upload validation error:', err.message);
        return res.status(400).json({ success: false, message: err.message });
    }

    // Everything else (DB errors, programming bugs, filesystem errors, etc.)
    // is NOT the client's fault — don't leak details, return a generic 500.
    if (err) {
        console.error('Unhandled error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    next();
};

module.exports = errorHandler;