FROM node:20-alpine as builder

WORKDIR /build

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /build/package*.json ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/src ./src

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "--experimental-specifier-resolution=node", "src/index.js"]
