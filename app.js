const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.route('/').get((request, response) => response.send('Welcome to my api!'));

const tasksRoute = require('./routes/tasks');
app.use('/tasks', tasksRoute);

app.use((err, req, res, next) => {
  const errors = err.validationErrors || err.errors || ['No further information'];
  res.status(err.status || 500).json({
    message: err.message,
    error: errors,
  });
});

app.listen(port, () => console.log(`Running on port ${port}`));
