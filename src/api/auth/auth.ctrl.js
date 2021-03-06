const Joi = require('joi');
const User = require('../../models/user');

/*
POST /api/auth/register
{
  username: 'username',
  password: 'password',
}
*/
exports.register = async (ctx) => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  const { username, password } = ctx.request.body;
  try {
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // Conflict
      return;
    }
    const user = new User({ username });
    await user.setPassword(password);
    await user.save();

    ctx.status = 201;
    ctx.body = user.serialize();

    const token = user.generateToken();
    user.setCookie(token, ctx, 1000 * 60 * 60 * 24 * 7, true);
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
POST /api/auth/login
{
  username: 'username',
  password: 'password',
}
*/
exports.login = async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      ctx.status = 401;
      return;
    }

    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = 401;
      return;
    }

    ctx.body = user.serialize();
    const token = user.generateToken();
    user.setCookie(token, ctx, 1000 * 60 * 60 * 24 * 7, true);
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
GET /api/auth/check
*/
exports.check = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = user;
};

/*
POST /api/auth/logout
*/
exports.logout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = 204; // No Content
};
