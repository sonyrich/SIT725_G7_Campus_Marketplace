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

    if (err) {
        console.error('Upload error:', err.message);
        return res.status(400).json({ success: false, message: err.message });
    }

    next();
};

module.exports = errorHandler;