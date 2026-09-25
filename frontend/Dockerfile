# Base image
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./

# Dev stage
FROM base as dev
RUN npm install
COPY . .
# Let docker-compose handle the run command so we can override it if needed
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Prod stage (optional, for later)
FROM base as build
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine as prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
