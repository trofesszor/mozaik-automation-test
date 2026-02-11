FROM mcr.microsoft.com/playwright:v1.58.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Default command: run the invoice spec
CMD ["npm", "run", "test:e2e:invoice"]
