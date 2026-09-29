# Campus Marketplace — single image containing the Express API + static frontend
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first so Docker can cache this layer
COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --prefix backend

# Copy application source
COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "server.js"]
