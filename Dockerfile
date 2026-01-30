FROM registry.gitlab.com/caelus-team/generics-tools/official-docker-hub-mirroring/nodejs:olts

RUN apk update && \
    apk add curl

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

COPY .env.prod .env.prod
COPY CHANGELOG.md CHANGELOG.md
COPY README.md README.md
COPY CONTRIBUTING.md CONTRIBUTING.md
COPY index.js index.js
COPY prerequisites.js prerequisites.js
COPY swagger.js swagger.js
COPY ./src ./src

ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app
USER appuser


EXPOSE 10001

CMD ["npm", "run", "prod"]
