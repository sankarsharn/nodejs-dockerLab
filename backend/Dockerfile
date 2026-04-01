# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy app source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
