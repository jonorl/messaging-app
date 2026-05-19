FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache openssl

RUN npm ci --ignore-scripts

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 8081

USER node

CMD ["node", "app.js"]