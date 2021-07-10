const { sanitizeData } = require('./sanitize');

module.exports = {
  sendTaskUpdates: (openStreams, data) => {
    const sanitizedData = sanitizeData(data);
    openStreams.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(sanitizedData)}\n\n`);
    });
  },
  // checkTimingSafe: (req, res, next) => {
  //   const key = process.env.API_Key;
  //   const clientKey = Buffer.from(req.query.key.padEnd(key.length).slice(0, key.length));
  //   const apiKey = Buffer.from(key);
  //   const isSame = crypto.timingSafeEqual(clientKey, apiKey);

  //   isSame ? res.json({ message: 'You are not authorized to use this api.' }) : next();
  // },
};
