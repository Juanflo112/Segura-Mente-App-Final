# Imagen base oficial de Node.js 18 Alpine (ligera)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto del servidor
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
