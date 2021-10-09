# Docker Hub 地址

[https://hub.docker.com/?namespace=golangcommunity](https://hub.docker.com/?namespace=golangcommunity)

# Introduction

作为 [Bluewhale](https://humpback.github.io/humpback) 的直观展现，基于 [Angular](https://angular.io/) 和 [nestjs](https://nestjs.com/) 构建的用于管理 `docker` 的网站。 

# Docker image
[![](https://images.microbadger.com/badges/image/humpbacks/humpback-web:1.3.0.svg)](https://microbadger.com/images/humpbacks/humpback-web:1.3.0 "Get your own image badge on microbadger.com")
[![](https://images.microbadger.com/badges/version/humpbacks/humpback-web:1.3.0.svg)](https://microbadger.com/images/humpbacks/humpback-web:1.3.0 "Get your own version badge on microbadger.com")
```bash
$ docker pull humpbacks/humpback-web:1.3.0

$ docker run -d --net=host --restart=always -e HUMPBACK_LISTEN_PORT=8012 \
  -v /opt/app/humpback-web/dbFiles:/humpback-web/dbFiles \
  --name humpback-web \
  humpbacks/humpback-web:1.3.0
```

# Functions
[x] 服务器分组管理
- 容器及镜像管理
- 容器批量操作
- 容器实时监控
- 容器日志查看
- 私有仓库管理
- etc.

# Sample Pages
#### Login Page
![image](https://cloud.githubusercontent.com/assets/9428909/22197325/73c2aba4-e18c-11e6-9c9a-c00318abf6f5.png)

#### Server Overview
![image](https://cloud.githubusercontent.com/assets/9428909/22238288/9fc10bc8-e24b-11e6-840a-87699929063f.png)

#### New Container
![image](https://cloud.githubusercontent.com/assets/9428909/22238315/b8292790-e24b-11e6-84ba-58e97288a104.png)

#### Private registry explore - docker image detail
![image](https://cloud.githubusercontent.com/assets/9428909/22238333/ca0debee-e24b-11e6-871b-a1134ed8af46.png)
etc.

## License

Apache-2.0


## Develop
> 推荐使用 `pnpm` 作为包管理工具

## Installation

```bash
$ pnpm i
```

## Running the app

```bash
# development
$ npm start

# open the web page 
http://localhost:8009

# Default Account    
UserID: `admin`   
Password: `123456`   
```

## Test

```bash
# unit tests server
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

# webui tests
$ npm run web:test
```