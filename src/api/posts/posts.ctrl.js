let postId = 1;

const posts = [{ id: 1, title: 'TITLE', body: 'BODY' }];

/* NEW POST
POST /api/posts
{ title, body }
*/
exports.write = (ctx) => {
  const { title, body } = ctx.request.body;
  const newPost = { id: ++postId, title, body };
  posts.push(newPost);
  ctx.status = 201;
  ctx.body = newPost;
};

/* GET ALL POSTS
GET /api/posts
*/
exports.list = (ctx) => {
  ctx.body = posts;
};

/* GET ONE POST
GET /api/posts/:id
*/
exports.read = (ctx) => {
  const { id } = ctx.params;
  const post = posts.find((post) => post.id === parseInt(id));
  if (!post) {
    ctx.status = 404;
    ctx.body = {
      message: 'Post Not Found.',
    };
    return;
  }
  ctx.body = post;
};

/* DELETE A POST
DELETE /api/posts/:id
*/
exports.remove = (ctx) => {
  const { id } = ctx.params;
  const index = posts.findIndex((post) => post.id === parseInt(id));
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: 'Post Not Found.',
    };
    return;
  }
  posts.splice(index, 1);
  ctx.status = 204; // No Content
};

/* REPLACE A POST
PUT /api/posts/:id
{ title, body }
*/
exports.replace = (ctx) => {
  const { id } = ctx.params;
  const index = posts.findIndex((post) => post.id === parseInt(id));
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: 'Post Not Found.',
    };
    return;
  }
  posts[index] = {
    id,
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};

/* UPDATE A POST
PATCH /api/posts/:id
{ title, body }
*/
exports.update = (ctx) => {
  const { id } = ctx.params;
  const index = posts.findIndex((post) => post.id === parseInt(id));
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: 'Post Not Found',
    };
    return;
  }
  posts[index] = {
    ...posts[index],
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};
