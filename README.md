# React Blog Server

Blog Service Server in Koa.

```shell
yarn init
yarn add koa
yarn add eslint -D
yarn run eslint --init
```

## Middleware

Koa configures one server with several middlewares.

A middleware is a function, and it takes "Context" that handles the current request and response, and "next" that points to the next middleware as arguments.

```shell
openssl rand -hex 64
```