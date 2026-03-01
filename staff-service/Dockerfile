FROM node:20-alpine AS build
WORKDIR /app
COPY staff-service/package.json staff-service/package-lock.json* ./
RUN npm install
COPY staff-service/ .
# Заменяем https:// на http:// так как API пробрасывается наружу без SSL
RUN sed -i 's|https://localhost:60882|http://localhost:60882|g' src/services/api.js
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]