const { post } = require('.');
const Post = require('../../models/post');

/*
POST /api/posts
{
  title: 'TITLE',
  body: 'BODY',
  tags: ['tag1', 'tag2']
}
*/
exports.write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  const post = new Post({ title, body, tags });
  try {
    await post.save();
    ctx.status = 201;
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};
exports.list = async (ctx) => {
  try {
    const posts = await Post.find({});
    ctx.body = posts;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
GET /api/posts/:id
*/
exports.read = async (ctx) => {
  try {
    const { id } = ctx.request.params;
    const post = await Post.findById(id);
    if (!post) {
      ctx.status = 404;
      ctx.body = {
        message: 'Post Not Found.',
      };
      return;
    }
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
DELETE /api/posts/:id
*/
exports.remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id);
    ctx.status = 204;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
PATCH /api/posts/:id
*/
exports.update = async (ctx) => {
  const { id } = ctx.params;
  try {
    let post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    });
    if (!post) {
      ctx.status = 404;
      ctx.body = {
        message: 'Post Not Found.',
      };
      return;
    }
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};
