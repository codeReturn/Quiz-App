const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const usersRoutes = require('./routes/users-routes');
const appRoutes = require('./routes/app-routes');
const HttpError = require('./models/http-error');

const app = express();
const http = require('http').Server(app);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const port = process.env.PORT || 5000;

app.use(bodyParser.json());

const cors = require('cors');
var corsOptions = {
    origin: 'https://quiz.san-company.com',
    optionsSuccessStatus: 200,
    methods: "GET, PUT, PATCH, DELETE, POST",
    credentials: true
}

app.use(cors(corsOptions));

app.use('/quizserver/uploads/images', express.static(path.join('uploads', 'images')));
app.use('/quizserver/api/users', usersRoutes);
app.use('/quizserver/api/app', appRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

prisma.$connect()
  .then(() => {
    http.listen(port, () => {
      console.log(`Server started on port ${port}...`);
    });
  })
  .catch((err) => console.log(err));
