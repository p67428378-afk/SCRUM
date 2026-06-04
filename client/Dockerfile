# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app/client

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expose port 8080 as required by the runbook
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]