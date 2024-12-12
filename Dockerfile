FROM node:20-alpine AS frontend-builder

WORKDIR /build

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build

FROM node:20-alpine AS backend-builder

WORKDIR /build
COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/src ./src

FROM node:20-alpine

WORKDIR /app

# Copy frontend
COPY --from=frontend-builder /build/dist ./dist

# Copy backend
COPY --from=backend-builder /build/package*.json ./
COPY --from=backend-builder /build/node_modules ./node_modules
COPY --from=backend-builder /build/src ./src

# Install http-server globally
RUN npm install -g http-server

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 5000 5173

ENV NODE_ENV=production

CMD ["/app/start.sh"]
