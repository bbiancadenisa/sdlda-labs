FROM node:24-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install dependencies first, so this layer is cached until package*.json changes
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
