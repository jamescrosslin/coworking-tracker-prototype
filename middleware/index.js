module.exports = {
  sendTaskUpdates: (openStreams, data) => {
    openStreams.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  },
};
