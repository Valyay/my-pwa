FROM node:12

COPY ["./*", "/app/"]

WORKDIR /app

EXPOSE 3000