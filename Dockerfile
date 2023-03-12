# syntax=docker/dockerfile:1.4
FROM node:16.17.1-alpine
WORKDIR /home/mason/masons.photography
COPY --link assets assets
COPY --link ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY --link ["*.html", "*.js", "./"]
COPY --link routes routes
ENV NODE_ENV=production
EXPOSE 80
CMD ["npm", "start"]