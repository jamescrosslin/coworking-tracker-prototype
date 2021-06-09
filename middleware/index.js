const { sanitizeData } = require('./sanitize');

module.exports = {
  sendTaskUpdates: (openStreams, data) => {
    const sanitizedData = sanitizeData(data);
    openStreams.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(sanitizedData)}\n\n`);
    });
  },
};
