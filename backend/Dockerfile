# Use the official Node 22 Alpine image for a lightweight, secure container
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the default network port (Render/Railway dynamically injects PORT)
EXPOSE 5000

# Automatically run SQLite database migrations and initialization, then start the server
CMD ["sh", "-c", "node init-db.js && node server.js"]
