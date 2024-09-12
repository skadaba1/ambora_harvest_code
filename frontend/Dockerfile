# frontend/Dockerfile

# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json /app/
COPY package-lock.json /app/

# Install the dependencies
RUN npm install

# Copy the rest of the React source code into the container
COPY . /app/

# Build the React app for production
RUN npm run build  # <-- This is the command that generates the 'build' directory

# Serve the React app with a simple HTTP server
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# Open port 3000 for development
EXPOSE 3000