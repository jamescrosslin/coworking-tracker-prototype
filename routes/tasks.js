const express = require('express');
const { getPosts, createPost, deletePost, finishPost } = require('../controller/posts');

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
router.use('/createTask', asyncHandler(createPost));
router.use('/finishTask', asyncHandler(finishPost));
router.use('deleteTask', asyncHandler(deletePost));

router.use(express.static('public'));

router.use('/', asyncHandler(getPosts));

module.exports = router;
