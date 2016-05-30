FROM quay.io/trustedanalytics/tap-base-node:latest
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy app and  install app dependencies
COPY . /usr/src/app
RUN npm install --production

EXPOSE 8080
CMD [ "npm", "start" ]
