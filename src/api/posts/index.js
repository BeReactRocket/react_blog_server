const Router = require('koa-router');
const posts = new Router();
const postCtrl = require('./posts.ctrl');

// const printInfo = (ctx) => {
//   ctx.body = {
//     method: ctx.method,
//     path: ctx.path,
//     params: ctx.params,
//   };
// };

posts.get('/', postCtrl.list);
posts.post('/', postCtrl.write);
posts.get('/:id', postCtrl.checkObjectId, postCtrl.read);
posts.delete('/:id', postCtrl.checkObjectId, postCtrl.remove);
posts.patch('/:id', postCtrl.checkObjectId, postCtrl.update);

module.exports = posts;
