FROM node:19 as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json turbo.json yarn.lock ./

# Install Next.js and its dependencies
RUN yarn install

# Copy the rest of the application code into the container
COPY . .

# Build the Next.js application for production
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Specify the command to run when the container starts
CMD ["yarn", "start"]
