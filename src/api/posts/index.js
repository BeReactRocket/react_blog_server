const Router = require('koa-router');
const posts = new Router();
const postCtrl = require('./posts.ctrl');
const checkLoggedIn = require('../../lib/checkLoggedIn');

// const printInfo = (ctx) => {
//   ctx.body = {
//     method: ctx.method,
//     path: ctx.path,
//     params: ctx.params,
//   };
// };

posts.get('/', postCtrl.list);
posts.post('/', checkLoggedIn, postCtrl.write);
posts.get('/:id', postCtrl.getPostById, postCtrl.read);
posts.delete(
  '/:id',
  checkLoggedIn,
  postCtrl.getPostById,
  postCtrl.checkOwnPost,
  postCtrl.remove,
);
posts.patch(
  '/:id',
  checkLoggedIn,
  postCtrl.getPostById,
  postCtrl.checkOwnPost,
  postCtrl.update,
);

module.exports = posts;
