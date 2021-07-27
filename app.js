require('dotenv').config();
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

app.use(express.static('public'));

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app
  .route('/')
  .get((req, res) =>
    res.render('tasks', { apiKey: process.env.API_KEY, test: process.env.ENV === 'dev' }),
  );

const tasksRoute = require('./routes/tasks');
app.use('/tasks', tasksRoute);

app.use((err, _req, res, _next) => {
  const errors = err.validationErrors || err.errors || ['No further information'];
  console.log(err);
  res.status(200).json({
    message: err.message,
    error: errors,
  });
});

app.listen(port, () => console.log(`Running on port ${port}`));
