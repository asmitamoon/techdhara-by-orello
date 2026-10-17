FROM node:22-alpine

# Install build dependencies if needed (e.g. for node-gyp native modules)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure temp directory exists and is owned by the node user
RUN mkdir -p /tmp/video-processing && chown -R node:node /app /tmp/video-processing

EXPOSE 5000

USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
