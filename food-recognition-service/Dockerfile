FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine

# Install sharp dependencies
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc-dev

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 4002

CMD ["node", "src/index.js"]
