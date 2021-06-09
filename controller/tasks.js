const { Op } = require('sequelize');
const { Task } = require('../model');
const { sendTaskUpdates } = require('../middleware');
const validator = require('validator');

let clients = [];

module.exports = {
  clients,
  getTasks: async (req, res) => {
    const tasks = await Task.findAll();
    const sanitizedTasks = tasks.map(({ id, user, task, finished }) => {
      return {
        id,
        finished,
        user: validator.blacklist(user, '[<>/\\()]'),
        task: validator.blacklist(task, '[<>/\\();^]'),
      };
    });

    res.status(200).set({
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-control': 'no-cache',
    });

    const data = `data: ${JSON.stringify(sanitizedTasks)}\n\n`;

    res.write(data);

    const clientId = Date.now();

    const newClient = {
      id: clientId,
      res,
    };

    clients = [...clients, newClient];

    req.on('close', () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter((client) => client.id !== clientId);
    });
  },
  createTask: async (req, res) => {
    if (!req.task) {
      await Task.create(req.query);
      const tasks = await Task.findAll();
      sendTaskUpdates(clients, tasks);
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
      const tasks = await Task.findAll();
      sendTaskUpdates(clients, tasks);
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

    if (!task) {
      res.json({ message: 'Could not find that task. Double check your post number.' });
    }

    if (req.query.user === task.user || admins.includes(req.query.user)) {
      await task.destroy();
    } else {
      res.status(200).json({ message: 'Unauthorized. You can only delete your own tasks.' });
    }
    const tasks = await Task.findAll();
    sendTaskUpdates(clients, tasks);
    res.status(201).json({ message: 'Your task has been removed' });
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
    if (req.query.user !== 'theDabolical')
      res.json({ message: 'Only the stream owner can delete all tasks.' });
    await Task.sync({ force: true });

    const tasks = await Task.findAll();
    sendTaskUpdates(clients, tasks);
    res.status(201).json({ message: 'All tasks reset.' });
  },
};
