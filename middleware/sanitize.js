module.exports = {
  sanitizeData: (tasks) => {
    return tasks.map(({ id, user, task, finished }) => {
      return {
        id,
        finished,
        user: user.replace(/[<>/\\();]/g, ' '),
        task: task.replace(/[<>/\\();]/g, ' '),
      };
    });
  },
};
