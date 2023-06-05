FROM node:alpine

RUN mkdir -p /usr/src/Emayan_PV_dir

WORKDIR /usr/src/Emayan_PV_dir

COPY package.json /usr/src/Emayan_PV_dir/

RUN npm install

COPY . /usr/src/Emayan_PV_dir

CMD node index.js