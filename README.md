## 基础依赖

- nodejs: v16.19.1
- docker: 用于运行镜像，安装参考：<https://yeasy.gitbook.io/docker_practice/install/mac>
- openjdk11: `brew insall openjdk@11`

## 结构说明

- APP-META: 容器配置，以及相关脚本
- frontend: 前端工程
- backend: 后端工程
- appclt.sh: 构建以及部署脚本

## 运行说明

初始化请运行如下脚本

```sh
./appclt.sh install #安装npm依赖
./appclt.sh buildBase #构建基础镜像
```

每次构建使用如下脚本（编译前后端工程，同时构建docker镜像）

```sh
./appclt.sh build
```

运行容器

```sh
./appclt.sh restart
```







<!-- 
# umi project

## Getting Started
采用umi框架+cesium 结合

Install dependencies,

```bash
$ yarn
```

Start the dev server,

```bash
$ yarn start
``` -->
