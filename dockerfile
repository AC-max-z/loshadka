FROM node:alpine
VOLUME [ "/loshadka" ]
WORKDIR /usr/yourapplication-name
COPY package.json .
RUN npm install
COPY . .
RUN tsc
CMD ["node", "./build/index.js"]