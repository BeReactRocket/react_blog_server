const Router = require('koa-router');
const auth = require('./auth');
const posts = require('./posts');

const api = new Router();

api.use('/auth', auth.routes());
api.use('/posts', posts.routes());

module.exports = api;
