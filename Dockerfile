# ---- STAGE 1 : Build Backend ----
    FROM node:20-alpine AS backend-builder
    WORKDIR /backend
    
    COPY backend/package*.json ./
    RUN npm ci
    COPY backend/tsconfig*.json ./
    COPY backend/nest-cli.json ./
    COPY backend/src ./src
    RUN npm run build
    
    
    # ---- STAGE 2 : Build Frontend ----
    FROM node:20-alpine AS frontend-builder
    WORKDIR /frontend
    
    COPY frontend/package*.json ./
    RUN npm install
    COPY frontend ./
    RUN npm run build
    
    
    # ---- STAGE 3 : Final Image ----
    FROM node:20-alpine
    WORKDIR /app
    
    # Copier le backend
    COPY --from=backend-builder /backend/package*.json ./backend/
    COPY --from=backend-builder /backend/dist ./backend/dist
    WORKDIR /app/backend
    RUN npm ci --omit=dev
    WORKDIR /app
    
    # Copier le frontend
    COPY --from=frontend-builder /frontend/package*.json ./frontend/
    COPY --from=frontend-builder /frontend/.next ./frontend/.next
    COPY --from=frontend-builder /frontend/public ./frontend/public
    COPY --from=frontend-builder /frontend/next.config.js ./frontend/next.config.js
    COPY --from=frontend-builder /frontend/node_modules ./frontend/node_modules
    
    # Variables d’environnement (ajoute ce dont tu as besoin)
    ENV PORT=3000
    ENV BACKEND_PORT=3001
    ENV BACKEND_URL=http://localhost:3001
    # Exposer seulement le frontend
    EXPOSE 3000
    
    # Lancer backend + frontend
    CMD node backend/dist/main.js & npx next start ./frontend -p 3000
    