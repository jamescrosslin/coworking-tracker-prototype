const { Op } = require('sequelize');
const { Task } = require('../model');

module.exports = {
  getTasks: async (req, res) => {
    const tasks = await Task.findAll();
    res.render('tasks', { tasks });
  },
  createTask: async (req, res) => {
    let message = 'You must !finish your open task',
      status = 401;
    if (req.task) {
      await Task.create(req.query);
      message = 'Your task is submitted! Get to work!';
      status = 201;
    }
    res.status(status).json({ message });
  },
  finishTask: async (req, res) => {
    let message = 'You have no open tasks',
      status = 401;
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
    const admins = ['theDabolical', 'izzy42oo'];
    if ([req.body.user, ...admins].some((user) => user === task.user)) await task.destroy();
    else res.status(401).json({ message: 'Unauthorized' });
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
