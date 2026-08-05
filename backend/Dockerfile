# Etapa 1: Compilación (Build)
FROM node:22-alpine AS build

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y compilamos NestJS
COPY . .
RUN npm run build

# Etapa 2: Producción (Run)
FROM node:22-alpine AS production

WORKDIR /app

# Solo instalamos dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos los archivos compilados de la etapa anterior
COPY --from=build /app/dist ./dist

# Creamos directorio para las subidas de archivos (uploads)
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/src/main"]
