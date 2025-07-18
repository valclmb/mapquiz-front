# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.16.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Vite"

# Vite app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=8.6.12
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
# Build stage
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

# Define build arguments before the build command
ARG API_URL
ARG AUTH_URL
ARG WS_URL

# Build application with environment variables
RUN VITE_API_URL=$API_URL BETTER_AUTH_URL=$AUTH_URL VITE_WS_URL=$WS_URL pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM nginx

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start the server by default, this can be overwritten at runtime
EXPOSE 80
CMD [ "/usr/sbin/nginx", "-g", "daemon off;" ]

ARG API_URL
ARG AUTH_URL
ARG WS_URL
ENV VITE_API_URL=$API_URL
ENV BETTER_AUTH_URL=$AUTH_URL
ENV VITE_WS_URL=$WS_URL
