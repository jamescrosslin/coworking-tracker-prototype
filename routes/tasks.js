const express = require('express');
const { getTasks, createTask, deleteTask, finishTask } = require('../controller/tasks');

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
router.use('/createTask', asyncHandler(createTask));
router.use('/finishTask', asyncHandler(finishTask));
router.use('deleteTask', asyncHandler(deleteTask));

router.use(express.static('public'));

router.use('/', asyncHandler(getTasks));

module.exports = router;
