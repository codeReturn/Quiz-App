const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const HttpError = require('../models/http-error');
const prisma = new PrismaClient();

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { username, name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return next(new HttpError('Username already exists!', 422));
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return next(new HttpError('Email already exists!', 422));
    }

    if (password.length < 6) {
      return next(new HttpError('Password must be at least 6 characters long.', 400));
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      return next(new HttpError('Username must only contain letters and numbers.', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { username, name, email, password: hashedPassword }
    });

    res.status(201).json({ message: 'success' });
  } catch (err) {
    return next(new HttpError('Signing up failed, please try again later.', 500));
  }
};

const login = async (req, res, next) => {
  const { username, password, rememberme } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (!existingUser) {
      return next(new HttpError('Invalid credentials, could not log you in.', 403));
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return next(new HttpError('Invalid credentials, could not log you in.', 403));
    }

    const expiresIn = rememberme ? '1y' : '1h';
    const token = jwt.sign(
      { userId: existingUser.id, username: existingUser.username },
      process.env.SECRET || '',
      { expiresIn }
    );

    res.json({
      userId: existingUser.id,
      username: existingUser.username,
      token,
      expirationDate: new Date(Date.now() + (rememberme ? 31536000000 : 3600000)).toISOString(),
      message: 'success'
    });
  } catch (err) {
    return next(new HttpError('Logging in failed, please try again later.', 500));
  }
};

const getUsers = async (req, res, next) => {
  let users;
  
  try {
    users = await prisma.user.findMany({ 
        select: {
          username: true,
          id: true
        } 
    })
  } catch (err) {
    return next(new HttpError('Error while fetching users', 500));
  }

  res.status(201).json({ users })
} 

const getProfile = async (req, res, next) => {
  let user;

  try {
     user = await prisma.user.findUnique({
      where: { id: req.userData.userId },
      omit: {
        password: true
      }
     })
  } catch (err) {
    console.log(err)
    return next(new HttpError('Error while fetching user', 500));
  }

  res.status(201).json({ user })
}

exports.signup = signup;
exports.login = login;
exports.getUsers = getUsers;
exports.getProfile = getProfile;