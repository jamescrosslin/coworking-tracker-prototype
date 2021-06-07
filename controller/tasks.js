const { Task } = require('../model');

module.exports = {
  getTasks: async (req, res) => {
    const tasks = await Task.findAll();
    res.render('tasks', { tasks });
  },
  createTask: async (req, res) => {
    await Task.create(req.query);
    res.status(201).json({ message: 'Your task is submitted! Get to work!' });
  },
  finishTask: async ({ query: { user } }, res) => {
    const task = await Task.findOne({
      where: {
        user,
        finished: false,
      },
    });
    await task.update({ finished: true });
    res.status(201).json({ message: 'Nailed it! Look at you go!' });
  },
  deleteTask: async (req, res) => {
    const task = await Task.findOne({
      where: {
        id: req.query.id,
      },
    });
    const admins = ['thedabolical', 'izzy42oo'];
    if (
      true //[req.body.user, ...admins].some((user) => user === task.user)
    )
      await task.destroy();
    else res.status(401).json({ message: 'Unauthorized' });
    res.status(204).json({ message: 'Your task has been removed' });
  },
};
