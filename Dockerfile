# syntax=docker/dockerfile:1
FROM node:16.17.1
ENV NODE_ENV=production
WORKDIR /home/mason/masons.photography
COPY . .
RUN npm install --production
EXPOSE 80
CMD ["npm", "start"]