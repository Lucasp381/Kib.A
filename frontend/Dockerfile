# frontend/Dockerfile
# Étape 1 : builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


RUN npm run build

# Étape 2 : production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["npx", "next", "start", "-p", "3001"]
