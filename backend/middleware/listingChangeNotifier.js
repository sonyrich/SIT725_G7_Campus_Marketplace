// Emits a real-time 'listing:changed' event after any successful change to a
// listing (create, edit, mark as sold, delete — including admin removal).
//
// Works as a wrapper around the existing routes, so no controller code had to
// change: it waits for the response to finish and only broadcasts on 2xx.

const { emitListingChange } = require('../realtime/socket');

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function detectAction(method, path) {
    const segments = path.split('/').filter(Boolean);   // e.g. ['<id>', 'status']

    if (method === 'POST' && segments.length === 0) return 'created';
    if (method === 'PUT' && segments.length === 1) return 'updated';
    if (method === 'PATCH' && segments[1] === 'status') return 'sold';
    if (method === 'DELETE' && segments.length === 1) return 'deleted';
    return null;
}

function listingChangeNotifier(req, res, next) {
    const action = detectAction(req.method, req.path);

    if (!action) {
        return next();
    }

    const idFromPath = req.path.split('/').filter(Boolean)[0];

    // Remember the JSON body so a newly created listing's id can be sent too
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        res.locals.responseBody = body;
        return originalJson(body);
    };

    res.on('finish', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
            return;
        }

        const body = res.locals.responseBody;
        const listingId = OBJECT_ID.test(idFromPath || '')
            ? idFromPath
            : body && body.data && body.data._id;

        emitListingChange(action, listingId);
    });

    return next();
}

module.exports = listingChangeNotifier;
module.exports.detectAction = detectAction;
