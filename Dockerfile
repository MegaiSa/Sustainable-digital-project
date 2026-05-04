FROM node:alpine3.22

WORKDIR /usr/src/app

ENV PORT=3000
ENV SESSION_SECRET="quiz-secret-change-in-prod"
ENV NODE_ENV=production

# Ensure app directory is owned by node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user BEFORE installing deps
USER node

# Install dependencies with correct ownership
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=cache,target=/home/node/.npm \
    npm install --omit=dev

# Copy source files as node user
COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "server.js"]
