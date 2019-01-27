FROM node:10.15.0-alpine

LABEL author="golang-community" email="hm910705@163.com"

COPY dist /humpback-web

WORKDIR /humpback-web

EXPOSE 8100

CMD ["node", "index.js"]
