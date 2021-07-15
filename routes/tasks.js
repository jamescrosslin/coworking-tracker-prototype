const express = require('express');
const {
  getTasks,
  createTask,
  deleteTask,
  finishTask,
  getUnfinishedTask,
  resetAllTasks,
} = require('../controller/tasks');
const { checkTimingSafe } = require('../middleware');

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      return await cb(req, res, next);
    } catch (err) {
      // checks for user input related errors
      if (
        err.name === 'SequelizeValidationError' ||
        err.name === 'SequelizeUniqueConstraintError'
      ) {
        // creates user facing error messages
        err.validationErrors = err.errors.map((err) => err.message);
        err.status = 400;
        err.message = 'Submission was invalid.';
      }
      // pass along error to global error handler
      return next(err);
    }
  };
}
const router = express.Router();

router.get('/', asyncHandler(getTasks));

// legacy code for posterity - replaced by checkTimingSafe middleware
// router.use((req, res, next) => {
//   req.query.key !== process.env.API_KEY
//     ? res.json({ message: 'You are not authorized to use this api.' })
//     : next();
// });

router.use(checkTimingSafe);

router.get('/createTask', getUnfinishedTask, asyncHandler(createTask));
router.get('/finishTask', getUnfinishedTask, asyncHandler(finishTask));
router.get('/deleteTask', asyncHandler(deleteTask));
router.get('/resetAll', resetAllTasks);

module.exports = router;
