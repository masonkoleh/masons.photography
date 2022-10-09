# syntax=docker/dockerfile:1
FROM node:16.17.1
ENV NODE_ENV=production
WORKDIR /home/mason/masons.photography
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["node", "app.js"]