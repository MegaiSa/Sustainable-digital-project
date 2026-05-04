FROM node:alpine3.22

WORKDIR /usr/src/app

ENV PORT=3000
ENV SESSION_SECRET="quiz-secret-change-in-prod"
ENV NODE_ENV=production

# Ensure correct ownership
RUN chown -R node:node /usr/src/app

USER node

# Copy only package files first (better layer caching)
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the app
COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "server.js"]
