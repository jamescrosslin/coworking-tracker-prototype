const { Op } = require('sequelize');
const { Task } = require('../model');
const { sanitizeData } = require('../middleware/sanitize');
const { sendTaskUpdates } = require('../middleware');

let clients = [];

const admins = ['moderator', 'owner'];

module.exports = {
  clients,
  getTasks: async (req, res) => {
    const tasks = await Task.findAll();
    const sanitizedTasks = sanitizeData(tasks);

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
      const { user, task } = req.query;
      await Task.create({ user, task, finished: false });
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
    let task;
    const failures = ['undefined', false];
    if (failures.some((val) => val == req.query.id))
      task = await Task.findOne({
        where: {
          [Op.and]: [{ user: req.query.user }, { finished: false }],
        },
      });
    // use Op.and to make sure both conditions are true
    else
      task = await Task.findOne({
        where: {
          id: req.query.id,
        },
      });


    if (!task) {
      return res.json({ message: 'Could not find that task. Double check your post number.' });
    }

    if (
      req.query.user.toLowerCase() === task.user.toLowerCase() ||
      admins.includes(req.query.userLevel.toLowerCase())
    ) {
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
    if (req.query.userLevel !== 'owner')
      res.json({ message: 'Only the stream owner can delete all tasks.' });
    await Task.sync({ force: true });

    const tasks = await Task.findAll();
    sendTaskUpdates(clients, tasks);
    res.status(201).json({ message: 'All tasks reset.' });
  },
};
