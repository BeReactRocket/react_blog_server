const Post = require('../../models/post');
const mongoose = require('mongoose');
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

const { ObjectId } = mongoose.Types;
exports.getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  try {
    const post = await Post.findById(id);
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (error) {
    ctx.throw(500, error);
  }
};

exports.checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
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
  const post = new Post({
    title,
    body: sanitizeHtml(body, sanitizeOption),
    tags,
    user: ctx.state.user,
  });
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
GET /api/posts?username=&tag=&page=
*/
const removeHtmlAndShorten = (body) => {
  const filtered = sanitizeHtml(body, { allowedTags: [] });
  return filtered.length < 200 ? filtered : `${filtered.slice(0, 200)}...`;
};
exports.list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean();
    const postCount = await Post.countDocuments(query);
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts.map((post) => ({
      ...post,
      body: removeHtmlAndShorten(post.body),
    }));
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
GET /api/posts/:id
*/
exports.read = async (ctx) => {
  ctx.body = ctx.state.post;
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

  const nextData = { ...ctx.request.body };
  if (nextData.body) {
    nextData.body = sanitizeHtml(nextData.body, sanitizeOption);
  }
  try {
    let post = await Post.findByIdAndUpdate(id, nextData.body, {
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
