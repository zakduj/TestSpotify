FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npx", "nuxt", "dev", "--port", "4000", "--host", "0.0.0.0"]
