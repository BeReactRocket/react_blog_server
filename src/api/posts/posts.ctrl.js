const Post = require('../../models/post');
const mongoose = require('mongoose');
const Joi = require('joi');

const { ObjectId } = mongoose.Types;
exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  return next();
};

/*
POST /api/posts
{
  title: 'TITLE',
  body: 'BODY',
  tags: ['tag1', 'tag2']
}
*/
exports.write = async (ctx) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

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

/*
GET /api/posts
*/
exports.list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }
  try {
    const posts = await Post.find({})
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean();
    const postCount = await Post.countDocuments();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts.map((post) => ({
      ...post,
      body:
        post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
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

  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

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
