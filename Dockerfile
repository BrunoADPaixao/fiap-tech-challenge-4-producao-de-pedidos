# Dockerfile

# Usa uma imagem base oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de dependências.
# O '*' garante que tanto o package.json quanto o package-lock.json sejam copiados.
COPY package*.json ./

# Instale as dependências da aplicação.
RUN npm install

# Copia o resto do código da sua aplicação para o diretório de trabalho.
COPY . .

# Exponhe a porta que a sua aplicação usa dentro do contêiner.
EXPOSE 3002

# Define o comando para iniciar a sua aplicação quando o contêiner for executado.
CMD ["node", "src/index.js"]