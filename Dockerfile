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
RUN set -e && \
    WORKERD_FILE=$(find node_modules/@shopify/cli/dist -type f -name "workerd-*.js") && \
    if [ -f "$WORKERD_FILE" ]; then \
        sed -i -e 's|host: "localhost"|host: "0.0.0.0"|' "$WORKERD_FILE"; \
    else \
        echo "workerd file not found" && exit 1; \
    fi && \
    HYDROGEN_WORKERD_FILE="node_modules/@shopify/cli-hydrogen/dist/lib/mini-oxygen/workerd.js" && \
    if [ -f "$HYDROGEN_WORKERD_FILE" ]; then \
        sed -i -e 's|host: "localhost"|host: "0.0.0.0"|' "$HYDROGEN_WORKERD_FILE"; \
    else \
        echo "hydrogen workerd file not found" && exit 1; \
    fi

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