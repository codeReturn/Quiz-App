const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post(
    '/signup',
    [
      check('username')
        .not()
        .isEmpty(),
      check('email')
        .normalizeEmail()
        .isEmail(),
      check('name')
        .not()
        .isEmpty(),
      check('password').isLength({ min: 6 })
    ],
    usersController.signup
);
  
router.post('/login', usersController.login);

router.get('/getusers', usersController.getUsers);

router.get('/me', checkAuth, usersController.getProfile);

module.exports = router;
