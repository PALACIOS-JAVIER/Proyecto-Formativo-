# Etapa 1: Compilación con Vite (Build)
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor web ultraligero (Nginx)
FROM nginx:alpine AS production

# Copiamos la compilación estática de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración para React SPA y Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
