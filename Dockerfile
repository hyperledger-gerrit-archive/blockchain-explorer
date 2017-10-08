FROM node:6-wheezy
MAINTAINER Satheesh Kathamuthu <satheesh.ceg@gmail.com>

COPY explorer /explorer 

WORKDIR /explorer

RUN npm install

CMD ["node", "main.js"]