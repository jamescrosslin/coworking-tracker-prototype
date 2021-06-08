const express = require('express');
const {
  getTasks,
  createTask,
  deleteTask,
  finishTask,
  getUnfinishedTask,
  resetAllTasks,
} = require('../controller/tasks');

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

router.get('/', express.static('public'), asyncHandler(getTasks));

router.get('/createTask', getUnfinishedTask, asyncHandler(createTask));
router.get('/finishTask', getUnfinishedTask, asyncHandler(finishTask));
router.get('/deleteTask', asyncHandler(deleteTask));
router.get('/resetAll', resetAllTasks);

module.exports = router;
