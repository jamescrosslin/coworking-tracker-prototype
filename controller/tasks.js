const { Op } = require('sequelize');
const { Task } = require('../model');

module.exports = {
  getTasks: async (req, res) => {
    const tasks = await Task.findAll();
    res.render('tasks', { tasks });
  },
  createTask: async (req, res) => {
    if (!req.task) {
      await Task.create(req.query);
      res.status(201).json({ message: 'Your task is submitted! Get to work!' });
    } else res.status(200).json({ message: 'You must finish your open task first' });
  },
  finishTask: async (req, res) => {
    let message = 'You have no open tasks',
      status = 200;
    if (req.task) {
      await req.task.update({ finished: true });
      message = 'Nailed it! Look at you go!';
      status = 201;
    }
    res.status(status).json({ message });
  },
  deleteTask: async (req, res) => {
    const task = await Task.findOne({
      where: {
        id: req.query.id,
      },
    });
    const admins = ['theDabolical', 'izzy42oo', 'crosssh'];
    if (!task) res.json({ message: 'Could not find that task. Double check your post number.' });
    if ([req.query.user, ...admins].some((user) => user === task.user)) await task.destroy();
    else res.status(200).json({ message: 'Unauthorized. You can only delete your own tasks.' });

    res.status(204).json({ message: 'Your task has been removed' });
  },
  getUnfinishedTask: async (req, res, next) => {
    const task = await Task.findOne({
      where: {
        user: req.query.user,
        finished: { [Op.or]: [false, null] },
      },
    });
    if (task) req.task = task;
    next();
  },
  resetAllTasks: async (req, res) => {
    await Task.sync({ force: true });
    res.status(201).json({ message: 'All tasks reset.' });
  },
};
