# Stage 1: Build the React application
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
# This step is done separately so that if only code changes, dependencies aren't reinstalled
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
# This command creates the optimized production build in the 'build' directory
RUN npm run build

# Stage 2: Serve the application with Nginx
# Using a lightweight Nginx image for serving static files
FROM nginx:stable-alpine

# Copy the built React app from the builder stage into Nginx's default public directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80, which is the default HTTP port Nginx listens on
EXPOSE 80

# Command to run Nginx in the foreground
# "daemon off;" ensures Nginx runs as the main process, which is necessary for Docker containers
CMD ["nginx", "-g", "daemon off;"]