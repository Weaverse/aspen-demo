# This file is moved to the root directory before building the image

# Base node image
FROM node:lts-bookworm-slim as base

# Install only necessary dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Build stage
FROM base as build

WORKDIR /myapp

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY .npmrc ./
RUN npm ci

# Copy source files
COPY . .

# Replace localhost with 0.0.0.0 (Linux compatible version)
# Find and patch workerd files to use 0.0.0.0 instead of localhost
RUN set -e && \
    # Find all workerd files in the @shopify directories and replace localhost with 0.0.0.0
    find node_modules/@shopify -type f -name "workerd*.js" -o -name "*oxygen*.js" | xargs grep -l "host: \"localhost\"" | \
    xargs -r sed -i -e 's|host: "localhost"|host: "0.0.0.0"|g' || \
    echo "No workerd files with localhost found to patch"
    
    # Check if we have mini-oxygen or hydrogen binaries that need to be patched
RUN find node_modules/@shopify -type f -name "mini-oxygen.js" -o -name "mini-oxygen-worker.js" -o -name "hydrogen-*.js" | \
    xargs -r grep -l "host: \"localhost\"" | \
    xargs -r sed -i -e 's|host: "localhost"|host: "0.0.0.0"|g' || \
    echo "No mini-oxygen files with localhost found to patch"

# Build the app
RUN npm run build

# Production stage
FROM base as production

WORKDIR /myapp

ENV NODE_ENV=production
ENV FLY="true"
ENV PORT="3000"

# Copy only necessary files from build stage
COPY --from=build /myapp/dist /myapp/dist
COPY --from=build /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/.env /myapp/.env
# Expose port and start application
EXPOSE 3000
CMD ["npm", "run", "start"]