FROM node:19 as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY . .

# Install Next.js and its dependencies
RUN yarn install

# Build the Next.js application for production
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Specify the command to run when the container starts
CMD ["yarn", "start"]
