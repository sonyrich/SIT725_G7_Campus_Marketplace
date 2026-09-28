// Real-time layer (Socket.IO) — Krushal
//
// Pushes live updates to every open browser tab:
//   'listing:changed'  { action: 'created'|'updated'|'sold'|'deleted', listingId, at }
//   'presence:count'   number of people currently on the site
//
// The browser only receives "something changed" + the listing id, never user
// details. Pages then re-fetch through the normal REST API, so all the usual
// auth and ownership checks still apply.

const { Server } = require('socket.io');

let io = null;

function initRealtime(httpServer) {
    io = new Server(httpServer);

    const broadcastPresence = () => {
        io.emit('presence:count', io.engine.clientsCount);
    };

    io.on('connection', (socket) => {
        broadcastPresence();
        socket.on('disconnect', broadcastPresence);
    });

    return io;
}

function emitListingChange(action, listingId) {
    if (!io) {
        return; // real-time not started (e.g. in most unit tests)
    }

    io.emit('listing:changed', {
        action,
        listingId: listingId ? String(listingId) : null,
        at: new Date().toISOString()
    });
}

function closeRealtime() {
    if (io) {
        io.close();
        io = null;
    }
}

module.exports = { initRealtime, emitListingChange, closeRealtime };
