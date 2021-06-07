const { Post } = require('../model');

module.exports = {
  getPosts: async (req, res) => {
    const posts = await Post.findAll();
    res.render('posts', { posts });
  },
  createPost: async (req, res) => {
    await Post.create(req.body);
    res.status(201).json({ message: 'Your task is submitted! Get to work!' });
  },
  finishPost: async ({ body: { user } }, res) => {
    const post = await Post.findOne({
      where: {
        user,
        finished: false,
      },
    });
    await post.update({ finished: true });
    res.status(201).json({ message: 'Nailed it! Look at you go!' });
  },
  deletePost: async (req, res) => {
    const post = await Post.findOne({
      where: {
        id: req.body.id,
      },
    });
    const admins = ['thedabolical', 'izzy42oo'];
    if ([req.body.user, ...admins].some((user) => user === post.user)) await post.destroy();
    else res.status(401).json({ message: 'Unauthorized' });
    res.status(204).send();
  },
};
