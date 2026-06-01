# ============================================================
# Stage 1 — Build the Vite/React app
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (layer-cached)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Inject the backend URL at build time (overridden by ARG / compose env)
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ============================================================
# Stage 2 — Serve with Nginx
# ============================================================
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
