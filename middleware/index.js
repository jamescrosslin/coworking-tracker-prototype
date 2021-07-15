const { sanitizeData } = require('./sanitize');
const crypto = require('crypto');

module.exports = {
  sendTaskUpdates: (openStreams, data) => {
    const sanitizedData = sanitizeData(data);
    openStreams.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(sanitizedData)}\n\n`);
    });
  },
  // the function is meant to prevent timing attacks for cracking api key
  checkTimingSafe: (req, res, next) => {
    // // Ivan (climax708) solution
    // const hash = crypto.createHash('sha512');
    // if (
    //   crypto.timingSafeEqual(
    //     hash.copy().update(req.query.key).digest(),
    //     hash.copy().update(process.env.API_KEY).digest(),
    //   )
    // ) {
    //   next();
    // } else {
    //   res.json({ message: 'You are not authorized to use this api.' });
    // }

    // original solution to timing attacks
    const key = process.env.API_KEY;
    const clientKey = Buffer.from(req.query.key.padEnd(key.length).slice(0, key.length));
    const apiKey = Buffer.from(key);
    const isSame = crypto.timingSafeEqual(clientKey, apiKey);

    isSame ? next() : res.json({ message: 'You are not authorized to use this api.' });
    // former not timing safe version
    // req.query.key !== process.env.API_KEY
    //   ? res.json({ message: 'You are not authorized to use this api.' })
    //   : next();
  },
};
